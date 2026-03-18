import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreatePaymentRequest, TaloClient, TaloEnvironment } from 'talo-pay';
import { CreatePlaygroundPaymentDto } from './dto/create-playground-payment.dto';

type RawClientData = NonNullable<CreatePaymentRequest['client_data']>;

@Injectable()
export class TaloPlaygroundService {
  private readonly logger = new Logger(TaloPlaygroundService.name);

  private getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || !value.trim()) {
      throw new InternalServerErrorException(
        `Falta variable de entorno requerida: ${name}`,
      );
    }
    return value.trim();
  }

  private getEnvironment(): TaloEnvironment {
    return process.env.TALO_ENVIRONMENT === 'production'
      ? 'production'
      : 'sandbox';
  }

  private getClient(): TaloClient {
    return new TaloClient({
      clientId: this.getRequiredEnv('TALO_CLIENT_ID'),
      clientSecret: this.getRequiredEnv('TALO_CLIENT_SECRET'),
      userId: this.getRequiredEnv('TALO_USER_ID'),
      environment: this.getEnvironment(),
    });
  }

  private getWebhookUrl(overrideWebhookUrl?: string): string {
    if (overrideWebhookUrl) {
      return overrideWebhookUrl;
    }

    const webhookUrl = process.env.TALO_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.trim()) {
      throw new InternalServerErrorException(
        'Configurá TALO_WEBHOOK_URL para probar creación de pagos en playground',
      );
    }

    return webhookUrl.trim();
  }

  private getRedirectUrl(overrideRedirectUrl?: string): string | undefined {
    if (overrideRedirectUrl) {
      return overrideRedirectUrl;
    }

    const frontendUrl = process.env.FRONTEND_URL;
    return frontendUrl?.trim();
  }

  private buildClientData(dto: CreatePlaygroundPaymentDto): RawClientData | undefined {
    const clientData: RawClientData = {
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email,
      phone: dto.phone,
      dni: dto.dni,
    };

    const hasAnyValue = Object.values(clientData).some((value) => Boolean(value));
    return hasAnyValue ? clientData : undefined;
  }

  async createPayment(dto: CreatePlaygroundPaymentDto = {}) {
    const amount = dto.amount ?? 1500;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('El monto debe ser un número mayor a 0');
    }

    const request: CreatePaymentRequest = {
      user_id: this.getRequiredEnv('TALO_USER_ID'),
      price: {
        amount,
        currency: 'ARS',
      },
      payment_options: ['transfer'],
      external_id: dto.externalId?.trim() || `playground_${Date.now()}`,
      webhook_url: this.getWebhookUrl(dto.webhookUrl),
      redirect_url: this.getRedirectUrl(dto.redirectUrl),
      motive: dto.motive?.trim() || 'Pago de prueba desde playground',
      client_data: this.buildClientData(dto),
    };

    const payment = await this.getClient().payments.create(request);

    this.logger.log(
      `Pago sandbox creado. id=${payment.id} status=${payment.payment_status} external_id=${payment.external_id ?? 'n/a'}`,
    );

    return {
      id: payment.id,
      externalId: payment.external_id ?? null,
      paymentStatus: payment.payment_status,
      paymentUrl: payment.payment_url ?? null,
      webhookUrl: request.webhook_url,
      redirectUrl: payment.redirect_url ?? request.redirect_url ?? null,
      raw: payment,
    };
  }

  async getPayment(paymentId: string) {
    const trimmedPaymentId = paymentId?.trim();
    if (!trimmedPaymentId) {
      throw new BadRequestException('paymentId es requerido');
    }

    const payment = await this.getClient().payments.get(trimmedPaymentId);
    return {
      id: payment.id,
      externalId: payment.external_id ?? null,
      paymentStatus: payment.payment_status,
      paymentUrl: payment.payment_url ?? null,
      redirectUrl: payment.redirect_url ?? null,
      raw: payment,
    };
  }

  async handleWebhookPayload(payload: unknown) {
    try {
      const rawBody =
        typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});

      const client = this.getClient();
      const parsed = client.webhooks.parseRaw(rawBody);
      const payment = await client.payments.get(parsed.event.paymentId);

      this.logger.log(
        `Webhook sandbox recibido. paymentId=${parsed.event.paymentId} externalId=${parsed.event.externalId} status=${payment.payment_status}`,
      );

      return {
        ok: true,
        event: parsed.event,
        payment: {
          id: payment.id,
          status: payment.payment_status,
          externalId: payment.external_id ?? null,
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      throw new BadRequestException(`Webhook inválido para playground: ${message}`);
    }
  }
}
