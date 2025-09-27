import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('process-text')
  @ApiOperation({ summary: 'Processar um texto com IA (simulação)' })
  @ApiResponse({ status: 200, description: 'Texto processado com sucesso.' })
  processText(@Body() body: { text: string }) {
    return this.aiService.processText(body);
  }
}