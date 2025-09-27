import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import HealthContext, { ContextSection } from '../context/health-context';

@Injectable()
export class AiService {
  private readonly context = HealthContext;
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct';

  constructor(private configService: ConfigService) {
  const key = this.configService.get<string>('HF_API_KEY');
    if (!key) {
      throw new Error('HF_API_KEY não configurada no ambiente');
    }
    this.apiKey = key;
}

  async queryHuggingFaceAPI(question: string, context: string): Promise<string> {
    try {
      const prompt = this.buildPrompt(question, context);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.3,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return data[0].generated_text || this.getFallbackResponse(question, context);
      }
      
      return data.generated_text || this.getFallbackResponse(question, context);
      
    } catch (error) {
      console.error('Erro na chamada da API Hugging Face:', error);
      return this.getFallbackResponse(question, context);
    }
  }

  private buildPrompt(question: string, context: string): string {
    return `<|begin_of_text|><|start_header_id|>system<|end_header_id|>

Você é um assistente especializado em operadora de saúde suplementar. Sua função é responder perguntas dos beneficiários com base nos fluxogramas institucionais fornecidos.

CONTEXTO E REGRAS IMPORTANTES:
- Responda de forma clara, objetiva e amigável em português brasileiro
- Use APENAS as informações fornecidas no contexto abaixo
- Seja preciso com prazos, documentos necessários e procedimentos
- Inclua informações práticas como documentos necessários e prazos quando relevante
- Se a pergunta não estiver relacionada ao contexto, diga educadamente que não pode ajudar
- Mantenha as respostas entre 100-300 palavras

CONTEXTO DOS FLUXOGRAMAS INSTITUCIONAIS:
${context}

<|start_header_id|>user<|end_header_id|>
Pergunta: ${question}

Responda com base exclusivamente no contexto fornecido acima, sendo útil e preciso.<|eot_id|><|start_header_id|>assistant<|end_header_id|>

Resposta:`;
  }

  private getFallbackResponse(question: string, context: string): string {
    // Busca por FAQ correspondente na pergunta
    const faqMatch = this.findFaqMatch(question);
    if (faqMatch) {
      return faqMatch;
    }

    // Fallback genérico baseado no contexto
    return `Com base nos fluxogramas institucionais da operadora de saúde, para sua pergunta sobre "${question}", recomendo seguir os procedimentos padrão descritos na documentação. Para informações mais específicas, entre em contato com nossa central de atendimento.`;
  }

  private findFaqMatch(question: string): string | null {
    const questionLower = question.toLowerCase();
    
    for (const section of this.context.sections) {
      if (section.faqs) {
        for (const faq of section.faqs) {
          // Verifica se há palavras-chave da pergunta do FAQ na pergunta do usuário
          const faqKeywords = faq.q.toLowerCase().split(/\s+/).filter(word => word.length > 3);
          const hasMatch = faqKeywords.some(keyword => questionLower.includes(keyword));
          
          if (hasMatch) {
            return faq.a;
          }
        }
      }
    }
    
    return null;
  }

  findRelevantContext(question: string): ContextSection[] {
    const questionLower = question.toLowerCase();
    const relevantSections: ContextSection[] = [];

    // Mapeamento de palavras-chave para cada seção
    const sectionKeywords: { [key: string]: string[] } = {
      troca_titularidade: ['titularidade', 'titular', 'troca', 'mudança titular', 'titular novo'],
      solicitacao_autorizacao: ['autorização', 'guia', 'procedimento', 'solicitação', 'autorizar', 'aprovação'],
      segunda_via_boleto: ['boleto', 'segunda via', 'pagamento', 'fatura', 'cobrança', 'emissão'],
      plano_maioridade: ['maioridade', '18 anos', 'dependente maior', 'idade', 'aniversário 18'],
      cobranca_indevida: ['cobrança indevida', 'contestação', 'fatura errada', 'cobrança errada', 'estorno'],
      atualizacao_cadastral: ['atualização cadastral', 'mudar endereço', 'atualizar dados', 'cadastro', 'dados pessoais'],
      agendamento_consultas: ['agendamento', 'consulta', 'marcar', 'horário', 'médico', 'especialista']
    };

    // Buscar por seções relevantes baseadas em palavras-chave
    this.context.sections.forEach(section => {
      const keywords = sectionKeywords[section.id] || [];
      const hasDirectKeyword = keywords.some(keyword => 
        questionLower.includes(keyword)
      );

      // Buscar por correspondência no título e conteúdo
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      const wordMatches = questionLower.split(' ')
        .filter(word => word.length > 3)
        .some(word => sectionText.includes(word));

      if (hasDirectKeyword || wordMatches) {
        relevantSections.push(section);
      }
    });

    // Ordenar por relevância (mais palavras-chave correspondentes primeiro)
    relevantSections.sort((a, b) => {
      const scoreA = this.calculateRelevanceScore(questionLower, a);
      const scoreB = this.calculateRelevanceScore(questionLower, b);
      return scoreB - scoreA;
    });

    // Retornar no máximo 3 seções mais relevantes
    return relevantSections.slice(0, 3);
  }

  private calculateRelevanceScore(question: string, section: ContextSection): number {
    let score = 0;
    const sectionText = (section.title + ' ' + section.content).toLowerCase();
    
    // Palavras-chave específicas por seção
    const sectionKeywords: { [key: string]: string[] } = {
      troca_titularidade: ['titularidade', 'titular', 'troca'],
      solicitacao_autorizacao: ['autorização', 'guia', 'procedimento'],
      segunda_via_boleto: ['boleto', 'segunda via', 'pagamento'],
      plano_maioridade: ['maioridade', '18 anos', 'dependente'],
      cobranca_indevida: ['cobrança', 'indevida', 'contestação'],
      atualizacao_cadastral: ['cadastral', 'endereço', 'dados'],
      agendamento_consultas: ['agendamento', 'consulta', 'marcar']
    };

    const keywords = sectionKeywords[section.id] || [];
    
    // Pontuar por palavras-chave diretas
    keywords.forEach(keyword => {
      if (question.includes(keyword)) {
        score += 3;
      }
    });

    // Pontuar por outras palavras relevantes
    question.split(' ').forEach(word => {
      if (word.length > 3 && sectionText.includes(word)) {
        score += 1;
      }
    });

    return score;
  }

  async processQuestion(question: string): Promise<{
    answer: string;
    relevantSections: ContextSection[];
    confidence: number;
    source: 'huggingface' | 'faq' | 'fallback';
    suggestedQuestions?: string[];
  }> {
    const relevantSections = this.findRelevantContext(question);
    const contextText = this.buildContextText(relevantSections);

    let answer: string;
    let source: 'huggingface' | 'faq' | 'fallback' = 'huggingface';

    // Primeiro tenta encontrar no FAQ
    const faqAnswer = this.findFaqMatch(question);
    if (faqAnswer) {
      answer = faqAnswer;
      source = 'faq';
    } else {
      // Se não encontrou no FAQ, usa a API
      try {
        answer = await this.queryHuggingFaceAPI(question, contextText);
        source = 'huggingface';
      } catch (error) {
        answer = this.getFallbackResponse(question, contextText);
        source = 'fallback';
      }
    }
    
    return {
      answer: this.cleanResponse(answer),
      relevantSections,
      confidence: this.calculateConfidence(question, relevantSections),
      source,
      suggestedQuestions: this.generateSuggestedQuestions(relevantSections)
    };
  }

  private buildContextText(sections: ContextSection[]): string {
    return sections.map(section => 
      `FLUXOGRAMA: ${section.title}
DESCRIÇÃO: ${section.content}
DOCUMENTOS NECESSÁRIOS: ${section.documents?.join(', ') || 'Não especificado'}
PRAZOS: ${section.timeEstimate || 'Não especificado'}
PERGUNTAS FREQUENTES: ${section.faqs?.map(faq => `P: ${faq.q} R: ${faq.a}`).join(' | ') || 'Nenhuma'}
---`
    ).join('\n\n');
  }

  private cleanResponse(response: string): string {
    return response
      .replace(/<\|[^>]+\|>/g, '')
      .replace(/Resposta:\s*/i, '')
      .replace(/\n+/g, '\n')
      .trim();
  }

  private calculateConfidence(question: string, sections: ContextSection[]): number {
    if (sections.length === 0) return 0.3;

    const questionWords = question.toLowerCase().split(' ').filter(word => word.length > 3);
    if (questionWords.length === 0) return 0.5;

    let totalMatches = 0;

    sections.forEach(section => {
      const sectionText = (section.title + ' ' + section.content).toLowerCase();
      questionWords.forEach(word => {
        if (sectionText.includes(word)) {
          totalMatches++;
        }
      });
    });

    const confidence = Math.min(totalMatches / questionWords.length, 1);
    return Math.round(confidence * 100) / 100;
  }

  private generateSuggestedQuestions(sections: ContextSection[]): string[] {
    const questions: string[] = [];
    
    sections.forEach(section => {
      if (section.faqs && section.faqs.length > 0) {
        // Adiciona as perguntas do FAQ como sugestões
        section.faqs.slice(0, 2).forEach(faq => {
          questions.push(faq.q);
        });
      } else {
        // Gera perguntas genéricas baseadas no título
        questions.push(`Quais documentos preciso para ${section.title.toLowerCase()}?`);
        questions.push(`Qual o prazo para ${section.title.toLowerCase()}?`);
      }
    });

    return questions.slice(0, 3); // Máximo 3 sugestões
  }

  // Métodos para gerenciar o contexto
  getAllSections(): ContextSection[] {
    return this.context.sections;
  }

  getSectionById(id: string): ContextSection | null {
    return this.context.sections.find(section => section.id === id) || null;
  }

  updateSection(id: string, updates: Partial<ContextSection>): ContextSection {
    const sectionIndex = this.context.sections.findIndex(section => section.id === id);
    
    if (sectionIndex === -1) {
      throw new HttpException('Seção não encontrada', HttpStatus.NOT_FOUND);
    }

    this.context.sections[sectionIndex] = {
      ...this.context.sections[sectionIndex],
      ...updates
    };

    return this.context.sections[sectionIndex];
  }

  addSection(newSection: Omit<ContextSection, 'id'>): ContextSection {
    const section: ContextSection = {
      ...newSection,
      id: `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.context.sections.push(section);
    return section;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}