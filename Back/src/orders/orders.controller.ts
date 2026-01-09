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
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- RUTAS PÚBLICAS ---

  // Crear nuevo pedido (público - desde checkout)
  @Public()
  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Obtener pedido público (para página de seguimiento)
  @Public()
  @Get('track/:id')
  findOnePublic(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOnePublic(id);
  }

  // --- RUTAS PROTEGIDAS (ADMIN) ---

  // Estadísticas del dashboard
  @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.ordersService.getStats();
  }

  // Listar todos los pedidos (admin)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('status') status?: OrderStatus) {
    return this.ordersService.findAll(status);
  }

  // Obtener pedido completo (admin)
  @Roles('ADMIN')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  // Actualizar estado del pedido (admin)
  @Roles('ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    try {
      return this.ordersService.updateStatus(id, updateDto);
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error;
    }
  }

  // Agregar código de seguimiento (admin)
  @Roles('ADMIN')
  @Patch(':id/tracking')
  updateTracking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTrackingDto,
  ) {
    return this.ordersService.updateTracking(id, updateDto);
  }

  // Eliminar pedido (soft delete - admin)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
