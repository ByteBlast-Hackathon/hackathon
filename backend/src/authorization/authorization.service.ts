import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Brackets } from 'typeorm';
import { Procedure } from '../procedure/procedure.entity';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs';
import * as path from 'path';
import { fromPath } from 'pdf2pic';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
  ) {}

  async processExamRequest(file: Express.Multer.File): Promise<any> {
    const pdfPath = file.path;
    let imagePath: string | undefined;

    try {
      console.log(`Iniciando a conversão do PDF: ${pdfPath}`);
      const options = {
        density: 300,
        saveFilename: `page_${Date.now()}`,
        savePath: path.dirname(pdfPath),
        format: 'png',
        width: 1200,
        height: 1600,
        useGM: false,
      };
      const convert = fromPath(pdfPath, options);
      const result = await convert(1, { responseType: 'image' });
      if (!result || !result.path) {
        throw new InternalServerErrorException('Falha ao obter o caminho da imagem convertida a partir do PDF.');
      }
      imagePath = result.path;
      console.log(`Imagem gerada com sucesso: ${imagePath}`);

      console.log('Iniciando o processo de OCR na imagem...');
      const worker = await createWorker('por');
      const { data: { text: ocrText } } = await worker.recognize(imagePath);
      await worker.terminate();
      console.log('Texto extraído com OCR:', ocrText);

      const procedureCodes = ocrText.match(/\d{8}/g) || [];
      let searchTerms: string[] = [];

      if (procedureCodes.length > 0) {
        console.log('Códigos encontrados:', procedureCodes);
      } else {
        console.log('Nenhum código encontrado. A procurar por nomes de exames...');

        const ignorePatterns = [
          /^nome[:\s]/i,
          /^data[:\s]/i,
          /hospital/i,
          /sociedade/i,
        ];

        const possibleTerms = ocrText
          .split(/[\n,;.]/)
          .map(t => t.trim())
          .filter(t =>
            t.length > 5 &&
            t.length < 120 &&
            !ignorePatterns.some(rx => rx.test(t))
          );

        searchTerms = possibleTerms;
        console.log('Termos de pesquisa filtrados:', searchTerms);

        if (searchTerms.length === 0) {
          return {
            status: 'Falha',
            message: 'Nenhum código ou nome de procedimento reconhecível foi encontrado no documento.',
          };
        }
      }

      let procedimentos: Procedure[] = [];

      if (procedureCodes.length > 0) {
        procedimentos = await this.procedureRepository.find({ where: { codigo: In(procedureCodes) } });
      } else if (searchTerms.length > 0) {
        const queryBuilder = this.procedureRepository.createQueryBuilder('procedure');

        queryBuilder.where(new Brackets(qb => {
          searchTerms.forEach((term, index) => {
            const cleanTerm = term
              .replace(/[^\wÀ-ú\s-]/g, '')
              .split(/\s+/)
              .slice(0, 3)
              .join(' ');

            if (cleanTerm.length > 3) {
              qb.orWhere(`LOWER(procedure.terminologia) LIKE LOWER(:term${index})`, {
                [`term${index}`]: `%${cleanTerm}%`,
              });
            }
          });
        }));

        procedimentos = await queryBuilder.getMany();
      }

      if (procedimentos.length === 0) {
        return {
          status: 'Não Autorizado',
          message: `Nenhum procedimento correspondente aos termos [${procedureCodes.join(', ') || searchTerms.join(', ')}] foi encontrado na nossa lista de cobertura.`,
        };
      }

      const needsOpmeAudit = procedimentos.some(p => p.categoria === 'OPME');
      if (needsOpmeAudit) {
        return {
          status: 'Em Análise (OPME)',
          message: 'O seu pedido foi recebido e necessita de uma auditoria de OPME (Órteses, Próteses e Materiais Especiais). O prazo estimado para o retorno é de 10 dias úteis.',
        };
      }

      const needsNormalAudit = procedimentos.some(p => p.categoria === 'Auditoria');
      if (needsNormalAudit) {
        return {
          status: 'Em Análise',
          message: 'O seu pedido foi recebido e necessita de uma análise/auditoria. O prazo estimado para o retorno é de 5 dias úteis.',
        };
      }

      return {
        status: 'Autorizado',
        message: 'O seu pedido foi autorizado automaticamente!',
      };

    } catch (error) {
      console.error('Ocorreu um erro no serviço de autorização:', error);
      throw new InternalServerErrorException('Não foi possível processar o seu pedido de autorização.');
    } finally {
      if (pdfPath && fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
}

