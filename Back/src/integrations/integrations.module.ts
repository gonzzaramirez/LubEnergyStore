import { Module } from '@nestjs/common';
import { DiscountCodesModule } from '../discount-codes/discount-codes.module';
import { SaasDiscountIntegrationController } from './saas-discount-integration.controller';
import { SaasApiKeyGuard } from './saas-api-key.guard';

@Module({
  imports: [DiscountCodesModule],
  controllers: [SaasDiscountIntegrationController],
  providers: [SaasApiKeyGuard],
})
export class IntegrationsModule {}
