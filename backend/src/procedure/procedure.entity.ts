import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('procedures')
export class Procedure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20 })
  codigo: string;

  @Column({ type: 'text'})
  terminologia: string;

  @Column({ type: 'boolean', default: false })
  correlacao: boolean;

  @Column({ type: 'text', nullable: true })
  procedimento: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolucao_normativa: string | null;

  @Column({ type: 'date', nullable: true })
  vigencia: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  od: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  amb: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hco: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  hso: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  pac: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dut: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subgrupo: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  grupo: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  capitulo: string | null;

  @Column({ type: 'varchar', length: 50 })
  categoria: string;
}