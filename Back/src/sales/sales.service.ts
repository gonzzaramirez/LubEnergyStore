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

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    const totalAmount = product.price * quantity;

    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: { stockQuantity: { decrement: quantity } },
      });

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

  async findAll(startDate?: string, endDate?: string) {
    const where: any = {};
    const dateFilter = this.buildDateWhere(startDate, endDate);
    if (dateFilter) where.createdAt = dateFilter;

    return this.prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, price: true } },
      },
    });
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
      summary: { totalRevenue, totalSales, totalUnits, avgTicket },
      revenueByLocation,
      revenueByPaymentMethod,
      topProducts,
      topCategories,
      salesByDayOfWeek,
      revenueOverTime,
    };
  }
}
