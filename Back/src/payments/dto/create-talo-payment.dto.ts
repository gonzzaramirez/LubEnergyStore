import { IsOptional, IsString, IsUrl, IsUUID } from 'class-validator';

export class CreateTaloPaymentDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsUrl({
    require_protocol: true,
    require_host: true,
    require_tld: false,
  })
  redirectUrl?: string;

  @IsOptional()
  @IsString()
  motive?: string;
}
