// src/user/user.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe, 
  HttpCode, 
  HttpStatus,
  UseGuards 
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo utilizador' })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilizador criado com sucesso.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'E-mail já registado.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados de entrada inválidos.' 
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os utilizadores' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de utilizadores devolvida com sucesso.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado.' 
  })
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Procurar um utilizador pelo ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID numérico do utilizador', 
    type: 'integer' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilizador encontrado.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Utilizador não encontrado.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado.' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar um utilizador pelo ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID numérico do utilizador', 
    type: 'integer' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilizador atualizado com sucesso.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Utilizador não encontrado.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'E-mail já em uso por outra conta.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado.' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return await this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar um utilizador pelo ID' })
  @ApiParam({ 
    name: 'id', 
    description: 'ID numérico do utilizador', 
    type: 'integer' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilizador eliminado com sucesso.' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Utilizador não encontrado.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Não autorizado.' 
  })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.userService.remove(id);
  }
}