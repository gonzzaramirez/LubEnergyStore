import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // Aumento/baja masivo de precios
  @Post('bulk-price-update')
  bulkPriceUpdate(@Body() dto: BulkPriceUpdateDto) {
    return this.productsService.bulkPriceUpdate(dto);
  }

  @Get('deleted')
  findAllDeleted() {
    return this.productsService.findAllDeleted();
  }

  @Get()
  findAll(@Query('featured') featured?: string) {
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.productsService.findAll(isFeatured);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // Historial de precios de un producto
  @Get(':id/price-history')
  getPriceHistory(@Param('id') id: string) {
    return this.productsService.getPriceHistory(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
