import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { EmailModule } from './email/email.module';
import { DiscountCodesModule } from './discount-codes/discount-codes.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { TaloPlaygroundModule } from './talo-playground/talo-playground.module';
import { PaymentsModule } from './payments/payments.module';
import { KapsoModule } from './kapso/kapso.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    // Rate limiting: 100 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    KapsoModule,
    EmailModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    DiscountCodesModule,
    TaloPlaygroundModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Guard global de rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Guard global de JWT (todas las rutas protegidas por defecto)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Guard global de roles
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
