import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, UpdateTrackingDto, OrderStatusUpdate } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  private getTrackingUrl(orderId: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/pedido/${orderId}`;
  }

  async create(createOrderDto: CreateOrderDto) {
    const {
      firstName,
      lastName,
      email,
      phone,
      dni,
      street,
      apartment,
      city,
      province,
      customerNotes,
      items,
      totalAmount,
    } = createOrderDto;

    // Crear cliente invitado y pedido en una transacción
    const order = await this.prisma.$transaction(async (tx) => {
      // 1. Crear o buscar cliente invitado
      const guestCustomer = await tx.guestCustomer.create({
        data: {
          firstName,
          lastName,
          email,
          phone,
          dni,
          street,
          apartment,
          city,
          province,
        },
      });

      // 2. Crear el pedido
      const newOrder = await tx.order.create({
        data: {
          guestCustomerId: guestCustomer.id,
          totalAmount,
          customerNotes,
          status: OrderStatus.PENDING,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          guestCustomer: true,
          items: true,
        },
      });

      return newOrder;
    });

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      trackingUrl: this.getTrackingUrl(order.id),
    };
  }

  async findAll(status?: OrderStatus) {
    const where: any = { deletedAt: null };
    if (status) {
      where.status = status;
    }

    return this.prisma.order.findMany({
      where,
      include: {
        guestCustomer: true,
        user: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id, deletedAt: null },
      include: {
        guestCustomer: true,
        user: true,
        items: {
          include: {
            product: {
              select: {
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }

    return order;
  }

  // Endpoint público para seguimiento (sin datos sensibles)
  async findOnePublic(id: string) {
    const order = await this.findOne(id);

    return {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      trackingCode: order.trackingCode,
      courierName: order.courierName,
      createdAt: order.createdAt,
      confirmedAt: order.confirmedAt,
      shippedAt: order.shippedAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imageUrl: item.product?.imageUrl,
      })),
      // Solo nombre y ciudad para referencia
      customerName: order.guestCustomer
        ? `${order.guestCustomer.firstName} ${order.guestCustomer.lastName}`
        : order.user
          ? `${order.user.firstName} ${order.user.lastName}`
          : 'Cliente',
      city: order.guestCustomer?.city || '',
    };
  }

  async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);

    const updateData: any = {
      status: updateDto.status as unknown as OrderStatus,
      adminNotes: updateDto.adminNotes,
    };

    // Agregar timestamps según el estado
    if (updateDto.status === OrderStatusUpdate.CONFIRMED) {
      updateData.confirmedAt = new Date();
    }

    // Si se confirma el pedido, usar transacción para reducir stock
    let updatedOrder;
    if (updateDto.status === OrderStatusUpdate.CONFIRMED && order.status === OrderStatus.PENDING) {
      // Usar transacción para garantizar consistencia
      updatedOrder = await this.prisma.$transaction(async (tx) => {
        // 1. Reducir stock de cada producto
        for (const item of order.items) {
          // Verificar stock disponible
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { stockQuantity: true, name: true },
          });

          if (!product) {
            throw new BadRequestException(
              `Producto ${item.productName} no encontrado`,
            );
          }

          if (product.stockQuantity < item.quantity) {
            throw new BadRequestException(
              `Stock insuficiente para "${item.productName}". Disponible: ${product.stockQuantity}, Solicitado: ${item.quantity}`,
            );
          }

          // Reducir stock
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }

        // 2. Actualizar estado del pedido
        return tx.order.update({
          where: { id },
          data: updateData,
          include: {
            guestCustomer: true,
            items: true,
          },
        });
      });
    } else {
      // Para otros estados, actualización normal
      updatedOrder = await this.prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          guestCustomer: true,
          items: true,
        },
      });
    }

    // Enviar email de confirmación cuando se confirma el pago
    if (updateDto.status === OrderStatusUpdate.CONFIRMED && updatedOrder.guestCustomer) {
      const customer = updatedOrder.guestCustomer;
      try {
        await this.emailService.sendOrderConfirmation({
          orderId: updatedOrder.id,
          customer: {
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
            dni: customer.dni,
            street: customer.street,
            apartment: customer.apartment || undefined,
            city: customer.city,
            province: customer.province,
          },
          items: updatedOrder.items.map((item) => ({
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          totalAmount: updatedOrder.totalAmount,
          trackingUrl: this.getTrackingUrl(updatedOrder.id),
        });
      } catch (error) {
        // Log el error pero no fallar la confirmación del pedido
        console.error('Error al enviar email de confirmación:', error);
      }
    }

    return updatedOrder;
  }

  async updateTracking(id: string, updateDto: UpdateTrackingDto) {
    const order = await this.findOne(id);

    if (order.status === OrderStatus.PENDING) {
      throw new BadRequestException(
        'No se puede agregar tracking a un pedido sin confirmar',
      );
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        trackingCode: updateDto.trackingCode,
        courierName: updateDto.courierName,
        status: OrderStatus.SHIPPED,
        shippedAt: new Date(),
      },
      include: {
        guestCustomer: true,
        items: true,
      },
    });

    // Enviar email con código de seguimiento
    if (updatedOrder.guestCustomer) {
      const customer = updatedOrder.guestCustomer;
      await this.emailService.sendTrackingUpdate({
        orderId: updatedOrder.id,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          dni: customer.dni,
          street: customer.street,
          apartment: customer.apartment || undefined,
          city: customer.city,
          province: customer.province,
        },
        items: updatedOrder.items.map((item) => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: updatedOrder.totalAmount,
        trackingCode: updateDto.trackingCode,
        courierName: updateDto.courierName,
        trackingUrl: this.getTrackingUrl(updatedOrder.id),
      });
    }

    return updatedOrder;
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Estadísticas para dashboard
  async getStats() {
    const [pending, confirmed, shipped, cancelled, total] =
      await Promise.all([
        this.prisma.order.count({ where: { status: OrderStatus.PENDING, deletedAt: null } }),
        this.prisma.order.count({ where: { status: OrderStatus.CONFIRMED, deletedAt: null } }),
        this.prisma.order.count({ where: { status: OrderStatus.SHIPPED, deletedAt: null } }),
        this.prisma.order.count({ where: { status: OrderStatus.CANCELLED, deletedAt: null } }),
        this.prisma.order.aggregate({
          where: { 
            status: { in: [OrderStatus.CONFIRMED, OrderStatus.SHIPPED] },
            deletedAt: null 
          },
          _sum: { totalAmount: true },
        }),
      ]);

    return {
      pending,
      confirmed,
      shipped,
      cancelled,
      totalRevenue: total._sum.totalAmount || 0,
    };
  }
}
