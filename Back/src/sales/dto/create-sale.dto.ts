import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaymentMethod, Location } from '@prisma/client';

export class CreateSaleDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  flavorId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsEnum(Location)
  location: Location;

  @IsOptional()
  @IsString()
  createdAt?: string;
}
