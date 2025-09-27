import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctors1758998751275 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        specialty VARCHAR(50) NOT NULL,
        city VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        bio TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

   
    await queryRunner.query(`
      INSERT INTO doctors (name, specialty, city, phone, email, bio) VALUES
      ('Dr. Carlos Silva', 'cardiology', 'São Paulo', '(11) 9999-8888', 'carlos.silva@clinica.com', 'Cardiologista com 15 anos de experiência'),
      ('Dra. Maria Santos', 'dermatology', 'Rio de Janeiro', '(21) 7777-6666', 'maria.santos@clinica.com', 'Dermatologista especializada em estética'),
      ('Dr. João Oliveira', 'orthopedics', 'Belo Horizonte', '(31) 5555-4444', 'joao.oliveira@clinica.com', 'Ortopedista traumatologista'),
      ('Dra. Ana Costa', 'pediatrics', 'São Paulo', '(11) 3333-2222', 'ana.costa@clinica.com', 'Pediatra com especialização em neonatologia'),
      ('Dr. Pedro Rocha', 'neurology', 'Porto Alegre', '(51) 1111-0000', 'pedro.rocha@clinica.com', 'Neurologista com foco em dores de cabeça');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE doctors`);
  }
}
