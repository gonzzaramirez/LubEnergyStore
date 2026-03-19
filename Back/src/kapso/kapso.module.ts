import { Global, Module } from '@nestjs/common';
import { KapsoService } from './kapso.service';

@Global()
@Module({
  providers: [KapsoService],
  exports: [KapsoService],
})
export class KapsoModule {}
