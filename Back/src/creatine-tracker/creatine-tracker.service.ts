import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { TrackerSource } from '@prisma/client';

@Injectable()
export class CreatineTrackerService {
  private readonly logger = new Logger(CreatineTrackerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsapp: WhatsappService,
  ) {}

  // ── Utilidades ──────────────────────────────────────────────────────────

  /** Extrae los gramos del nombre del producto. Ej: "Creatina Star 300g" → 300 */
  static extractWeightFromName(name: string): number | null {
    const match = name.match(/(\d+)\s*g(?:r(?:amos?)?)?\b/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /** Calcula la fecha de vencimiento: purchaseDate + floor(weightGrams / 5) días */
  static calcExpiryDate(purchaseDate: Date, weightGrams: number): Date {
    const days = Math.floor(weightGrams / 5);
    const expiry = new Date(purchaseDate);
    expiry.setDate(expiry.getDate() + days);
    return expiry;
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  async create(
    dto: CreateTrackerDto,
    source: TrackerSource = TrackerSource.MANUAL,
  ) {
    const purchaseDate = new Date(dto.purchaseDate);
    const expiryDate = CreatineTrackerService.calcExpiryDate(
      purchaseDate,
      dto.weightGrams,
    );

    return this.prisma.creatineTracker.create({
      data: {
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        productName: dto.productName,
        weightGrams: dto.weightGrams,
        purchaseDate,
        expiryDate,
        source,
        productId: dto.productId ?? null,
        orderId: dto.orderId ?? null,
      },
    });
  }

  async findAll() {
    return this.prisma.creatineTracker.findMany({
      where: { isActive: true },
      orderBy: { expiryDate: 'asc' },
      include: {
        product: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const tracker = await this.prisma.creatineTracker.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!tracker) throw new NotFoundException(`Tracker ${id} no encontrado`);
    return tracker;
  }

  async update(id: string, data: Partial<CreateTrackerDto>) {
    await this.findOne(id);
    const updates: Record<string, unknown> = { ...data };

    if (data.purchaseDate || data.weightGrams) {
      const tracker = await this.findOne(id);
      const purchaseDate = data.purchaseDate
        ? new Date(data.purchaseDate)
        : tracker.purchaseDate;
      const weightGrams = data.weightGrams ?? tracker.weightGrams;
      updates.purchaseDate = purchaseDate;
      updates.expiryDate = CreatineTrackerService.calcExpiryDate(
        purchaseDate,
        weightGrams,
      );
    }

    return this.prisma.creatineTracker.update({ where: { id }, data: updates });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.creatineTracker.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // ── Productos de categoría Creatina ──────────────────────────────────────

  async getCreatineProducts() {
    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        category: {
          name: { contains: 'creatina', mode: 'insensitive' },
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        stockQuantity: true,
        price: true,
        category: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });

    return products.map((p) => ({
      ...p,
      weightGrams: CreatineTrackerService.extractWeightFromName(p.name),
    }));
  }

  // ── Recordatorios ────────────────────────────────────────────────────────

  /** Ejecuta todos los días a las 07:00 (Argentina = UTC-3, cron en UTC) */
  @Cron('0 10 * * *')
  async scheduledReminders() {
    this.logger.log('Ejecutando cron de recordatorios de creatina');
    await this.checkAndSendReminders();
  }

  async checkAndSendReminders(): Promise<{ sent: number; failed: number }> {
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const pending = await this.prisma.creatineTracker.findMany({
      where: {
        isActive: true,
        reminderSentAt: null,
        expiryDate: { lte: sevenDaysFromNow },
      },
    });

    if (pending.length === 0) {
      this.logger.log('No hay recordatorios pendientes');
      return { sent: 0, failed: 0 };
    }

    // Buscar creatinas en stock para sugerir en el mensaje
    const creatinesInStock = await this.prisma.product.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        stockQuantity: { gt: 0 },
        category: { name: { contains: 'creatina', mode: 'insensitive' } },
      },
      select: { name: true, price: true },
      orderBy: { price: 'asc' },
      take: 3,
    });

    let sent = 0;
    let failed = 0;

    for (const tracker of pending) {
      const daysLeft = Math.ceil(
        (tracker.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      const message = this.buildReminderMessage(
        tracker.customerName,
        tracker.productName,
        daysLeft,
        creatinesInStock,
      );

      const result = await this.whatsapp.sendMessage({
        phone: tracker.customerPhone,
        name: tracker.customerName,
        content: message,
        trackerId: tracker.id,
      });

      if (result.success) {
        await this.prisma.creatineTracker.update({
          where: { id: tracker.id },
          data: { reminderSentAt: new Date() },
        });
        sent++;
      } else {
        failed++;
      }
    }

    this.logger.log(`Recordatorios: ${sent} enviados, ${failed} fallidos`);
    return { sent, failed };
  }

  private buildReminderMessage(
    name: string,
    productName: string,
    daysLeft: number,
    stock: { name: string; price: number }[],
  ): string {
    const firstName = name.split(' ')[0];
    const daysText =
      daysLeft <= 0
        ? 'ya se terminó'
        : `se termina en ${daysLeft} día${daysLeft !== 1 ? 's' : ''}`;

    let msg = `¡Hola ${firstName}! 👋\n\nTu *${productName}* ${daysText}.\n\n`;

    if (stock.length > 0) {
      msg += `Tenemos creatinas disponibles para que no pares:\n`;
      for (const p of stock) {
        const price = (p.price / 100).toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
          maximumFractionDigits: 0,
        });
        msg += `• ${p.name} — ${price}\n`;
      }
      msg += `\nVisitanos en lubenergystore.com o escribinos para coordinar 💪`;
    } else {
      msg += `Cuando quieras renovar, escribinos o visitanos en lubenergystore.com 💪`;
    }

    return msg;
  }

  // ── Auto-create desde pedido web ────────────────────────────────────────

  async createFromOrder(params: {
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    purchaseDate: Date;
  }): Promise<void> {
    const weightGrams = CreatineTrackerService.extractWeightFromName(
      params.productName,
    );
    if (!weightGrams) return;

    const totalGrams = weightGrams * params.quantity;

    const dto: CreateTrackerDto = {
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      productName: params.productName,
      weightGrams: totalGrams,
      purchaseDate: params.purchaseDate.toISOString(),
      productId: params.productId,
      orderId: params.orderId,
    };

    await this.create(dto, TrackerSource.WEB);
  }
}
