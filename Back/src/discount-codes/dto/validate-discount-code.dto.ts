import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';

export class ValidateDiscountCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsInt()
  @Min(0)
  orderAmount: number; // Monto total del pedido para validar monto mínimo
}
