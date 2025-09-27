import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DoctorSchedule } from '../../doctor-schedule/entities/doctor-schedule.entity';

@Entity('time_slots')
export class TimeSlot {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => DoctorSchedule, schedule => schedule.timeSlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_schedule_id' })
  doctorSchedule: DoctorSchedule;

  @Column({ name: 'doctor_schedule_id' })
  doctorScheduleId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({name: 'start_time', type: 'time' })
  startTime: string;

  @Column({name: 'end_time', type: 'time' })
  endTime: string;

  @Column({name: 'is_available', default: true })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}