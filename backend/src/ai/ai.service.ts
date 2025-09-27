import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  processText(data: { text: string }): { processedText: string } {
    const processedText = data.text.toUpperCase();
    return { processedText };
  }
}