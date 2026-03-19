import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { KapsoService } from '../kapso/kapso.service';

const REMINDER_AFTER_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OrderPaymentRemindersService {
  private readonly logger = new Logger(OrderPaymentRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly kapsoService: KapsoService,
  ) {}

  private getTrackingUrl(orderId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/pedido/${orderId}`;
  }

  private buildOwnerAbandonmentWaBody(order: {
    id: string;
    totalAmount: number;
    paymentUrl: string | null;
    guestCustomer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dni: string;
      street: string;
      apartment: string | null;
      city: string;
      province: string;
    };
    items: { productName: string; quantity: number; unitPrice: number }[];
  }): string {
    const short = order.id.slice(0, 8).toUpperCase();
    const lines = [
      `Lub Energy — Pago sin confirmar (24h)`,
      `Pedido #${short}`,
      `Total: $${order.totalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`,
      '',
      `Cliente: ${order.guestCustomer.firstName} ${order.guestCustomer.lastName}`,
      `Email: ${order.guestCustomer.email}`,
      `Tel: ${order.guestCustomer.phone}`,
      `DNI: ${order.guestCustomer.dni}`,
      `Envío: ${order.guestCustomer.street} ${order.guestCustomer.apartment || ''}, ${order.guestCustomer.city}, ${order.guestCustomer.province}`,
      '',
      'Ítems:',
      ...order.items.map(
        (i) =>
          `- ${i.productName} x${i.quantity} ($${(i.unitPrice * i.quantity).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')})`,
      ),
    ];
    if (order.paymentUrl) {
      lines.push('', `Pagar (Talo): ${order.paymentUrl}`);
    }
    return lines.join('\n');
  }

  @Cron('0 */15 * * * *')
  async processStalePendingPayments(): Promise<void> {
    const cutoff = new Date(Date.now() - REMINDER_AFTER_MS);

    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        deletedAt: null,
        paymentUrl: { not: null },
        paymentInitiatedAt: { lte: cutoff },
        OR: [
          { pendingPaymentReminderSentAt: null },
          { pendingPaymentOwnerNotifiedAt: null },
        ],
      },
      include: {
        guestCustomer: true,
        items: true,
      },
    });

    for (const order of orders) {
      if (!order.guestCustomer) {
        continue;
      }

      const trackingUrl = this.getTrackingUrl(order.id);
      const ownerPayload = {
        orderId: order.id,
        orderCreatedAt: order.createdAt,
        customer: {
          firstName: order.guestCustomer.firstName,
          lastName: order.guestCustomer.lastName,
          email: order.guestCustomer.email,
          phone: order.guestCustomer.phone,
          dni: order.guestCustomer.dni,
          street: order.guestCustomer.street,
          apartment: order.guestCustomer.apartment || undefined,
          city: order.guestCustomer.city,
          province: order.guestCustomer.province,
        },
        items: order.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: order.totalAmount,
        trackingUrl,
        paymentUrl: order.paymentUrl,
      };

      if (!order.pendingPaymentReminderSentAt) {
        if (!order.paymentUrl) {
          continue;
        }
        const ok = await this.emailService.sendPendingPaymentReminder({
          orderId: order.id,
          orderCreatedAt: order.createdAt,
          customer: ownerPayload.customer,
          paymentUrl: order.paymentUrl,
          trackingUrl,
        });
        if (ok) {
          await this.prisma.order.update({
            where: { id: order.id },
            data: { pendingPaymentReminderSentAt: new Date() },
          });
          this.logger.log(
            `Recordatorio de pago enviado al cliente (pedido ${order.id.slice(0, 8)})`,
          );
        }
      }

      if (!order.pendingPaymentOwnerNotifiedAt) {
        const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL?.trim();
        let emailOk = true;
        if (ownerEmail) {
          emailOk = await this.emailService.sendOwnerPendingPaymentAlert(
            ownerPayload,
          );
        }
        if (!emailOk) {
          continue;
        }
        await this.kapsoService.sendTextToOwner(
          this.buildOwnerAbandonmentWaBody({
            id: order.id,
            totalAmount: order.totalAmount,
            paymentUrl: order.paymentUrl,
            guestCustomer: order.guestCustomer,
            items: order.items,
          }),
        );
        await this.prisma.order.update({
          where: { id: order.id },
          data: { pendingPaymentOwnerNotifiedAt: new Date() },
        });
        this.logger.log(
          `Aviso al dueño por abandono (pedido ${order.id.slice(0, 8)})`,
        );
      }
    }
  }
}
