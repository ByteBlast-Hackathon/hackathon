import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Procedure } from '../procedure/procedure.entity';
import pdf from 'pdf-parse';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
  ) {}

  async processExamRequest(file: Express.Multer.File): Promise<any> {
    try {
      console.log('Iniciando a análise do ficheiro PDF...');
      const data = await pdf(file.buffer);
      const pdfText = data.text;
      console.log('Texto extraído do PDF:', pdfText);

      const procedureCodes = pdfText.match(/\d{8}/g) || [];
      if (procedureCodes.length === 0) {
        return {
          status: 'Falha',
          message: 'Nenhum código de procedimento válido foi encontrado no documento.',
        };
      }
      console.log('Códigos encontrados:', procedureCodes);

      const procedimentos = await this.procedureRepository.find({
        where: {
          codigo: In(procedureCodes),
        },
      });

      if (procedimentos.length === 0) {
        return {
          status: 'Não Autorizado',
          message: `Os procedimentos com os códigos [${procedureCodes.join(
            ', ',
          )}] não foram encontrados ou não têm cobertura.`,
        };
      }

      const needsOpmeAudit = procedimentos.some(p => p.categoria === 'OPME');
      if (needsOpmeAudit) {
        return {
          status: 'Em Análise (OPME)',
          message: 'O seu pedido foi recebido e necessita de uma auditoria de OPME (Órteses, Próteses e Materiais Especiais). O prazo estimado para o retorno é de 10 dias úteis.',
          procedimentos,
        };
      }

      const needsNormalAudit = procedimentos.some(
        p => p.categoria === 'Auditoria',
      );
      if (needsNormalAudit) {
        return {
          status: 'Em Análise',
          message: 'O seu pedido foi recebido e necessita de uma análise/auditoria. O prazo estimado para o retorno é de 5 dias úteis.',
          procedimentos,
        };
      }

      return {
        status: 'Autorizado',
        message: 'O seu pedido foi autorizado automaticamente!',
        procedimentos,
      };
    } catch (error) {
      console.error('Ocorreu um erro no serviço de autorização:', error);
      throw new InternalServerErrorException(
        'Não foi possível processar o seu pedido de autorização.',
      );
    }
  }
}

