import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SaasApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('SAAS_DISCOUNT_API_KEY');
    if (!expected || expected.length < 16) {
      throw new ServiceUnavailableException(
        'Integración SaaS de cupones no configurada (SAAS_DISCOUNT_API_KEY)',
      );
    }

    const request = context
      .switchToHttp()
      .getRequest<{ headers: Record<string, string | undefined> }>();
    const headerKey = request.headers['x-api-key'];
    const auth = request.headers['authorization'];
    let provided: string | undefined =
      typeof headerKey === 'string' ? headerKey : undefined;
    if (!provided && typeof auth === 'string' && auth.startsWith('Bearer ')) {
      provided = auth.slice(7).trim();
    }

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('API key inválida o ausente');
    }

    return true;
  }
}
