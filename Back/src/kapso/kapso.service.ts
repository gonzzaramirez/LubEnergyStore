import { Injectable, Logger } from '@nestjs/common';
import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';

@Injectable()
export class KapsoService {
  private readonly logger = new Logger(KapsoService.name);

  private static readonly KAPSO_BASE_URL = 'https://api.kapso.ai/meta/whatsapp';

  isEnabled(): boolean {
    const key = process.env.KAPSO_API_KEY?.trim();
    const phoneId = process.env.KAPSO_WHATSAPP_PHONE_NUMBER_ID?.trim();
    const owner = process.env.OWNER_WHATSAPP_E164?.trim();
    return Boolean(key && phoneId && owner);
  }

  /**
   * Envía texto al dueño (OWNER_WHATSAPP_E164) desde el número configurado en Kapso.
   */
  async sendTextToOwner(body: string): Promise<boolean> {
    if (!this.isEnabled()) {
      this.logger.debug('Kapso u OWNER_WHATSAPP_E164 no configurado; se omite WhatsApp.');
      return false;
    }

    const kapsoApiKey = process.env.KAPSO_API_KEY!.trim();
    const phoneNumberId = process.env.KAPSO_WHATSAPP_PHONE_NUMBER_ID!.trim();
    let to = process.env.OWNER_WHATSAPP_E164!.trim().replace(/\s/g, '');
    if (!to.startsWith('+')) {
      to = `+${to}`;
    }

    try {
      const client = new WhatsAppClient({
        baseUrl: KapsoService.KAPSO_BASE_URL,
        kapsoApiKey,
      });
      await client.messages.sendText({
        phoneNumberId,
        to,
        body,
      });
      return true;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error enviando WhatsApp (Kapso): ${msg}`);
      return false;
    }
  }
}
