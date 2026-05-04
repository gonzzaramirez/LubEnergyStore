import {
  IsInt,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  IsString,
} from 'class-validator';

export class BulkPriceUpdateDto {
  @IsInt()
  @IsNotEmpty()
  @Min(-50) // Máximo 50% de baja
  @Max(100) // Máximo 100% de aumento
  percentChange: number; // Porcentaje de cambio (positivo = aumento, negativo = baja)

  @IsInt()
  @IsOptional()
  categoryId?: number; // Si se especifica, solo afecta a esa categoría

  @IsString()
  @IsOptional()
  reason?: string; // Razón del cambio (para historial)
}
