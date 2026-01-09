import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum OrderStatusUpdate {
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatusUpdate)
  status: OrderStatusUpdate;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  adminNotes?: string;
}

export class UpdateTrackingDto {
  @IsString()
  @MaxLength(100)
  trackingCode: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  courierName?: string;
}
