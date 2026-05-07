import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Location, PaymentMethod } from '@prisma/client';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sales')
@UseGuards(JwtAuthGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  create(@Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(createSaleDto);
  }

  @Get('reports')
  getReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('location') location?: Location,
    @Query('paymentMethod') paymentMethod?: PaymentMethod,
  ) {
    return this.salesService.getReports({ startDate, endDate, location, paymentMethod });
  }

  @Get()
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.salesService.findAll(startDate, endDate);
  }
}
