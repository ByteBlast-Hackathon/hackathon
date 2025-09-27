import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @MinLength(5, { message: 'A pergunta deve ter pelo menos 5 caracteres' })
  @MaxLength(3000, { message: 'A pergunta não pode ter mais de 3000 caracteres' })
  question: string;
}

export class UpdateContextDto {
  @IsString()
  @MinLength(3)
  title?: string;

  @IsString()
  @MinLength(10)
  content?: string;
}