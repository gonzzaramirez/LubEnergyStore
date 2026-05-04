import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('ADMIN')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Post('start')
  start() {
    return this.whatsappService.start();
  }

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Post('logout')
  logout() {
    return this.whatsappService.logout();
  }

  @Post('send')
  sendMessage(
    @Body()
    body: {
      phone: string;
      name: string;
      content: string;
      trackerId?: string;
    },
  ) {
    return this.whatsappService.sendMessage(body);
  }

  @Get('messages')
  getMessages() {
    return this.whatsappService.getMessages();
  }
}
