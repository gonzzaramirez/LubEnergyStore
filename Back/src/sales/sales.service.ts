import { Injectable, BadRequestException } from '@nestjs/common';
import { Location, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export interface ReportsFilters {
  startDate?: string;
  endDate?: string;
  location?: Location;
  paymentMethod?: PaymentMethod;
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSaleDto: CreateSaleDto) {
    const { productId, quantity, paymentMethod, location, createdAt } =
      createSaleDto;

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true, price: true, name: true },
      });

      if (!product) {
        throw new BadRequestException('Producto no encontrado');
      }

      if (product.stockQuantity < quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}". Disponible: ${product.stockQuantity}, Solicitado: ${quantity}`,
        );
      }

      const totalAmount = product.price * quantity;

      // FIFO cost allocation (R-FIFO-01 through R-FIFO-04)
      let purchasePrice: number | null = null;
      let unitSalePrice: number | null = null;
      const fifoLines = await tx.purchaseOrderLine.findMany({
        where: {
          productId,
          remaining: { gt: 0 },
        },
        orderBy: { purchaseOrder: { receivedAt: 'asc' } },
      });

      let toConsume = quantity;
      let totalCost = 0;
      let totalSaleValue = 0;
      let hasSalePrice = false;
      for (const line of fifoLines) {
        if (toConsume <= 0) break;
        const take = Math.min(line.remaining, toConsume);
        totalCost += take * line.unitPurchasePrice;
        if (line.unitSalePrice != null) {
          totalSaleValue += take * line.unitSalePrice;
          hasSalePrice = true;
        }
        toConsume -= take;
        await tx.purchaseOrderLine.update({
          where: { id: line.id },
          data: { remaining: { decrement: take } },
        });
      }

      if (toConsume === 0 && quantity > 0) {
        purchasePrice = Math.round(totalCost / quantity);
        if (hasSalePrice) {
          unitSalePrice = Math.round(totalSaleValue / quantity);
        }
      }

      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: { decrement: quantity } },
      });

      return tx.sale.create({
        data: {
          productId,
          quantity,
          totalAmount,
          purchasePrice,
          unitSalePrice,
          paymentMethod,
          location,
          createdAt: createdAt ? new Date(createdAt) : undefined,
        },
        include: {
          product: { select: { name: true, price: true } },
        },
      });
    });
  }

  private buildDateWhere(startDate?: string, endDate?: string) {
    const createdAt: any = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        if (endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
        createdAt.lte = end;
      }
    }
    return Object.keys(createdAt).length ? createdAt : undefined;
  }

  async findAll(
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = {};
    const dateFilter = this.buildDateWhere(startDate, endDate);
    if (dateFilter) where.createdAt = dateFilter;

    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, price: true } },
        },
      }),
      this.prisma.sale.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  async getReports(filters: ReportsFilters) {
    const where: any = {};
    const dateFilter = this.buildDateWhere(filters.startDate, filters.endDate);
    if (dateFilter) where.createdAt = dateFilter;
    if (filters.location) where.location = filters.location;
    if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod;

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            price: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // --- Summary ---
    const totalRevenue = sales.reduce((s, v) => s + v.totalAmount, 0);
    const totalUnits = sales.reduce((s, v) => s + v.quantity, 0);
    const totalSales = sales.length;
    const avgTicket = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

    // Cost & profit (R-REP-01)
    // Net profit uses unitSalePrice from the purchase order (if available),
    // falling back to actual totalAmount for sales without purchase-level pricing.
    const totalCost = sales.reduce((sum, s) => {
      if (s.purchasePrice != null) {
        return sum + s.quantity * s.purchasePrice;
      }
      return sum;
    }, 0);
    const netProfit = sales.reduce((sum, s) => {
      if (s.unitSalePrice != null && s.purchasePrice != null) {
        return sum + s.quantity * (s.unitSalePrice - s.purchasePrice);
      }
      if (s.purchasePrice != null) {
        return sum + s.totalAmount - s.quantity * s.purchasePrice;
      }
      return sum + s.totalAmount;
    }, 0);

    // --- By location ---
    const locationMap = new Map<string, { revenue: number; count: number; units: number }>();
    for (const sale of sales) {
      const key = sale.location;
      if (!locationMap.has(key)) locationMap.set(key, { revenue: 0, count: 0, units: 0 });
      const entry = locationMap.get(key)!;
      entry.revenue += sale.totalAmount;
      entry.count += 1;
      entry.units += sale.quantity;
    }
    const revenueByLocation = Array.from(locationMap.entries()).map(([location, data]) => ({
      location,
      ...data,
    }));

    // --- By payment method ---
    const paymentMap = new Map<string, { revenue: number; count: number; units: number }>();
    for (const sale of sales) {
      const key = sale.paymentMethod;
      if (!paymentMap.has(key)) paymentMap.set(key, { revenue: 0, count: 0, units: 0 });
      const entry = paymentMap.get(key)!;
      entry.revenue += sale.totalAmount;
      entry.count += 1;
      entry.units += sale.quantity;
    }
    const revenueByPaymentMethod = Array.from(paymentMap.entries()).map(([paymentMethod, data]) => ({
      paymentMethod,
      ...data,
    }));

    // --- Top products ---
    const productMap = new Map<string, { name: string; revenue: number; units: number; salesCount: number }>();
    for (const sale of sales) {
      const key = sale.productId;
      if (!productMap.has(key)) {
        productMap.set(key, { name: sale.product.name, revenue: 0, units: 0, salesCount: 0 });
      }
      const entry = productMap.get(key)!;
      entry.revenue += sale.totalAmount;
      entry.units += sale.quantity;
      entry.salesCount += 1;
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // --- Top categories ---
    const categoryMap = new Map<string, { name: string; revenue: number; units: number }>();
    for (const sale of sales) {
      const cat = sale.product.category;
      const key = cat ? String(cat.id) : 'sin-categoria';
      const name = cat ? cat.name : 'Sin categoría';
      if (!categoryMap.has(key)) categoryMap.set(key, { name, revenue: 0, units: 0 });
      const entry = categoryMap.get(key)!;
      entry.revenue += sale.totalAmount;
      entry.units += sale.quantity;
    }
    const topCategories = Array.from(categoryMap.values())
      .sort((a, b) => b.revenue - a.revenue);

    // --- Sales by day of week (0=Dom … 6=Sáb) ---
    const dowMap = new Map<number, { revenue: number; count: number; units: number }>();
    for (let i = 0; i < 7; i++) dowMap.set(i, { revenue: 0, count: 0, units: 0 });
    for (const sale of sales) {
      const dow = new Date(sale.createdAt).getDay();
      const entry = dowMap.get(dow)!;
      entry.revenue += sale.totalAmount;
      entry.count += 1;
      entry.units += sale.quantity;
    }
    // Ordenar Lun–Dom (1,2,3,4,5,6,0)
    const dowOrder = [1, 2, 3, 4, 5, 6, 0];
    const salesByDayOfWeek = dowOrder.map((day) => ({
      day,
      dayName: DAY_NAMES[day],
      ...dowMap.get(day)!,
    }));

    // --- Revenue over time (daily) ---
    const timeMap = new Map<string, { revenue: number; count: number; units: number }>();
    for (const sale of sales) {
      const date = new Date(sale.createdAt).toISOString().slice(0, 10);
      if (!timeMap.has(date)) timeMap.set(date, { revenue: 0, count: 0, units: 0 });
      const entry = timeMap.get(date)!;
      entry.revenue += sale.totalAmount;
      entry.count += 1;
      entry.units += sale.quantity;
    }
    const revenueOverTime = Array.from(timeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({ date, ...data }));

    return {
      summary: { totalRevenue, totalSales, totalUnits, avgTicket, totalCost, netProfit },
      revenueByLocation,
      revenueByPaymentMethod,
      topProducts,
      topCategories,
      salesByDayOfWeek,
      revenueOverTime,
    };
  }
}
