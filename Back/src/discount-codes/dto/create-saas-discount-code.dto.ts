import { OmitType } from '@nestjs/mapped-types';
import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { CreateDiscountCodeDto } from './create-discount-code.dto';

/** Body para POST /integrations/saas/discount-codes (requiere gymId + gymName del SaaS). */
export class CreateSaasDiscountCodeDto extends OmitType(CreateDiscountCodeDto, [
  'gymId',
  'gymName',
] as const) {
  @IsInt()
  gymId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  gymName: string;
}
