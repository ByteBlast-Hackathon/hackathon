import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo utilizador' })
  @ApiResponse({ status: 201, description: 'Utilizador criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'E-mail já registado.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os utilizadores' })
  @ApiResponse({ status: 200, description: 'Lista de utilizadores devolvida com sucesso.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar um utilizador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID numérico do utilizador', type: 'integer' })
  @ApiResponse({ status: 200, description: 'Utilizador encontrado.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um utilizador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID numérico do utilizador', type: 'integer' })
  @ApiResponse({ status: 200, description: 'Utilizador atualizado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  @ApiResponse({ status: 409, description: 'E-mail já em uso por outra conta.' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar um utilizador pelo ID' })
  @ApiParam({ name: 'id', description: 'ID numérico do utilizador', type: 'integer' })
  @ApiResponse({ status: 200, description: 'Utilizador eliminado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Utilizador não encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}

