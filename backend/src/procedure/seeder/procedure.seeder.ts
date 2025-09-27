import 'dotenv/config';
import { AppDataSource } from '../../database/data-source';
import { Procedure } from '../procedure.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as xlsx from 'xlsx';

const excelFileName = 'Rol - Procedimentos.xlsx';
const sheetsToProcess = [
  { sheetName: 'Sem Auditoria', category: 'Sem Auditoria' },
  { sheetName: 'Auditoria', category: 'Auditoria' },
  { sheetName: 'OPME', category: 'OPME' },
];

async function seed() {
  console.log('--- Iniciando o script de seeding para procedimentos a partir do ficheiro XLSX ---');

  try {
    await AppDataSource.initialize();
    console.log('Conexão com o banco de dados estabelecida para o seeder.');

    const procedureRepository = AppDataSource.getRepository(Procedure);
    const filePath = path.join(__dirname, '../data', excelFileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Ficheiro Excel não encontrado em: ${filePath}`);
    }

    const workbook = xlsx.readFile(filePath);

    for (const sheetInfo of sheetsToProcess) {
      console.log(`\n[Processando a planilha: ${sheetInfo.sheetName}]`);

      const worksheet = workbook.Sheets[sheetInfo.sheetName];
      if (!worksheet) {
        console.warn(`AVISO: Planilha "${sheetInfo.sheetName}" não encontrada no ficheiro. A pular...`);
        continue;
      }

      const rows: any[] = xlsx.utils.sheet_to_json(worksheet);
      const procedures: Procedure[] = [];

      for (const row of rows) {
        if (!row['Código']) continue;

        const procedure = new Procedure();
        procedure.codigo = String(row['Código']);
        procedure.terminologia = row['Terminologia de Procedimentos e Eventos em Saúde (Tab. 22)'];
        procedure.correlacao = row['Correlação\n(Sim/Não)']?.toUpperCase() === 'SIM';
        procedure.procedimento = row['PROCEDIMENTO'] === '---' ? null : row['PROCEDIMENTO'];
        procedure.resolucao_normativa = row['Resolução\nNormativa (alteração)'] === '---' ? null : row['Resolução\nNormativa (alteração)'];

        const vigenciaValue = row['VIGÊNCIA'];
        if (vigenciaValue) {
          const date = xlsx.SSF.parse_date_code(vigenciaValue);
          procedure.vigencia = new Date(date.y, date.m - 1, date.d);
        } else {
          procedure.vigencia = null;
        }

        procedure.od = row['OD'] === '---' ? null : row['OD'];
        procedure.amb = row['AMB'] === '---' ? null : row['AMB'];
        procedure.hco = row['HCO'] === '---' ? null : row['HCO'];
        procedure.hso = row['HSO'] === '---' ? null : row['HSO'];
        procedure.pac = row['PAC'] === '---' ? null : row['PAC'];
        procedure.dut = row['DUT'] === '---' ? null : row['DUT'];
        procedure.subgrupo = row['SUBGRUPO'] === '---' ? null : row['SUBGRUPO'];
        procedure.grupo = row['GRUPO'] === '---' ? null : row['GRUPO'];
        procedure.capitulo = row['CAPÍTULO'] === '---' ? null : row['CAPÍTULO'];
        procedure.categoria = sheetInfo.category;
        procedures.push(procedure);
      }

      if (procedures.length > 0) {
        console.log(`Inserindo/Atualizando ${procedures.length} registos da categoria '${sheetInfo.category}'...`);
        await procedureRepository.save(procedures, { chunk: 500 });
        console.log('Registos processados com sucesso.');
      } else {
        console.log('Nenhum registo encontrado nesta planilha.');
      }
    }
  } catch (error) {
    console.error('Ocorreu um erro durante o seeding:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\nConexão com o banco de dados fechada.');
    }
  }
  console.log('\n--- Script de seeding concluído! ---');
}

seed();



