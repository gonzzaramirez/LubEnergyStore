import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreatePlaygroundPaymentDto } from './dto/create-playground-payment.dto';
import { TaloPlaygroundService } from './talo-playground.service';

@Controller('talo')
export class TaloPlaygroundController {
  constructor(
    private readonly taloPlaygroundService: TaloPlaygroundService,
  ) {}

  @Public()
  @Post('playground/payments')
  createPayment(@Body() dto: CreatePlaygroundPaymentDto) {
    return this.taloPlaygroundService.createPayment(dto);
  }

  @Public()
  @Get('playground/payments/:paymentId')
  getPayment(@Param('paymentId') paymentId: string) {
    return this.taloPlaygroundService.getPayment(paymentId);
  }

  @Public()
  @Post('webhook/test')
  handleWebhook(@Body() payload: unknown) {
    return this.taloPlaygroundService.handleWebhookPayload(payload);
  }
}
