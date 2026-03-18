import { Module } from '@nestjs/common';
import { TaloPlaygroundController } from './talo-playground.controller';
import { TaloPlaygroundService } from './talo-playground.service';

@Module({
  controllers: [TaloPlaygroundController],
  providers: [TaloPlaygroundService],
  exports: [TaloPlaygroundService],
})
export class TaloPlaygroundModule {}
