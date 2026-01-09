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
  
  // Colores de marca
  private readonly colors = {
    background: '#000000',      // Fondo principal
    card: '#121212',            // Fondo de contenedores
    text: '#ffffff',            // Texto principal
    textMuted: '#a1a1aa',       // Texto secundario (gris claro)
    border: '#27272a',          // Bordes sutiles
    primary: '#22c55e',         // VERDE LUB ENERGY (ajustable a tu tono exacto)
    primaryText: '#000000',     // Texto sobre el verde (para botones)
  };

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY no configurada. Los emails no se enviarán.');
    }
    this.resend = new Resend(apiKey);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  }

  private formatPrice(cents: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  }

  private getBaseStyles(): string {
    return `
      <style>
        /* Reset & Base */
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          background-color: ${this.colors.background}; 
          color: ${this.colors.text};
          -webkit-font-smoothing: antialiased;
        }
        
        /* Layout */
        .wrapper { width: 100%; background-color: ${this.colors.background}; padding: 40px 0; }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: ${this.colors.card}; 
          border-radius: 16px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          border: 1px solid ${this.colors.border};
        }
        
        /* Header */
        .header { 
          padding: 40px 40px 20px 40px; 
          text-align: center; 
          border-bottom: 1px solid ${this.colors.border};
        }
        .brand { 
          font-size: 24px; 
          font-weight: 800; 
          color: ${this.colors.text}; 
          letter-spacing: -0.5px;
          text-transform: uppercase;
        }
        .brand span { color: ${this.colors.primary}; }

        /* Content */
        .content { padding: 40px; }
        
        /* Typography */
        h1 { margin: 0 0 15px 0; font-size: 28px; font-weight: 700; color: ${this.colors.text}; letter-spacing: -0.5px; text-align: center; }
        h2 { margin: 0 0 10px 0; font-size: 20px; font-weight: 600; color: ${this.colors.text}; }
        h3 { margin: 25px 0 15px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: ${this.colors.textMuted}; }
        p { margin: 0 0 10px 0; font-size: 15px; line-height: 1.6; color: ${this.colors.textMuted}; }
        
        /* Components */
        .status-badge { 
          display: inline-block; 
          padding: 8px 16px; 
          background-color: rgba(34, 197, 94, 0.1); 
          color: ${this.colors.primary}; 
          border: 1px solid ${this.colors.primary};
          border-radius: 50px; 
          font-size: 13px; 
          font-weight: 600; 
          letter-spacing: 0.5px;
          margin-bottom: 20px;
        }
        
        .divider { height: 1px; background-color: ${this.colors.border}; margin: 30px 0; border: none; }
        
        /* Data Display */
        .info-grid { display: table; width: 100%; margin-bottom: 20px; }
        .info-col { display: table-cell; vertical-align: top; width: 50%; }
        
        /* Items Table */
        .items-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .items-table th { 
          text-align: left; 
          padding: 10px 0; 
          color: ${this.colors.textMuted}; 
          font-size: 12px; 
          text-transform: uppercase; 
          font-weight: 600;
          border-bottom: 1px solid ${this.colors.border};
        }
        .items-table td { 
          padding: 15px 0; 
          border-bottom: 1px solid ${this.colors.border}; 
          color: ${this.colors.text};
          font-size: 15px;
        }
        .items-table .price { text-align: right; font-weight: 600; color: ${this.colors.text}; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-label { color: ${this.colors.textMuted}; margin-right: 15px; font-size: 14px; }
        .total-amount { font-size: 24px; font-weight: 700; color: ${this.colors.primary}; }

        /* Tracking Box */
        .tracking-box { 
          background-color: rgba(255, 255, 255, 0.05); 
          border: 1px solid ${this.colors.border};
          border-radius: 12px; 
          padding: 25px; 
          text-align: center; 
          margin: 30px 0; 
        }
        .tracking-code { 
          font-family: monospace; 
          font-size: 22px; 
          color: ${this.colors.text}; 
          background: rgba(0,0,0,0.3);
          padding: 10px 20px;
          border-radius: 8px;
          display: inline-block;
          margin: 10px 0;
          letter-spacing: 2px;
        }

        /* Button */
        .btn { 
          display: block; 
          width: 100%;
          padding: 16px 0; 
          background-color: ${this.colors.primary}; 
          color: ${this.colors.primaryText}; 
          text-decoration: none; 
          border-radius: 12px; 
          font-weight: 700; 
          text-align: center; 
          font-size: 16px;
          transition: opacity 0.2s;
        }
        .btn:hover { opacity: 0.9; }
        
        /* Footer */
        .footer { 
          padding: 30px; 
          text-align: center; 
          font-size: 13px; 
          color: ${this.colors.textMuted}; 
          background-color: #000000;
          border-top: 1px solid ${this.colors.border};
        }
        .footer a { color: ${this.colors.textMuted}; text-decoration: underline; }
      </style>
    `;
  }

  private generateItemsTable(items: OrderItem[]): string {
    const rows = items
      .map(
        (item) => `
        <tr>
          <td>
            <div style="font-weight: 500; color: #fff;">${item.productName}</div>
            <div style="font-size: 13px; color: #a1a1aa;">Cant: ${item.quantity}</div>
          </td>
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
            <th style="text-align: right;">Total</th>
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
      <div class="info-grid">
        <div class="info-col">
          <h3>Envío a</h3>
          <p style="color: #ffffff; font-weight: 500;">${customer.firstName} ${customer.lastName}</p>
          <p>${address}</p>
          <p>${customer.city}, ${customer.province}</p>
        </div>
        <div class="info-col">
          <h3>Contacto</h3>
          <p>${customer.email}</p>
          <p>${customer.phone}</p>
          <p>DNI: ${customer.dni}</p>
        </div>
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
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="brand">LUB <span>ENERGY</span></div>
            </div>
            
            <div class="content">
              <div style="text-align: center; margin-bottom: 30px;">
                <div class="status-badge">✓ PAGO EXITOSO</div>
                <h1>¡Gracias, ${data.customer.firstName}!</h1>
                <p>Tu pedido ha sido confirmado y estamos preparándolo.</p>
                <p style="font-size: 13px; margin-top: 5px;">Orden #${data.orderId.slice(0, 8).toUpperCase()}</p>
              </div>

              <hr class="divider">
              
              ${this.generateCustomerInfo(data.customer)}
              
              <h3>Resumen de compra</h3>
              ${this.generateItemsTable(data.items)}
              
              <div class="total-section">
                <span class="total-label">Total Pagado</span>
                <span class="total-amount">${this.formatPrice(data.totalAmount)}</span>
              </div>

              <div style="margin-top: 40px;">
                <a href="${data.trackingUrl}" class="btn">Ver Estado del Pedido</a>
              </div>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} ${this.storeName}. Elevá tu energía.</p>
              <p>¿Necesitás ayuda? Respondé a este correo.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.resend.emails.send({
        from: `${this.storeName} <${this.fromEmail}>`,
        to: data.customer.email,
        subject: `Confirmación de Pedido #${data.orderId.slice(0, 8).toUpperCase()}`,
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
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="brand">LUB <span>ENERGY</span></div>
            </div>
            
            <div class="content">
              <div style="text-align: center; margin-bottom: 30px;">
                <div class="status-badge">🚚 ENVIADO</div>
                <h1>¡Tu pedido está en camino!</h1>
                <p>Tu suplementación ya salió de nuestro depósito.</p>
              </div>

              <div class="tracking-box">
                <p style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px; font-weight: 700; color: ${this.colors.primary};">
                  ${data.courierName ? data.courierName : 'Código de seguimiento'}
                </p>
                <div class="tracking-code">${data.trackingCode}</div>
                <p style="font-size: 13px; margin-top: 10px;">Copiá el código para rastrearlo en la web del correo.</p>
              </div>
              
              <hr class="divider">

              <h3>Detalle del envío</h3>
              ${this.generateCustomerInfo(data.customer)}
              
              <h3 style="margin-top: 30px;">Contenido del paquete</h3>
              ${this.generateItemsTable(data.items)}

              <div style="margin-top: 40px;">
                <a href="${data.trackingUrl}" class="btn">Rastrear Pedido</a>
              </div>
            </div>

            <div class="footer">
              <p>© ${new Date().getFullYear()} ${this.storeName}. Elevá tu energía.</p>
            </div>
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