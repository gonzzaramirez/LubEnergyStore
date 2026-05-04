import { Injectable, Logger } from '@nestjs/common';

export interface EvolutionConnectionState {
  state: 'open' | 'close' | 'connecting' | string;
}

export interface EvolutionQrResponse {
  qrcode?: {
    base64?: string;
    code?: string;
  };
  base64?: string;
}

@Injectable()
export class EvolutionProvider {
  private readonly logger = new Logger(EvolutionProvider.name);
  private readonly instanceName = 'lubenergy-admin';

  private get baseUrl(): string {
    return process.env.EVOLUTION_API_URL ?? '';
  }

  private get apiKey(): string {
    return process.env.EVOLUTION_API_KEY ?? '';
  }

  private headers(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      apikey: this.apiKey,
    };
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    timeoutMs = 15000,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`Evolution API ${res.status}: ${text}`);
      }

      return res.json() as Promise<T>;
    } finally {
      clearTimeout(timer);
    }
  }

  async getConnectionState(): Promise<EvolutionConnectionState> {
    return this.request<EvolutionConnectionState>(
      'GET',
      `/instance/connectionState/${this.instanceName}`,
    );
  }

  async createInstance(): Promise<EvolutionQrResponse> {
    return this.request<EvolutionQrResponse>('POST', '/instance/create', {
      instanceName: this.instanceName,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
      rejectCall: true,
      msgCall: '',
      groupsIgnore: true,
      alwaysOnline: false,
      readMessages: false,
      readStatus: false,
    });
  }

  async connectInstance(): Promise<EvolutionQrResponse> {
    return this.request<EvolutionQrResponse>(
      'POST',
      `/instance/connect/${this.instanceName}`,
    );
  }

  async logoutInstance(): Promise<void> {
    await this.request('DELETE', `/instance/logout/${this.instanceName}`);
  }

  async sendText(phone: string, text: string): Promise<void> {
    await this.request('POST', `/message/sendText/${this.instanceName}`, {
      number: this.normalizePhone(phone),
      text,
      options: {
        delay: 1200,
        presence: 'composing',
      },
    });
  }

  /** Normaliza teléfonos argentinos al formato E.164 sin + */
  normalizePhone(raw: string): string {
    let digits = raw.replace(/\D/g, '');

    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }

    if (!digits.startsWith('54')) {
      digits = '54' + digits;
    }

    // Insertar el 9 para celulares argentinos: 54 + código de área + número
    // 54 + 11 + 8 dígitos → 5491188888888
    if (digits.startsWith('54') && digits.length === 12) {
      digits = '549' + digits.slice(2);
    }

    return digits;
  }

  getInstanceName(): string {
    return this.instanceName;
  }
}
