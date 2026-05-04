import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvolutionProvider } from './evolution.provider';
import { WaMessageStatus, WaStatus } from '@prisma/client';

export interface SessionStatusInfo {
  status:
    | 'ready'
    | 'qr'
    | 'initializing'
    | 'disconnected'
    | 'error'
    | 'reconnecting';
  isReady: boolean;
  qr?: string | null;
  message?: string;
}

@Injectable()
export class WhatsappService implements OnModuleDestroy {
  private readonly logger = new Logger(WhatsappService.name);
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private lastReconnectAt = 0;
  private readonly RECONNECT_COOLDOWN_MS = 30_000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly evolution: EvolutionProvider,
  ) {}

  onModuleDestroy() {
    this.stopHealthCheck();
  }

  // ── Session record helpers ──────────────────────────────────────────────

  private async upsertSession(
    data: Partial<{
      status: WaStatus;
      qrCode: string | null;
      connectedSince: Date | null;
    }>,
  ) {
    await this.prisma.whatsappSession.upsert({
      where: { instanceName: this.evolution.getInstanceName() },
      create: {
        instanceName: this.evolution.getInstanceName(),
        status: data.status ?? WaStatus.DISCONNECTED,
        qrCode: data.qrCode ?? null,
        connectedSince: data.connectedSince ?? null,
      },
      update: data,
    });
  }

  // ── Start / connect ─────────────────────────────────────────────────────

  async start(): Promise<{ success: boolean; message: string; qr?: string }> {
    try {
      const state = await this.evolution.getConnectionState().catch(() => null);

      if (state?.state === 'open') {
        this.startHealthCheck();
        return { success: false, message: 'WhatsApp ya está conectado' };
      }

      let qrBase64: string | undefined;

      try {
        const created = await this.evolution.createInstance();
        qrBase64 = created?.qrcode?.base64 ?? created?.base64 ?? undefined;
      } catch (err: any) {
        const msg: string = err?.message ?? '';
        if (msg.toLowerCase().includes('already') || msg.includes('409')) {
          const connected = await this.evolution.connectInstance();
          qrBase64 =
            connected?.qrcode?.base64 ?? connected?.base64 ?? undefined;
        } else {
          throw err;
        }
      }

      await this.upsertSession({
        status: WaStatus.CONNECTING,
        qrCode: qrBase64 ?? null,
      });

      this.reconnectAttempts = 0;
      this.startHealthCheck();

      return {
        success: true,
        message: qrBase64 ? 'Escanea el código QR' : 'Conectando…',
        qr: qrBase64,
      };
    } catch (err: any) {
      this.logger.error('Error al iniciar WhatsApp', err);
      await this.upsertSession({ status: WaStatus.ERROR, qrCode: null });
      return {
        success: false,
        message: `Error: ${err?.message ?? 'desconocido'}`,
      };
    }
  }

  // ── Status ───────────────────────────────────────────────────────────────

  async getStatus(): Promise<SessionStatusInfo> {
    try {
      const evoState = await this.evolution.getConnectionState();
      const raw = evoState?.state ?? 'unknown';

      if (raw === 'open') {
        await this.upsertSession({ status: WaStatus.READY, qrCode: null });
        this.startHealthCheck();
        return { status: 'ready', isReady: true };
      }

      if (raw === 'connecting') {
        try {
          const conn = await this.evolution.connectInstance();
          const qr = conn?.qrcode?.base64 ?? conn?.base64 ?? null;
          await this.upsertSession({ status: WaStatus.CONNECTING, qrCode: qr });
          return { status: 'qr', isReady: false, qr };
        } catch {
          return { status: 'initializing', isReady: false };
        }
      }

      await this.upsertSession({ status: WaStatus.DISCONNECTED, qrCode: null });
      return { status: 'disconnected', isReady: false };
    } catch {
      const session = await this.prisma.whatsappSession
        .findUnique({
          where: { instanceName: this.evolution.getInstanceName() },
        })
        .catch(() => null);

      return {
        status: 'error',
        isReady: false,
        message:
          session?.status === WaStatus.ERROR
            ? 'Error de conexión. Reconecta manualmente.'
            : 'No se puede alcanzar la sesión de WhatsApp.',
      };
    }
  }

  // ── Logout ───────────────────────────────────────────────────────────────

  async logout(): Promise<void> {
    this.stopHealthCheck();
    try {
      await this.evolution.logoutInstance();
    } catch (err: any) {
      this.logger.warn('Evolution logout error (ignorado):', err?.message);
    }
    await this.upsertSession({
      status: WaStatus.DISCONNECTED,
      qrCode: null,
      connectedSince: null,
    });
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  async sendMessage(params: {
    phone: string;
    name: string;
    content: string;
    trackerId?: string;
  }): Promise<{ success: boolean; messageId?: string }> {
    const record = await this.prisma.whatsappMessage.create({
      data: {
        toPhone: params.phone,
        toName: params.name,
        content: params.content,
        status: WaMessageStatus.PENDING,
        relatedTrackerId: params.trackerId ?? null,
      },
    });

    try {
      await this.evolution.sendText(params.phone, params.content);

      await this.prisma.whatsappMessage.update({
        where: { id: record.id },
        data: { status: WaMessageStatus.SENT, sentAt: new Date() },
      });

      return { success: true, messageId: record.id };
    } catch (err: any) {
      await this.prisma.whatsappMessage.update({
        where: { id: record.id },
        data: {
          status: WaMessageStatus.FAILED,
          errorMessage: err?.message ?? 'Error desconocido',
        },
      });
      this.logger.error(`Fallo al enviar WA a ${params.phone}`, err);
      return { success: false };
    }
  }

  // ── Messages list ────────────────────────────────────────────────────────

  async getMessages() {
    return this.prisma.whatsappMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  // ── Health check ─────────────────────────────────────────────────────────

  startHealthCheck() {
    if (this.healthCheckInterval) return;
    this.healthCheckInterval = setInterval(
      () => this.runHealthCheck(),
      5 * 60 * 1000,
    );
    this.logger.log('Health check iniciado (cada 5 min)');
  }

  stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      this.logger.log('Health check detenido');
    }
  }

  private async runHealthCheck() {
    try {
      const state = await this.evolution.getConnectionState();
      if (state?.state === 'open') {
        this.reconnectAttempts = 0;
        return;
      }

      await this.autoReconnect();
    } catch {
      await this.autoReconnect();
    }
  }

  private async autoReconnect() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.logger.error('Máximo de intentos de reconexión alcanzado');
      this.stopHealthCheck();
      await this.upsertSession({ status: WaStatus.ERROR });
      return;
    }

    const now = Date.now();
    if (now - this.lastReconnectAt < this.RECONNECT_COOLDOWN_MS) return;

    this.reconnectAttempts++;
    this.lastReconnectAt = now;

    this.logger.log(
      `Intentando reconexión ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}`,
    );

    try {
      await this.evolution.connectInstance();
    } catch (err: any) {
      this.logger.warn('Reconexión fallida:', err?.message);
    }
  }
}
