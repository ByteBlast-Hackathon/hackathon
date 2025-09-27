import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'O nome completo do usuário.',
    example: 'John Doe',
  })
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
  name: string;

  @ApiProperty({
    description: 'O endereço de e-mail do usuário.',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @IsNotEmpty({ message: 'O e-mail não pode ser vazio.' })
  email: string;

  @ApiProperty({
    description: 'A senha do usuário (mínimo de 6 caracteres).',
    example: 'strongPassword123',
  })
  @IsString({ message: 'A senha deve ser uma string.' })
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;

  @ApiProperty({
    description: 'CPF do usuário (opcional).',
    example: '123.456.789-00',
    required: false,
  })
  @IsString({ message: 'O CPF deve ser uma string.' })
  @IsOptional()
  cpf?: string;

  @ApiProperty({
    description: 'Telefone do usuário (opcional).',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsString({ message: 'O telefone deve ser uma string.' })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Data de nascimento do usuário (opcional).',
    example: '1990-01-01',
    required: false,
  })
  @IsDateString({}, { message: 'Formato de data inválido. Use YYYY-MM-DD.' })
  @IsOptional()
  birthDate?: Date;
}