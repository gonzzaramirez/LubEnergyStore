import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto, UpdateTrackingDto } from './dto/update-order.dto';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Crear nuevo pedido (público - desde checkout)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Obtener pedido público (para página de seguimiento)
  @Get('track/:id')
  findOnePublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOnePublic(id);
  }

  // --- Endpoints de Admin ---

  // Estadísticas del dashboard
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  // Listar todos los pedidos (admin)
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  // Obtener pedido completo (admin)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  // Actualizar estado del pedido (admin)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateDto);
  }

  // Agregar código de seguimiento (admin)
  @Patch(':id/tracking')
  updateTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTrackingDto,
  ) {
    return this.ordersService.updateTracking(id, updateDto);
  }

  // Eliminar pedido (soft delete - admin)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
