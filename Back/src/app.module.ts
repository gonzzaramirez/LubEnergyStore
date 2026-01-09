import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    DiscountCodesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
