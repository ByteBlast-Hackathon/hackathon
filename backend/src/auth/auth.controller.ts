import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import  type { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiOperation({ summary: 'Autenticar um utilizador e obter um token JWT' })
  @ApiResponse({ status: 200, description: 'Autenticação bem-sucedida, token retornado.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  async signIn(@Body() authDto: AuthDto) {
    const user = await this.authService.validateUser(authDto.email, authDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }
    return this.authService.login(user);
  }

  @Get('validate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT) // Retorna 204 No Content em caso de sucesso
  @ApiOperation({ summary: 'Valida um token JWT existente de forma eficiente' })
  @ApiResponse({ status: 204, description: 'Token é válido.' })
  @ApiResponse({ status: 401, description: 'Não autorizado (token inválido ou em falta).' })
  validateToken() {

    return;
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém o perfil completo do utilizador atualmente logado' })
  @ApiResponse({ status: 200, description: 'Perfil do utilizador retornado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Não autorizado (token inválido ou em falta).' })
  getProfile(@Req() req: Request) {

    return req.user;
  }
}

