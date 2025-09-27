import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'O endereço de e-mail do utilizador para login.',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'A senha do utilizador para login.',
    example: 'strongPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
