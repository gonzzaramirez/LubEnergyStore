import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  Min,
  Max,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateDiscountCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]+$/, {
    message: 'El código debe contener solo letras mayúsculas y números',
  })
  code: string; // Código único (ej: "VERANO20")

  @IsString()
  @IsOptional()
  description?: string; // Descripción interna

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  discountPercent: number; // % de descuento

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  validFrom?: string; // Fecha inicio validez

  @IsDateString()
  @IsOptional()
  validUntil?: string; // Fecha fin validez

  @IsInt()
  @IsOptional()
  @Min(1)
  usageLimit?: number; // Límite de usos (null = ilimitado)

  @IsInt()
  @IsOptional()
  @Min(0)
  minOrderAmount?: number; // Monto mínimo de pedido

  /** Origen SaaS (opcional si el cupón no viene de un gimnasio) */
  @IsInt()
  @IsOptional()
  gymId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  gymName?: string;
}
