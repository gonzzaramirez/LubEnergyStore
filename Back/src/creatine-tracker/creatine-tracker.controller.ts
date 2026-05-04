import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreatineTrackerService } from './creatine-tracker.service';
import { CreateTrackerDto } from './dto/create-tracker.dto';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('ADMIN')
@Controller('creatine-tracker')
export class CreatineTrackerController {
  constructor(private readonly service: CreatineTrackerService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('products')
  getCreatineProducts() {
    return this.service.getCreatineProducts();
  }

  @Post()
  create(@Body() dto: CreateTrackerDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateTrackerDto>,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }

  @Post('reminders/send-now')
  sendRemindersNow() {
    return this.service.checkAndSendReminders();
  }
}
