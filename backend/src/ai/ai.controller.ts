import { Controller, Post, Get, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AiService } from './ai.service';
import { ContextSection } from '../context/health-context';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { question: string }) {
    try {
      if (!body.question || body.question.trim().length === 0) {
        throw new HttpException('Pergunta é obrigatória', HttpStatus.BAD_REQUEST);
      }

      if (body.question.length > 500) {
        throw new HttpException('Pergunta muito longa (máximo 500 caracteres)', HttpStatus.BAD_REQUEST);
      }

      const result = await this.aiService.processQuestion(body.question);
      
      return {
        success: true,
        question: body.question,
        answer: result.answer,
        relevantSections: result.relevantSections.map(section => ({
          id: section.id,
          title: section.title,
          timeEstimate: section.timeEstimate,
          documents: section.documents
        })),
        confidence: result.confidence,
        source: result.source,
        suggestedQuestions: result.suggestedQuestions,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao processar pergunta',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('context/sections')
  async getAllSections() {
    try {
      const sections = this.aiService.getAllSections();
      return {
        success: true,
        sections: sections.map(section => ({
          id: section.id,
          title: section.title,
          contentPreview: section.content.substring(0, 150) + '...',
          actors: section.actors,
          documents: section.documents,
          timeEstimate: section.timeEstimate,
          faqCount: section.faqs?.length || 0
        })),
        total: sections.length
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar seções',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('context/sections/:id')
  async getSectionDetail(@Param('id') id: string) {
    try {
      const section = this.aiService.getSectionById(id);
      
      if (!section) {
        throw new HttpException('Seção não encontrada', HttpStatus.NOT_FOUND);
      }

      return {
        success: true,
        section: {
          id: section.id,
          title: section.title,
          content: section.content,
          actors: section.actors,
          documents: section.documents,
          timeEstimate: section.timeEstimate,
          decisionPoints: section.decisionPoints,
          faqs: section.faqs
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao buscar seção',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('context/sections/:id')
  async updateSection(
    @Param('id') id: string,
    @Body() body: Partial<ContextSection>
  ) {
    try {
      const updatedSection = this.aiService.updateSection(id, body);
      
      return {
        success: true,
        message: 'Seção atualizada com sucesso',
        section: {
          id: updatedSection.id,
          title: updatedSection.title
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao atualizar seção',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('context/sections')
  async addSection(@Body() body: Omit<ContextSection, 'id'>) {
    try {
      if (!body.title || !body.content) {
        throw new HttpException('Título e conteúdo são obrigatórios', HttpStatus.BAD_REQUEST);
      }

      const newSection = this.aiService.addSection(body);
      
      return {
        success: true,
        message: 'Seção adicionada com sucesso',
        section: {
          id: newSection.id,
          title: newSection.title
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Erro ao adicionar seção',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  async healthCheck() {
    try {
      const isApiHealthy = await this.aiService.testConnection();
      const sections = this.aiService.getAllSections();
      
      return {
        success: true,
        api_status: isApiHealthy ? 'connected' : 'disconnected',
        sections_count: sections.length,
        timestamp: new Date().toISOString(),
        message: isApiHealthy ? 
          'Conexão com Hugging Face API estabelecida' : 
          'Conexão com Hugging Face API indisponível - usando fallback'
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao verificar saúde do serviço',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('faqs')
  async getAllFaqs() {
    try {
      const sections = this.aiService.getAllSections();
      const allFaqs: Array<{section: string, question: string, answer: string}> = [];
      
      sections.forEach(section => {
        if (section.faqs) {
          section.faqs.forEach(faq => {
            allFaqs.push({
              section: section.title,
              question: faq.q,
              answer: faq.a
            });
          });
        }
      });

      return {
        success: true,
        faqs: allFaqs,
        total: allFaqs.length
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar FAQs',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}