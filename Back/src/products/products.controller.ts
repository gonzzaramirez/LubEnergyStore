import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BulkPriceUpdateDto } from './dto/bulk-price-update.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { SaasApiKeyGuard } from '../integrations/saas-api-key.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public() // Apaga el JWTAuthGuard para esta ruta
  @UseGuards(SaasApiKeyGuard) // Prende la validación por API Key
  @Post('sync-sheets')
  async syncSheets(
    @Body()
    payload: { sku: string; price?: number | null; stock?: number | null }[],
  ) {
    return this.productsService.syncFromSheets(payload);
  }

  // --- RUTAS PÚBLICAS ---

  @Public()
  @Get()
  findAll(@Query('featured') featured?: string) {
    const isFeatured =
      featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.productsService.findAll(isFeatured);
  }

  @Public()
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // --- RUTAS PROTEGIDAS (ADMIN) ---

  @Roles('ADMIN')
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Roles('ADMIN')
  @Post('bulk-price-update')
  bulkPriceUpdate(@Body() dto: BulkPriceUpdateDto) {
    return this.productsService.bulkPriceUpdate(dto);
  }

  @Roles('ADMIN')
  @Get('admin/deleted')
  findAllDeleted() {
    return this.productsService.findAllDeleted();
  }

  @Roles('ADMIN')
  @Get(':id/price-history')
  getPriceHistory(@Param('id') id: string) {
    return this.productsService.getPriceHistory(id);
  }

  @Roles('ADMIN')
  @Patch(':id/restore')
  restore(@Param('id') id: string) {
    return this.productsService.restore(id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
