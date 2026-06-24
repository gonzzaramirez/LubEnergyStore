import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { POStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseOrderDto) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });

    if (!supplier) {
      throw new BadRequestException('Proveedor no encontrado');
    }

    if (!supplier.isActive) {
      throw new BadRequestException('El proveedor no está activo');
    }

    if (!dto.lines || dto.lines.length === 0) {
      throw new BadRequestException('Al menos una línea de producto es requerida');
    }

    const totalAmount = dto.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPurchasePrice,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      return tx.purchaseOrder.create({
        data: {
          supplierId: dto.supplierId,
          notes: dto.notes,
          totalAmount,
          lines: {
            create: dto.lines.map((line) => ({
              productId: line.productId || null,
              flavorId: line.flavorId || null,
              productName: line.productName,
              flavorName: line.flavorName || null,
              quantity: line.quantity,
              remaining: line.quantity,
              unitPurchasePrice: line.unitPurchasePrice,
            })),
          },
        },
        include: {
          supplier: true,
          lines: {
            include: { product: true, flavor: true },
          },
        },
      });
    });
  }

  async findAll(page = 1, limit = 20, status?: string) {
    const where: any = {};
    if (status) {
      where.status = status as POStatus;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.purchaseOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: { select: { id: true, name: true } },
          lines: { select: { id: true } },
        },
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: { product: true, flavor: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    return order;
  }

  async   receive(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!order) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Solo se pueden recibir órdenes pendientes. Estado actual: ${order.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      for (const line of order.lines) {
        if (line.productId) {
          const updateData: any = { stockQuantity: { increment: line.quantity } };

          // If a unitSalePrice was set on this line, update the product's sale price too
          if (line.unitSalePrice != null) {
            updateData.price = line.unitSalePrice;
          }

          await tx.product.update({
            where: { id: line.productId },
            data: updateData,
          });
        }
        if (line.flavorId) {
          await tx.productFlavor.update({
            where: { id: line.flavorId },
            data: { stockQuantity: { increment: line.quantity } },
          });
        }
      }

      // remaining is already set to quantity on create — no update needed
      return tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          receivedAt: new Date(),
        },
        include: {
          supplier: true,
          lines: {
            include: { product: true, flavor: true },
          },
        },
      });
    });
  }

  async cancel(id: string) {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException(
        `Solo se pueden cancelar órdenes pendientes. Estado actual: ${order.status}`,
      );
    }

    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        supplier: true,
        lines: {
          include: { product: true, flavor: true },
        },
      },
    });
  }
}
