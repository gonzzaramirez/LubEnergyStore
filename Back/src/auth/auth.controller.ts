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
  ) {
    const result = await this.authService.login(loginDto);

    // Configurar cookies httpOnly
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
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

    // Actualizar cookie del access token
    response.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 1000,
    });

    return { message: 'Token renovado' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    // Limpiar cookies
    response.clearCookie('access_token', { path: '/' });
    response.clearCookie('refresh_token', { path: '/' });

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
