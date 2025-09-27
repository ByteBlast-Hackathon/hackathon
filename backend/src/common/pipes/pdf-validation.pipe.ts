import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class PdfValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) {
      throw new BadRequestException('Ficheiro não enviado.');
    }

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Validação falhou: Apenas ficheiros PDF são permitidos.');
    }

    return file;
  }
}
