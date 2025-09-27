import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAppointments1759002430927 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE appointments (
        id SERIAL PRIMARY KEY,
        protocol VARCHAR(20) UNIQUE NOT NULL,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        time_slot_id INTEGER REFERENCES time_slots(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        notes TEXT,
        cancellation_reason TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    
    await queryRunner.query(`
      CREATE INDEX idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX idx_appointments_status ON appointments(status);
      CREATE INDEX idx_appointments_user ON appointments(user_id);
      CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX idx_appointments_doctor`);
    await queryRunner.query(`DROP INDEX idx_appointments_user`);
    await queryRunner.query(`DROP INDEX idx_appointments_status`);
    await queryRunner.query(`DROP INDEX idx_appointments_date`);
    await queryRunner.query(`DROP TABLE appointments`);
  }
}
