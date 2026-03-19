import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderPaymentRemindersService } from './order-payment-reminders.service';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService, OrderPaymentRemindersService],
  exports: [OrdersService],
})
export class OrdersModule {}
