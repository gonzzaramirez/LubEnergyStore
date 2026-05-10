import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async syncFromSheets(
    data: { sku: string; price?: number | null; stock?: number | null }[],
  ) {
    if (!Array.isArray(data) || data.length === 0) {
      return {
        message: 'No se recibieron filas para sincronizar',
        skusRecibidos: 0,
        filasProductoActualizadas: 0,
        filasSaborActualizadas: 0,
        skusSinCoincidencia: [] as string[],
      };
    }

    let filasProductoActualizadas = 0;
    let filasSaborActualizadas = 0;
    const skusSinCoincidencia: string[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const raw of data) {
        const sku = String(raw.sku ?? '').trim();
        if (!sku) continue;

        const hasPrice = raw.price !== undefined && raw.price !== null;
        const price = hasPrice ? Math.round(Number(raw.price)) : NaN;
        const usePrice = hasPrice && Number.isFinite(price);

        const hasStock = raw.stock !== undefined && raw.stock !== null;
        const stock = hasStock ? Math.round(Number(raw.stock)) : NaN;
        const useStock = hasStock && Number.isFinite(stock);

        if (!usePrice && !useStock) continue;

        const productData: { price?: number; stockQuantity?: number } = {};
        if (usePrice) productData.price = price;
        if (useStock) productData.stockQuantity = stock;

        let productCount = 0;

        if (Object.keys(productData).length > 0) {
          // 1. Buscamos el producto padre para ver si existe y conocer su precio anterior
          const existingProduct = await tx.product.findUnique({
            where: { sku },
          });

          if (existingProduct) {
            // 2. Si trae precio y es diferente al actual, creamos el registro de auditoría
            if (usePrice && existingProduct.price !== price) {
              const oldPrice = existingProduct.price;
              const changePercent = oldPrice > 0 ? ((price - oldPrice) / oldPrice) * 100 : 0;

              await tx.priceHistory.create({
                data: {
                  productId: existingProduct.id,
                  oldPrice,
                  newPrice: price,
                  changePercent,
                  reason: 'Sincronización Sheets', // Razón que aparecerá en el panel
                },
              });
            }

            // 3. Actualizamos el producto con los nuevos datos
            await tx.product.update({
              where: { id: existingProduct.id },
              data: productData,
            });
            
            productCount = 1;
          }
        }

        // 4. Actualizamos el Sabor (Las variantes no manejan precio, solo stock)
        const flavorRes = useStock
          ? await tx.productFlavor.updateMany({
              where: { sku },
              data: { stockQuantity: stock },
            })
          : { count: 0 };

        filasProductoActualizadas += productCount;
        filasSaborActualizadas += flavorRes.count;

        // Si no se encontró ni como producto ni como sabor
        if (productCount === 0 && flavorRes.count === 0) {
          skusSinCoincidencia.push(sku);
        }
      }
    });

    return {
      message:
        skusSinCoincidencia.length === 0
          ? `Sincronización aplicada: ${filasProductoActualizadas} fila(s) en productos, ${filasSaborActualizadas} en sabores.`
          : `Procesados ${data.length} ítems del payload: ${filasProductoActualizadas} producto(s) y ${filasSaborActualizadas} sabor(es) actualizados. Algunos SKUs no existen en la base (revisá mayúsculas/espacios o si el precio va en el padre y el stock en el sabor).`,
      skusRecibidos: data.length,
      filasProductoActualizadas,
      filasSaborActualizadas,
      skusSinCoincidencia,
    };
  }

  create(createProductDto: CreateProductDto) {
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
          where: { isActive: true },
        },
      },
    });
  }

  findAllDeleted() {
    return this.prisma.product.findMany({
      where: { deletedAt: { not: null } },
      include: {
        category: true,
        flavors: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: true,
        flavors: true,
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
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con slug ${slug} no encontrado`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.findOne(id);

    if (
      updateProductDto.price !== undefined &&
      updateProductDto.price !== existingProduct.price
    ) {
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

    const { flavors, ...rest } = updateProductDto;
    const dataToUpdate: any = { ...rest };

    if (dataToUpdate.discountStartDate) {
      dataToUpdate.discountStartDate = new Date(dataToUpdate.discountStartDate);
    }
    if (dataToUpdate.discountEndDate) {
      dataToUpdate.discountEndDate = new Date(dataToUpdate.discountEndDate);
    }

    if (flavors) {
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

  async bulkPriceUpdate(dto: BulkPriceUpdateDto) {
    const { percentChange, categoryId, reason } = dto;

    const where: any = { deletedAt: null };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await this.prisma.product.findMany({ where });

    if (products.length === 0) {
      return {
        updated: 0,
        message: 'No se encontraron productos para actualizar',
      };
    }

    const changeReason =
      reason ||
      (categoryId
        ? `Ajuste masivo ${percentChange > 0 ? '+' : ''}${percentChange}% (categoría)`
        : `Ajuste masivo ${percentChange > 0 ? '+' : ''}${percentChange}% (todos)`);

    const updates = products.map(async (product) => {
      const oldPrice = product.price;
      const newPrice = Math.round(oldPrice * (1 + percentChange / 100));

      await this.prisma.priceHistory.create({
        data: {
          productId: product.id,
          oldPrice,
          newPrice,
          changePercent: percentChange,
          reason: changeReason,
        },
      });

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

  async getPriceHistory(productId: string) {
    await this.findOne(productId);

    return this.prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}