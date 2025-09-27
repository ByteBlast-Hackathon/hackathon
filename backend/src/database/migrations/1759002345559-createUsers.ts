import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsers1759002345559 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                cpf VARCHAR(14) NULL,
                phone VARCHAR(20) NULL,
                birth_date DATE NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);

     
        await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
        await queryRunner.query(`CREATE INDEX idx_users_cpf ON users(cpf)`);
        await queryRunner.query(`CREATE INDEX idx_users_is_active ON users(is_active)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX idx_users_is_active`);
        await queryRunner.query(`DROP INDEX idx_users_cpf`);
        await queryRunner.query(`DROP INDEX idx_users_email`);
        await queryRunner.query(`DROP TABLE users`);
    }
}
