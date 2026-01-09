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
    
    // Si los hosts son diferentes (incluso subdominios), necesitamos sameSite: 'none'
    // Ejemplo: tudominio.com vs api.tudominio.com
    const isCrossDomain = isProduction && frontendUrl && currentHost && frontendHost && currentHost !== frontendHost;

    // Configurar cookies httpOnly
    // En producción con subdominios diferentes, usar 'none', sino 'lax'
    const sameSiteValue = (isCrossDomain ? 'none' : 'lax') as 'none' | 'lax' | 'strict';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
      path: '/',
    };

    response.cookie('access_token', result.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hora
    });

    response.cookie('refresh_token', result.refreshToken, {
      ...cookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    });

    // Log para debug (siempre, para poder ver en producción)
    console.log('🍪 Cookies configuradas:', {
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      isCrossDomain,
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
    const isCrossDomain = isProduction && frontendUrl && currentHost && frontendHost && currentHost !== frontendHost;
    const sameSiteValue = (isCrossDomain ? 'none' : 'lax') as 'none' | 'lax' | 'strict';

    // Actualizar cookie del access token
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

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
    const isCrossDomain = isProduction && frontendUrl && currentHost && frontendHost && currentHost !== frontendHost;
    const sameSiteValue = (isCrossDomain ? 'none' : 'lax') as 'none' | 'lax' | 'strict';
    
    response.clearCookie('access_token', { 
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
    });
    response.clearCookie('refresh_token', { 
      path: '/',
      httpOnly: true,
      secure: isSecure,
      sameSite: sameSiteValue,
    });

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
