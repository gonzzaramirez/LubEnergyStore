import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiscountCodesService } from './discount-codes.service';
import { CreateDiscountCodeDto } from './dto/create-discount-code.dto';
import { UpdateDiscountCodeDto } from './dto/update-discount-code.dto';
import { ValidateDiscountCodeDto } from './dto/validate-discount-code.dto';

@Controller('discount-codes')
export class DiscountCodesController {
  constructor(private readonly discountCodesService: DiscountCodesService) {}

  @Post()
  create(@Body() dto: CreateDiscountCodeDto) {
    return this.discountCodesService.create(dto);
  }

  // Validar código (público - para el carrito)
  @Post('validate')
  validate(@Body() dto: ValidateDiscountCodeDto) {
    return this.discountCodesService.validate(dto);
  }

  @Get()
  findAll() {
    return this.discountCodesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountCodesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDiscountCodeDto) {
    return this.discountCodesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountCodesService.remove(id);
  }
}
