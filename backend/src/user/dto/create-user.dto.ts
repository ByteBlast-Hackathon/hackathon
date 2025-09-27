import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'O nome completo do usuário.',
    example: 'John Doe',
  })
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
  @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password: string;
}