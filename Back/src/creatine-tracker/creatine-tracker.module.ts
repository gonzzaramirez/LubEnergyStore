import { Module } from '@nestjs/common';
import { CreatineTrackerService } from './creatine-tracker.service';
import { CreatineTrackerController } from './creatine-tracker.controller';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [CreatineTrackerController],
  providers: [CreatineTrackerService],
  exports: [CreatineTrackerService],
})
export class CreatineTrackerModule {}
