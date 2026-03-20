import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';

const REMINDER_AFTER_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OrderPaymentRemindersService {
  private readonly logger = new Logger(OrderPaymentRemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private getTrackingUrl(orderId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/pedido/${orderId}`;
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
