import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountCodesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDiscountCodeDto) {
    // Verificar que el código no exista
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: dto.code.toUpperCase() },
    });

    if (existing) {
      throw new ConflictException(`El código "${dto.code}" ya existe`);
    }

    // Preparar datos, convirtiendo fechas al formato correcto
    const dataToCreate: any = {
      ...dto,
      code: dto.code.toUpperCase(),
    };

    if (dataToCreate.validFrom) {
      dataToCreate.validFrom = new Date(dataToCreate.validFrom);
    }
    if (dataToCreate.validUntil) {
      dataToCreate.validUntil = new Date(dataToCreate.validUntil);
    }

    return this.prisma.discountCode.create({
      data: dataToCreate,
    });
  }

  findAll() {
    return this.prisma.discountCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const code = await this.prisma.discountCode.findUnique({
      where: { id },
    });

    if (!code) {
      throw new NotFoundException(`Código de descuento con ID ${id} no encontrado`);
    }

    return code;
  }

  async update(id: string, dto: UpdateDiscountCodeDto) {
    await this.findOne(id);

    // Preparar datos para actualizar
    const dataToUpdate: any = { ...dto };

    // Si se está cambiando el código, verificar que no exista
    if (dataToUpdate.code) {
      const existing = await this.prisma.discountCode.findFirst({
        where: {
          code: dataToUpdate.code.toUpperCase(),
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(`El código "${dataToUpdate.code}" ya existe`);
      }

      dataToUpdate.code = dataToUpdate.code.toUpperCase();
    }

    // Convertir fechas al formato correcto
    if (dataToUpdate.validFrom) {
      dataToUpdate.validFrom = new Date(dataToUpdate.validFrom);
    }
    if (dataToUpdate.validUntil) {
      dataToUpdate.validUntil = new Date(dataToUpdate.validUntil);
    }

    return this.prisma.discountCode.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.discountCode.delete({
      where: { id },
    });
  }

  // Validar código de descuento (para el carrito)
  async validate(dto: ValidateDiscountCodeDto) {
    const { code, orderAmount } = dto;

    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      throw new NotFoundException('Código de descuento no válido');
    }

    // Verificar si está activo
    if (!discountCode.isActive) {
      throw new BadRequestException('Este código de descuento no está activo');
    }

    // Verificar fechas de validez
    const now = new Date();
    if (discountCode.validFrom && now < discountCode.validFrom) {
      throw new BadRequestException('Este código de descuento aún no está vigente');
    }

    if (discountCode.validUntil && now > discountCode.validUntil) {
      throw new BadRequestException('Este código de descuento ha expirado');
    }

    // Verificar límite de usos
    if (discountCode.usageLimit !== null && discountCode.usageCount >= discountCode.usageLimit) {
      throw new BadRequestException('Este código de descuento ha alcanzado su límite de usos');
    }

    // Verificar monto mínimo
    if (discountCode.minOrderAmount !== null && orderAmount < discountCode.minOrderAmount) {
      throw new BadRequestException(
        `El monto mínimo para usar este código es $${discountCode.minOrderAmount}`
      );
    }

    // Código válido - retornar info del descuento
    return {
      valid: true,
      code: discountCode.code,
      discountPercent: discountCode.discountPercent,
      description: discountCode.description,
    };
  }

  // Incrementar contador de uso (llamar cuando se confirma un pedido)
  async incrementUsage(code: string) {
    const discountCode = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discountCode) {
      return null;
    }

    return this.prisma.discountCode.update({
      where: { id: discountCode.id },
      data: { usageCount: discountCode.usageCount + 1 },
    });
  }
}
