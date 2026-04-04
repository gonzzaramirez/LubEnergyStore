import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { DiscountCodesService } from '../discount-codes/discount-codes.service';
import { CreateSaasDiscountCodeDto } from '../discount-codes/dto/create-saas-discount-code.dto';
import { Public } from '../auth/decorators/public.decorator';
import { SaasApiKeyGuard } from './saas-api-key.guard';

@Controller('integrations/saas')
@UseGuards(SaasApiKeyGuard)
export class SaasDiscountIntegrationController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Public()
  @Post('discount-codes')
  async create(
    @Body() dto: CreateSaasDiscountCodeDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.discountCodesService.createFromSaas(dto);
    res.status(result.idempotent ? HttpStatus.OK : HttpStatus.CREATED);
    return result.discountCode;
  }
}
