import { Controller, Post, Body, Get, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const result = await this.authService.login(loginDto);

    // Determinar si estamos en producción con HTTPS
    const isProduction = process.env.NODE_ENV === 'production';
    // En producción detrás de proxy, asumimos HTTPS
    const isSecure = isProduction || request.protocol === 'https' || request.get('x-forwarded-proto') === 'https';
    
    // Detectar si frontend y backend están en dominios/subdominios diferentes
    const frontendUrl = process.env.FRONTEND_URL || '';
    const currentHost = request.get('host')?.split(':')[0] || '';
    const frontendHost = frontendUrl.replace(/https?:\/\//, '').split(':')[0].split('/')[0];
    
    // Verificar si son subdominios del mismo dominio base
    // Ejemplo: test.farmaciadeturnomc.site y api.farmaciadeturnomc.site comparten el dominio base
    let domain: string | undefined = undefined;
    let sameSiteValue: 'none' | 'lax' | 'strict' = 'lax';
    
    if (isProduction && currentHost && frontendHost && currentHost !== frontendHost) {
      // Extraer el dominio base (últimas 2 partes del hostname)
      const currentParts = currentHost.split('.');
      const frontendParts = frontendHost.split('.');
      
      // Si ambos tienen al menos 2 partes, verificar si comparten el dominio base
      if (currentParts.length >= 2 && frontendParts.length >= 2) {
        const currentBase = currentParts.slice(-2).join('.');
        const frontendBase = frontendParts.slice(-2).join('.');
        
        // Si comparten el dominio base, son same-site (usar 'lax' con dominio compartido)
        if (currentBase === frontendBase) {
          domain = `.${currentBase}`;
          sameSiteValue = 'lax';
        } else {
          // Dominios completamente diferentes, necesitamos 'none'
          sameSiteValue = 'none';
        }
      } else {
        // No podemos determinar, usar 'none' por seguridad
        sameSiteValue = 'none';
      }
    }
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
      path: '/',
    };

    // Agregar domain si es para subdominios del mismo dominio base
    if (domain) {
      cookieOptions.domain = domain;
    }

    response.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    response.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });
    
    // Log adicional para debug (siempre visible en producción para monitoreo)
    console.log('🍪 Cookies configuradas:', {
      domain: cookieOptions.domain || 'no domain (default)',
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      httpOnly: cookieOptions.httpOnly,
      path: cookieOptions.path,
      isCrossDomain: currentHost !== frontendHost,
      currentHost,
      frontendHost,
      frontendUrl,
      isProduction,
    });

    return {
      message: 'Login exitoso',
      user: result.user,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token;

    if (!refreshToken) {
      return { message: 'No hay refresh token' };
    }

    const result = await this.authService.refreshToken(refreshToken);

    // Usar la misma lógica de cookies que en login
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction || request.protocol === 'https' || request.get('x-forwarded-proto') === 'https';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const currentHost = request.get('host')?.split(':')[0] || '';
    const frontendHost = frontendUrl.replace(/https?:\/\//, '').split(':')[0].split('/')[0];
    
    let domain: string | undefined = undefined;
    let sameSiteValue: 'none' | 'lax' | 'strict' = 'lax';
    
    if (isProduction && currentHost && frontendHost && currentHost !== frontendHost) {
      const currentParts = currentHost.split('.');
      const frontendParts = frontendHost.split('.');
      
      if (currentParts.length >= 2 && frontendParts.length >= 2) {
        const currentBase = currentParts.slice(-2).join('.');
        const frontendBase = frontendParts.slice(-2).join('.');
        
        if (currentBase === frontendBase) {
          domain = `.${currentBase}`;
          sameSiteValue = 'lax';
        } else {
          sameSiteValue = 'none';
        }
      } else {
        sameSiteValue = 'none';
      }
    }
    
    const cookieOptions: any = {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
      path: '/',
      maxAge: 60 * 60 * 1000,
    };
    
    if (domain) {
      cookieOptions.domain = domain;
    }

    // Actualizar cookie del access token
    response.cookie('access_token', result.accessToken, cookieOptions);

    return { message: 'Token renovado' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    // Limpiar cookies con las mismas opciones que se usaron para crearlas
    const isProduction = process.env.NODE_ENV === 'production';
    const isSecure = isProduction || request.protocol === 'https' || request.get('x-forwarded-proto') === 'https';
    const frontendUrl = process.env.FRONTEND_URL || '';
    const currentHost = request.get('host')?.split(':')[0] || '';
    const frontendHost = frontendUrl.replace(/https?:\/\//, '').split(':')[0].split('/')[0];
    
    let domain: string | undefined = undefined;
    let sameSiteValue: 'none' | 'lax' | 'strict' = 'lax';
    
    if (isProduction && currentHost && frontendHost && currentHost !== frontendHost) {
      const currentParts = currentHost.split('.');
      const frontendParts = frontendHost.split('.');
      
      if (currentParts.length >= 2 && frontendParts.length >= 2) {
        const currentBase = currentParts.slice(-2).join('.');
        const frontendBase = frontendParts.slice(-2).join('.');
        
        if (currentBase === frontendBase) {
          domain = `.${currentBase}`;
          sameSiteValue = 'lax';
        } else {
          sameSiteValue = 'none';
        }
      } else {
        sameSiteValue = 'none';
      }
    }
    
    const clearOptions: any = {
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
    };
    
    if (domain) {
      clearOptions.domain = domain;
    }
    
    response.clearCookie('access_token', clearOptions);
    response.clearCookie('refresh_token', clearOptions);

    return { message: 'Sesión cerrada' };
  }

  @Get('me')
  async getProfile(@Req() request: Request) {
    const user = (request as any).user;
    return this.authService.getProfile(user.id);
  }

  @Public()
  @Get('check')
  async checkAuth(@Req() request: Request) {
    const accessToken = request.cookies?.access_token;
    return { authenticated: !!accessToken };
  }
}
