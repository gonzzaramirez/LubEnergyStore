import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CreateTaloPaymentDto } from './dto/create-talo-payment.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('talo/create')
  createTaloPayment(@Body() dto: CreateTaloPaymentDto) {
    return this.paymentsService.createTaloPayment(dto);
  }

  @Public()
  @Post('talo/webhook')
  processTaloWebhook(@Body() payload: unknown) {
    return this.paymentsService.processTaloWebhook(payload);
  }
}
