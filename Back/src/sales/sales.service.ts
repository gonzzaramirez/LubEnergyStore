import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { productId, quantity, paymentMethod, location, createdAt } =
      createSaleDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const totalAmount = product.price * quantity;

    // Usamos una transacción para asegurar que se cree la venta y se descuente el stock
    return this.prisma.$transaction(async (tx) => {
      // 1. Descontar stock del producto
      await tx.product.update({
        where: { id: productId },
        data: {
          stockQuantity: {
            decrement: quantity,
          },
        },
      });

      // 2. Crear el registro de venta
      return tx.sale.create({
        data: {
          productId,
          quantity,
          totalAmount,
          paymentMethod,
          location,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
        include: {
          product: {
            select: { name: true, price: true },
          },
        },
      });
    });
  }

  async findAll(startDate?: string, endDate?: string) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          where.createdAt.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          // Si es solo fecha (YYYY-MM-DD), ajustamos al final del día
          if (endDate.length === 10) {
            end.setUTCHours(23, 59, 59, 999);
          }
          where.createdAt.lte = end;
        }
      }
    }

    return this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { name: true, price: true },
        },
      },
    });
  }
}
