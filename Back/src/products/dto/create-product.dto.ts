import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsDateString, Min, Max } from 'class-validator';

export class CreateProductDto {
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  sku: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

  @IsInt()
  @IsOptional()
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  // Promociones por producto
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsDateString()
  @IsOptional()
  discountStartDate?: string;

  @IsDateString()
  @IsOptional()
  discountEndDate?: string;

  // Descuento por cantidad
  @IsInt()
  @IsOptional()
  @Min(2)
  minQuantityDiscount?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(100)
  quantityDiscountPercent?: number;
}
