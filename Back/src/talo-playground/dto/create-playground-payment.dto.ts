import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreatePlaygroundPaymentDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @IsOptional()
  @IsUrl()
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  motive?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  dni?: string;
}
