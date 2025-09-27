import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTimeSlots1758998783656 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        doctor_schedule_id INTEGER REFERENCES doctor_schedules(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Gerar horários disponíveis para os próximos 30 dias
    await this.generateTimeSlots(queryRunner);
  }

  private async generateTimeSlots(queryRunner: QueryRunner): Promise<void> {
    const schedules: any[] = await queryRunner.query(`SELECT * FROM doctor_schedules WHERE is_active = true`);

    const today = new Date();
    // gera 30 dias a partir de hoje (inclui hoje)
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayOfWeek = this.getDayOfWeek(currentDate); // 'sunday' .. 'saturday'

      // Filtra schedules cujo day_of_week corresponda ao dia. 
      // Atenção: ajuste se doctor_schedules.day_of_week for numérico (0-6) em vez de string.
      const schedulesOfDay = schedules.filter(s => {
        if (s.day_of_week === null || s.day_of_week === undefined) return false;
        // suportar both: string like 'monday' or integer 1..7 (ou 0..6)
        if (typeof s.day_of_week === 'string') return s.day_of_week.toLowerCase() === dayOfWeek;
        if (typeof s.day_of_week === 'number') return s.day_of_week === currentDate.getDay();
        return false;
      });

      for (const schedule of schedulesOfDay) {
        await this.generateSlotsForSchedule(queryRunner, schedule, currentDate);
      }
    }
  }

  private getDayOfWeek(date: Date): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  private pad(n: number) {
    return n < 10 ? '0' + n : `${n}`;
  }

  private formatDateLocal(date: Date): string {
    return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())}`;
  }

  private formatTime(date: Date): string {
    // garante HH:MM:SS sem timezone
    return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
  }

  private async generateSlotsForSchedule(queryRunner: QueryRunner, schedule: any, date: Date): Promise<void> {
    // schedule.start_time e schedule.end_time devem ser strings 'HH:MM[:SS]' ou Time
    if (!schedule.start_time || !schedule.end_time) return;

    // Normalizar valores de tempo usando base day 2000-01-01 (sem impacto no date)
    const startParts = schedule.start_time.toString().split(':').map((p: string) => parseInt(p, 10));
    const endParts = schedule.end_time.toString().split(':').map((p: string) => parseInt(p, 10));

    const startTime = new Date(2000, 0, 1, startParts[0] || 0, startParts[1] || 0, startParts[2] || 0);
    const endTime = new Date(2000, 0, 1, endParts[0] || 0, endParts[1] || 0, endParts[2] || 0);

    const slotDuration = Number(schedule.slot_duration) || 30;
    if (slotDuration <= 0) return;

    const inserts: { doctor_schedule_id: number; date: string; start_time: string; end_time: string }[] = [];

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      if (slotEnd <= endTime) {
        inserts.push({
          doctor_schedule_id: schedule.id,
          date: this.formatDateLocal(date),
          start_time: this.formatTime(currentTime),
          end_time: this.formatTime(slotEnd)
        });
      } else {
        break;
      }
      currentTime = slotEnd;
    }

    if (inserts.length === 0) return;

    // Inserção em lote: construir query parametrizada
    const valuesSql: string[] = [];
    const params: any[] = [];

    inserts.forEach((it, idx) => {
      const base = idx * 4;
      valuesSql.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, true)`);
      params.push(it.doctor_schedule_id, it.date, it.start_time, it.end_time);
    });

    const sql = `
      INSERT INTO time_slots (doctor_schedule_id, date, start_time, end_time, is_available)
      VALUES ${valuesSql.join(',')}
    `;

    await queryRunner.query(sql, params);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS time_slots`);
  }
}
