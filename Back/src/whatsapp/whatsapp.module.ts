import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { EvolutionProvider } from './evolution.provider';

@Module({
  controllers: [WhatsappController],
  providers: [WhatsappService, EvolutionProvider],
  exports: [WhatsappService],
})
export class WhatsappModule {}
