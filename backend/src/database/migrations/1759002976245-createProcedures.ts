import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProcedures1759002976245 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE procedures (
                id SERIAL PRIMARY KEY,
                codigo VARCHAR(20) NOT NULL,
                terminologia TEXT NOT NULL,
                correlacao BOOLEAN NOT NULL DEFAULT false,
                procedimento TEXT NULL,
                resolucao_normativa VARCHAR(100) NULL,
                vigencia DATE NULL,
                od VARCHAR(20) NULL,
                amb VARCHAR(20) NULL,
                hco VARCHAR(20) NULL,
                hso VARCHAR(20) NULL,
                pac VARCHAR(20) NULL,
                dut VARCHAR(20) NULL,
                subgrupo VARCHAR(100) NULL,
                grupo VARCHAR(100) NULL,
                capitulo VARCHAR(100) NULL,
                categoria VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE procedures`);
    }
}
