import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Doctor } from '../../doctor/entities/doctor.entity';
import { TimeSlot } from '../../time-slot/entities/time-slot.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday'
}

@Entity('doctor_schedules')
export class DoctorSchedule {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @ManyToOne(() => Doctor, doctor => doctor.schedules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'doctor_id' }) 
  doctorId: number;

  @Column({ name: 'day_of_week' })
  dayOfWeek: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'slot_duration', default: 30 })
  slotDuration: number;

  @Column({ name: 'max_appointments', default: 1 })
  maxAppointments: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => TimeSlot, timeSlot => timeSlot.doctorSchedule)
  timeSlots: TimeSlot[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}