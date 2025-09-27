import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDoctorsSchedules1758998771749 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE doctor_schedules (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week VARCHAR(10) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        slot_duration INTEGER DEFAULT 30,
        max_appointments INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Inserir horários para os médicos
    await queryRunner.query(`
      INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration, max_appointments) VALUES
      (1, 'monday', '08:00', '12:00', 30, 8),
      (1, 'wednesday', '14:00', '18:00', 30, 8),
      (1, 'friday', '09:00', '13:00', 30, 8),
      (2, 'tuesday', '09:00', '17:00', 30, 16),
      (2, 'thursday', '09:00', '17:00', 30, 16),
      (3, 'monday', '07:00', '11:00', 30, 8),
      (3, 'wednesday', '07:00', '11:00', 30, 8),
      (3, 'friday', '07:00', '11:00', 30, 8),
      (4, 'tuesday', '13:00', '17:00', 30, 8),
      (4, 'thursday', '13:00', '17:00', 30, 8),
      (4, 'saturday', '08:00', '12:00', 30, 8),
      (5, 'monday', '10:00', '16:00', 30, 12),
      (5, 'tuesday', '10:00', '16:00', 30, 12),
      (5, 'wednesday', '10:00', '16:00', 30, 12);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE doctor_schedules`);
  }
}
