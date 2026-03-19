import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { TaloClient, TaloEnvironment } from 'talo-pay';
import { OrdersService } from '../orders/orders.service';
import { OrderStatusUpdate } from '../orders/dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaloPaymentDto } from './dto/create-talo-payment.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ordersService: OrdersService,
  ) {}

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

  /**
   * Convierte el total interno a unidades ARS para Talo.
   * - cents: divide por 100
   * - ars: usa valor directo
   * - auto: intenta inferir unidad con base en precios guardados
   */
  private toTaloAmount(totalAmountRaw: number, unitPrices: number[] = []): number {
    if (!Number.isFinite(totalAmountRaw) || totalAmountRaw <= 0) {
      throw new BadRequestException('Monto inválido para crear pago en Talo');
    }

    const mode = (process.env.TALO_AMOUNT_MODE || 'ars').toLowerCase();
    if (mode === 'cents') {
      return Math.max(1, Math.round(totalAmountRaw / 100));
    }

    if (mode === 'ars') {
      return Math.max(1, Math.round(totalAmountRaw));
    }

    // AUTO: heurística defensiva para no subcobrar.
    // Si los unitPrice son "grandes" (ej: 4.599.000), probablemente están en centavos.
    // Si están en rango de catálogo (ej: 45.990), asumimos ARS enteros.
    if (unitPrices.length > 0) {
      const maxUnitPrice = Math.max(...unitPrices);
      if (maxUnitPrice >= 1_000_000) {
        this.logger.warn(
          `TALO_AMOUNT_MODE=auto detectó precios en centavos (max unitPrice=${maxUnitPrice}); se divide por 100`,
        );
        return Math.max(1, Math.round(totalAmountRaw / 100));
      }

      this.logger.log(
        `TALO_AMOUNT_MODE=auto detectó precios en ARS enteros (max unitPrice=${maxUnitPrice}); se envía sin dividir`,
      );
      return Math.max(1, Math.round(totalAmountRaw));
    }

    // Fallback cuando no hay items.
    if (totalAmountRaw >= 1_000_000) {
      this.logger.warn(
        `TALO_AMOUNT_MODE=auto sin items: monto alto (${totalAmountRaw}), se asume centavos y se divide por 100`,
      );
      return Math.max(1, Math.round(totalAmountRaw / 100));
    }

    this.logger.log(
      `TALO_AMOUNT_MODE=auto sin items: monto en rango ARS (${totalAmountRaw}), se envía sin dividir`,
    );
    return Math.max(1, Math.round(totalAmountRaw));
  }

  private getWebhookUrl(): string {
    return this.getRequiredEnv('TALO_WEBHOOK_URL');
  }

  private getRedirectUrl(orderId: string, override?: string): string {
    if (override?.trim()) {
      return override.trim();
    }

    const envRedirect = process.env.TALO_REDIRECT_URL;
    if (envRedirect?.trim()) {
      const base = envRedirect.trim().replace(/\/+$/, '');
      if (base.includes('{orderId}')) {
        return base.replace('{orderId}', orderId);
      }
      if (base.endsWith(`/${orderId}`)) {
        return base;
      }
      return `${base}/${orderId}`;
    }

    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:3000').trim();
    return `${frontendUrl}/pedido/${orderId}`;
  }

  private buildAdminNote(current: string | null, next: string): string {
    const cleanCurrent = current?.trim();
    return cleanCurrent ? `${cleanCurrent}\n${next}` : next;
  }

  async createTaloPayment(dto: CreateTaloPaymentDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        deletedAt: null,
      },
      include: {
        guestCustomer: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${dto.orderId} no encontrado`);
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        `El pedido ${order.id} no está pendiente y no puede iniciar pago`,
      );
    }

    const amountArs = this.toTaloAmount(
      order.totalAmount,
      order.items.map((item) => item.unitPrice),
    );
    const webhookUrl = this.getWebhookUrl();
    const redirectUrl = this.getRedirectUrl(order.id, dto.redirectUrl);

    const payment = await this.getClient().payments.create({
      user_id: this.getRequiredEnv('TALO_USER_ID'),
      price: {
        amount: amountArs,
        currency: 'ARS',
      },
      payment_options: ['transfer'],
      external_id: order.id,
      webhook_url: webhookUrl,
      redirect_url: redirectUrl,
      motive: dto.motive?.trim() || `Pedido ${order.id.slice(0, 8).toUpperCase()}`,
      client_data: order.guestCustomer
        ? {
            first_name: order.guestCustomer.firstName,
            last_name: order.guestCustomer.lastName,
            email: order.guestCustomer.email,
            phone: order.guestCustomer.phone,
            dni: order.guestCustomer.dni,
          }
        : undefined,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: 'TALO',
        paymentExternalId: order.id,
        paymentId: payment.id,
        paymentUrl: payment.payment_url || null,
        paymentStatus: payment.payment_status,
        paymentAmountArs: amountArs,
        paymentInitiatedAt: new Date(),
      },
    });

    return {
      orderId: order.id,
      externalId: order.id,
      paymentId: payment.id,
      paymentStatus: payment.payment_status,
      paymentUrl: payment.payment_url ?? null,
      redirectUrl: payment.redirect_url ?? redirectUrl,
      amountArs,
    };
  }

  async processTaloWebhook(payload: unknown) {
    const rawBody =
      typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});
    const client = this.getClient();
    const parsed = client.webhooks.parseRaw(rawBody);
    const payment = await client.payments.get(parsed.event.paymentId);
    const eventKey = `${payment.id}:${payment.payment_status}`;

    const order =
      (await this.prisma.order.findFirst({
        where: { id: parsed.event.externalId, deletedAt: null },
      })) ||
      (await this.prisma.order.findFirst({
        where: { paymentId: payment.id, deletedAt: null },
      }));

    if (!order) {
      throw new NotFoundException(
        `No se encontró pedido para externalId=${parsed.event.externalId} o paymentId=${payment.id}`,
      );
    }

    if (order.paymentLastEventKey === eventKey) {
      return {
        ok: true,
        duplicated: true,
        orderId: order.id,
        paymentId: payment.id,
        paymentStatus: payment.payment_status,
      };
    }

    if (
      payment.payment_status === 'SUCCESS' &&
      order.status === OrderStatus.PENDING
    ) {
      await this.ordersService.updateStatus(order.id, {
        status: OrderStatusUpdate.CONFIRMED,
        adminNotes: this.buildAdminNote(
          order.adminNotes,
          `[TALO] Pago confirmado por webhook (${payment.id})`,
        ),
      });
    } else if (
      payment.payment_status === 'EXPIRED' &&
      order.status === OrderStatus.PENDING
    ) {
      await this.ordersService.updateStatus(order.id, {
        status: OrderStatusUpdate.CANCELLED,
        adminNotes: this.buildAdminNote(
          order.adminNotes,
          `[TALO] Pago expirado por webhook (${payment.id})`,
        ),
      });
    } else if (
      payment.payment_status === 'OVERPAID' ||
      payment.payment_status === 'UNDERPAID'
    ) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          adminNotes: this.buildAdminNote(
            order.adminNotes,
            `[TALO] Pago ${payment.payment_status} requiere revisión (${payment.id})`,
          ),
        },
      });
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        paymentProvider: 'TALO',
        paymentExternalId: parsed.event.externalId || order.id,
        paymentId: payment.id,
        paymentUrl: payment.payment_url || order.paymentUrl,
        paymentStatus: payment.payment_status,
        paymentWebhookAt: new Date(),
        paymentLastEventKey: eventKey,
      },
    });

    return {
      ok: true,
      orderId: order.id,
      paymentId: payment.id,
      paymentStatus: payment.payment_status,
      event: parsed.event,
    };
  }
}
