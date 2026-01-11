import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
    // Preparar datos, convirtiendo fechas al formato ISO-8601 completo
    const { flavors, ...rest } = createProductDto;
    const dataToCreate: any = { ...rest };

    if (dataToCreate.discountStartDate) {
      dataToCreate.discountStartDate = new Date(dataToCreate.discountStartDate);
    }
    if (dataToCreate.discountEndDate) {
      dataToCreate.discountEndDate = new Date(dataToCreate.discountEndDate);
    }

    if (flavors && flavors.length > 0) {
      dataToCreate.flavors = {
        create: flavors,
      };
    }

    return this.prisma.product.create({
      data: dataToCreate,
      include: { flavors: true },
    });
  }

  findAll(isFeatured?: boolean) {
    const where: any = { deletedAt: null };
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    return this.prisma.product.findMany({
      where,
      include: { 
        category: true,
        flavors: {
          where: { isActive: true }
        }
      },
    });
  }

  findAllDeleted() {
    return this.prisma.product.findMany({
      where: { deletedAt: { not: null } },
      include: { 
        category: true,
        flavors: true
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: { 
        category: true,
        flavors: true
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: { 
        category: true,
        flavors: {
          where: { isActive: true }
        }
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.findOne(id);

    // Si el precio cambió, registrar en historial
    if (updateProductDto.price !== undefined && updateProductDto.price !== existingProduct.price) {
      const oldPrice = existingProduct.price;
      const newPrice = updateProductDto.price;
      const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;

      await this.prisma.priceHistory.create({
        data: {
          productId: id,
          oldPrice,
          newPrice,
          changePercent,
          reason: 'Edición manual',
        },
      });
    }

    // Preparar datos para actualizar, convirtiendo fechas al formato ISO-8601 completo
    const { flavors, ...rest } = updateProductDto;
    const dataToUpdate: any = { ...rest };

    // Convertir fechas de descuento si están presentes
    if (dataToUpdate.discountStartDate) {
      dataToUpdate.discountStartDate = new Date(dataToUpdate.discountStartDate);
    }
    if (dataToUpdate.discountEndDate) {
      dataToUpdate.discountEndDate = new Date(dataToUpdate.discountEndDate);
    }

    // Manejar sabores en la actualización
    if (flavors) {
      // Para simplificar, eliminamos los sabores existentes y creamos los nuevos
      // O podríamos hacer un upsert más complejo. Por ahora, sigamos la petición de "donde creo los sabores"
      // indicando que esto se maneja en el update del producto base.
      await this.prisma.productFlavor.deleteMany({
        where: { productId: id },
      });

      dataToUpdate.flavors = {
        create: flavors,
      };
    }

    return this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { flavors: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (!product.deletedAt) {
      throw new NotFoundException(`El producto con ID ${id} no está eliminado`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // Aumento/baja masivo de precios
  async bulkPriceUpdate(dto: BulkPriceUpdateDto) {
    const { percentChange, categoryId, reason } = dto;

    // Obtener productos a actualizar
    const where: any = { deletedAt: null };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await this.prisma.product.findMany({ where });

    if (products.length === 0) {
      return { updated: 0, message: 'No se encontraron productos para actualizar' };
    }

    // Calcular el motivo del cambio
    const changeReason = reason || 
      (categoryId 
        ? `Ajuste masivo ${percentChange > 0 ? '+' : ''}${percentChange}% (categoría)`
        : `Ajuste masivo ${percentChange > 0 ? '+' : ''}${percentChange}% (todos)`);

    // Actualizar cada producto y crear historial
    const updates = products.map(async (product) => {
      const oldPrice = product.price;
      const newPrice = Math.round(oldPrice * (1 + percentChange / 100));

      // Crear registro de historial
      await this.prisma.priceHistory.create({
        data: {
          productId: product.id,
          oldPrice,
          newPrice,
          changePercent: percentChange,
          reason: changeReason,
        },
      });

      // Actualizar precio del producto
      return this.prisma.product.update({
        where: { id: product.id },
        data: { price: newPrice },
      });
    });

    await Promise.all(updates);

    return {
      updated: products.length,
      percentChange,
      message: `Se actualizaron ${products.length} productos con un ${percentChange > 0 ? 'aumento' : 'descuento'} del ${Math.abs(percentChange)}%`,
    };
  }

  // Obtener historial de precios de un producto
  async getPriceHistory(productId: string) {
    await this.findOne(productId); // Verificar que existe

    return this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Últimos 50 cambios
    });
  }
}
