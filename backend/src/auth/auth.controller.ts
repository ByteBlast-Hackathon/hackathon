import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

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
}



