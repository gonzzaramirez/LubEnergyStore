import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dni: string;
  street: string;
  apartment?: string;
  city: string;
  province: string;
}

interface OrderEmailData {
  orderId: string;
  customer: CustomerData;
  items: OrderItem[];
  totalAmount: number;
  trackingCode?: string;
  courierName?: string;
  trackingUrl: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private readonly fromEmail: string;
  private readonly storeName = 'LUB ENERGY';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada. Los emails no se enviarán.');
    }
    this.resend = new Resend(apiKey);
    // En desarrollo usa el email de prueba de Resend, en producción usa tu dominio
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  private formatPrice(cents: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(cents / 100);
  }

  private getBaseStyles(): string {
    return `
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #1a1a1a; color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: #f59e0b; }
        .content { padding: 30px; }
        .order-info { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .order-id { font-size: 14px; color: #6b7280; margin-bottom: 5px; }
        .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; }
        .status-confirmed { background-color: #d1fae5; color: #065f46; }
        .status-shipped { background-color: #dbeafe; color: #1e40af; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th { background-color: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280; }
        .items-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .total-row { font-weight: 700; font-size: 18px; color: #1a1a1a; }
        .customer-info { background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .customer-info h3 { margin-top: 0; color: #374151; font-size: 16px; }
        .customer-info p { margin: 5px 0; color: #6b7280; font-size: 14px; }
        .tracking-box { background-color: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .tracking-code { font-size: 24px; font-weight: 700; color: #92400e; letter-spacing: 2px; }
        .btn { display: inline-block; padding: 14px 28px; background-color: #f59e0b; color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 15px; }
        .footer { background-color: #1a1a1a; color: #9ca3af; padding: 20px; text-align: center; font-size: 12px; }
        .footer a { color: #f59e0b; }
      </style>
    `;
  }

  private generateItemsTable(items: OrderItem[]): string {
    const rows = items
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">${this.formatPrice(item.unitPrice)}</td>
          <td style="text-align: right;">${this.formatPrice(item.unitPrice * item.quantity)}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <table class="items-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th style="text-align: center;">Cant.</th>
            <th style="text-align: right;">Precio</th>
            <th style="text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  private generateCustomerInfo(customer: CustomerData): string {
    const address = customer.apartment
      ? `${customer.street}, ${customer.apartment}`
      : customer.street;

    return `
      <div class="customer-info">
        <h3>📦 Datos de envío</h3>
        <p><strong>${customer.firstName} ${customer.lastName}</strong></p>
        <p>${address}</p>
        <p>${customer.city}, ${customer.province}</p>
        <p>📞 ${customer.phone}</p>
        <p>🪪 DNI: ${customer.dni}</p>
      </div>
    `;
  }

  async sendOrderConfirmation(data: OrderEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛢️ ${this.storeName}</h1>
          </div>
          <div class="content">
            <div class="order-info">
              <p class="order-id">Pedido #${data.orderId.slice(0, 8).toUpperCase()}</p>
              <span class="status status-confirmed">✓ PAGO CONFIRMADO</span>
            </div>
            
            <h2 style="color: #1a1a1a;">¡Gracias por tu compra, ${data.customer.firstName}!</h2>
            <p style="color: #6b7280;">Tu pago ha sido confirmado. Estamos preparando tu pedido para enviarlo lo antes posible.</p>
            
            <h3 style="color: #374151;">Detalle de tu pedido</h3>
            ${this.generateItemsTable(data.items)}
            
            <div style="text-align: right; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
              <span class="total-row">Total: ${this.formatPrice(data.totalAmount)}</span>
            </div>
            
            ${this.generateCustomerInfo(data.customer)}
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #6b7280;">Podés seguir el estado de tu pedido en:</p>
              <a href="${data.trackingUrl}" class="btn">Ver estado del pedido</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${this.storeName}. Todos los derechos reservados.</p>
            <p>Si tenés alguna consulta, respondé a este email o contactanos por WhatsApp.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from: `${this.storeName} <${this.fromEmail}>`,
        to: data.customer.email,
        subject: `✓ Pago confirmado - Pedido #${data.orderId.slice(0, 8).toUpperCase()}`,
        html,
      });

      this.logger.log(`Email de confirmación enviado a ${data.customer.email}: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email de confirmación: ${error.message}`);
      return false;
    }
  }

  async sendTrackingUpdate(data: OrderEmailData): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${this.getBaseStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛢️ ${this.storeName}</h1>
          </div>
          <div class="content">
            <div class="order-info">
              <p class="order-id">Pedido #${data.orderId.slice(0, 8).toUpperCase()}</p>
              <span class="status status-shipped">🚚 ENVIADO</span>
            </div>
            
            <h2 style="color: #1a1a1a;">¡Tu pedido está en camino!</h2>
            <p style="color: #6b7280;">Hemos despachado tu pedido. Usá el código de seguimiento para rastrearlo.</p>
            
            <div class="tracking-box">
              <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px;">
                ${data.courierName ? `Enviado por: <strong>${data.courierName}</strong>` : 'Código de seguimiento:'}
              </p>
              <p class="tracking-code">${data.trackingCode}</p>
            </div>
            
            <h3 style="color: #374151;">Productos enviados</h3>
            ${this.generateItemsTable(data.items)}
            
            ${this.generateCustomerInfo(data.customer)}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${data.trackingUrl}" class="btn">Ver estado del pedido</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${this.storeName}. Todos los derechos reservados.</p>
            <p>Si tenés alguna consulta, respondé a este email o contactanos por WhatsApp.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from: `${this.storeName} <${this.fromEmail}>`,
        to: data.customer.email,
        subject: `🚚 Tu pedido está en camino - #${data.orderId.slice(0, 8).toUpperCase()}`,
        html,
      });

      this.logger.log(`Email de tracking enviado a ${data.customer.email}: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email de tracking: ${error.message}`);
      return false;
    }
  }
}
