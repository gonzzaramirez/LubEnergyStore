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
  
  // Color primario VERDE (Ajustable a tu tono específico)
  private readonly brandColor = '#10b981'; 
  private readonly darkColor = '#111111';

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada. Los emails no se enviarán.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  }

  // Formatear precio en pesos argentinos con separadores de miles
  private formatPrice(price: number): string {
    // Formatear manualmente para evitar dependencia de locales del sistema
    const formatted = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted}`;
  }

  private getBaseStyles(): string {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f5; 
          -webkit-font-smoothing: antialiased;
        }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; padding-bottom: 40px; }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: #ffffff; 
          border-radius: 16px; /* Más redondeado */
          overflow: hidden;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        
        /* HEADER */
        .header { background-color: ${this.darkColor}; padding: 40px 0; text-align: center; }
        .logo-text { color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -1px; margin: 0; text-transform: uppercase; }
        .logo-accent { color: ${this.brandColor}; }

        /* CONTENT */
        .content { padding: 40px 32px; }
        .h1 { color: ${this.darkColor}; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: -0.5px; }
        .text { color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0; }
        
        /* STATUS PILL */
        .status-pill { 
          display: inline-block; 
          padding: 8px 16px; 
          border-radius: 100px; 
          font-size: 13px; 
          font-weight: 600; 
          text-transform: uppercase; 
          letter-spacing: 0.5px;
          margin-bottom: 24px;
        }
        /* Verde suave para fondo, verde oscuro para texto */
        .status-confirmed { background-color: #ecfdf5; color: #047857; border: 1px solid #d1fae5; }
        .status-shipped { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }

        /* ITEMS TABLE */
        .items-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 24px 0; }
        .items-table th { text-align: left; color: #a1a1aa; font-size: 12px; font-weight: 600; text-transform: uppercase; padding-bottom: 16px; border-bottom: 1px solid #f4f4f5; }
        .items-table td { padding: 16px 0; border-bottom: 1px solid #f4f4f5; color: ${this.darkColor}; font-size: 14px; font-weight: 500; }
        .items-table td.price { text-align: right; white-space: nowrap; }
        .items-table td.qty { text-align: center; color: #71717a; font-weight: 400; }
        
        /* TOTALS */
        .total-section { margin-top: 20px; text-align: right; padding-top: 20px; }
        .total-label { color: #71717a; font-size: 14px; margin-right: 12px; }
        .total-amount { color: ${this.darkColor}; font-size: 24px; font-weight: 800; letter-spacing: -1px; }

        /* SHIPPING INFO */
        .info-card { background-color: #fafafa; border-radius: 12px; padding: 24px; margin-top: 32px; border: 1px solid #f4f4f5; }
        .info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #a1a1aa; margin: 0 0 12px 0; letter-spacing: 0.5px; }
        .info-text { font-size: 14px; color: ${this.darkColor}; margin: 4px 0; font-weight: 500; }
        .info-sub { font-size: 13px; color: #71717a; font-weight: 400; }

        /* BUTTONS - Rediseñado */
        .btn-container { text-align: center; margin-top: 40px; margin-bottom: 10px; }
        .btn { 
          background-color: ${this.brandColor}; 
          color: #ffffff; /* Texto blanco para mejor contraste en botón sólido */
          padding: 18px 40px; 
          border-radius: 12px; 
          text-decoration: none; 
          font-weight: 600; 
          font-size: 16px; 
          display: inline-block;
          /* Sombra suave coloreada */
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); 
          transition: all 0.2s;
          border: 1px solid transparent;
        }
        .btn:hover {
          opacity: 0.95;
          transform: translateY(-1px);
        }
        
        /* FOOTER */
        .footer { background-color: #f9fafb; padding: 40px 30px; text-align: center; border-top: 1px solid #f4f4f5; }
        .footer-text { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0; }
        .legal-disclaimer { 
          margin-top: 24px; 
          padding-top: 24px; 
          border-top: 1px dashed #e4e4e7; 
          color: #d4d4d8; 
          font-size: 11px; 
          text-align: center;
        }
        .wp-link { 
            color: ${this.darkColor}; 
            background: #ffffff;
            border: 1px solid #e4e4e7;
            padding: 10px 20px;
            border-radius: 8px;
            text-decoration: none; 
            font-weight: 600; 
            font-size: 14px;
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            margin-top: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
      </style>
    `;
  }

  private generateHeader(): string {
    return `
      <div class="header">
        <h1 class="logo-text">Lub <span class="logo-accent">Energy</span></h1>
      </div>
    `;
  }

  private generateFooter(whatsappNumber: string = '5491112345678'): string {
    return `
      <div class="footer">
        <p class="footer-text">¿Necesitás ayuda con tu pedido?</p>
        
        <a href="https://wa.me/${whatsappNumber}" class="wp-link">
          💬 Contactar por WhatsApp
        </a>
        
        <p class="footer-text" style="margin-top: 30px; font-size: 12px;">
          © ${new Date().getFullYear()} ${this.storeName}.
        </p>

        <div class="legal-disclaimer">
          Este correo electrónico es un comprobante informativo de su pedido y no tiene validez como factura legal ni documento fiscal.
        </div>
      </div>
    `;
  }

  private generateItemsTable(items: OrderItem[]): string {
    const rows = items
      .map(
        (item) => `
        <tr>
          <td>${item.productName}</td>
          <td class="qty">x${item.quantity}</td>
          <td class="price">${this.formatPrice(item.unitPrice * item.quantity)}</td>
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
            <th style="text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
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
        <div class="wrapper">
          <div class="container">
            ${this.generateHeader()}
            
            <div class="content">
              <div style="text-align: center;">
                <span class="status-pill status-confirmed">Pago Confirmado</span>
                <h2 class="h1">¡Gracias, ${data.customer.firstName}!</h2>
                <p class="text">Recibimos tu pago correctamente. Estamos preparando tu pedido #${data.orderId.slice(0, 8).toUpperCase()}.</p>
              </div>

              ${this.generateItemsTable(data.items)}
              
              <div class="total-section">
                <span class="total-label">Total pagado</span>
                <span class="total-amount">${this.formatPrice(data.totalAmount)}</span>
              </div>
              
              <div class="info-card">
                <p class="info-title">Envío a domicilio</p>
                <p class="info-text">${data.customer.street} ${data.customer.apartment || ''}</p>
                <p class="info-sub">${data.customer.city}, ${data.customer.province}</p>
                <p class="info-sub" style="margin-top: 8px;">Recibe: ${data.customer.firstName} ${data.customer.lastName}</p>
              </div>

              <div class="btn-container">
                <a href="${data.trackingUrl}" class="btn">Ver mi Pedido</a>
              </div>
            </div>

            ${this.generateFooter()}
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: `${this.storeName} <${this.fromEmail}>`,
        to: data.customer.email,
        subject: `Confirmamos tu pedido #${data.orderId.slice(0, 8).toUpperCase()}`,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
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
        <div class="wrapper">
          <div class="container">
            ${this.generateHeader()}
            
            <div class="content">
              <div style="text-align: center;">
                <span class="status-pill status-shipped">Enviado</span>
                <h2 class="h1">¡Tu pedido está en camino!</h2>
                <p class="text">Despachamos tus productos por medio de <strong>${data.courierName || 'Correo'}</strong>.</p>
              </div>

              <div style="background-color: #f9fafb; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; text-align: center; margin: 30px 0;">
                <p style="margin: 0 0 8px 0; color: #a1a1aa; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Tracking Code</p>
                <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 1px; color: ${this.darkColor}; font-weight: 700;">${data.trackingCode}</p>
              </div>

              <div class="btn-container">
                <a href="${data.trackingUrl}" class="btn">Seguir envío</a>
              </div>

              <div class="info-card">
                 <p class="info-title">Destino</p>
                 <p class="info-text">${data.customer.street}, ${data.customer.city}</p>
              </div>
            </div>

            ${this.generateFooter()}
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      await this.resend.emails.send({
        from: `${this.storeName} <${this.fromEmail}>`,
        to: data.customer.email,
        subject: `🚚 En camino - Pedido #${data.orderId.slice(0, 8).toUpperCase()}`,
        html,
      });
      return true;
    } catch (error) {
      this.logger.error(`Error enviando email: ${error.message}`);
      return false;
    }
  }
}