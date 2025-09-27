import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { DoctorSchedule } from '../../doctor-schedule/entities/doctor-schedule.entity';
import { Appointment } from '../../appointment/entities/appointment.entity';

export enum MedicalSpecialty {
  CARDIOLOGY = 'cardiology',
  DERMATOLOGY = 'dermatology',
  ENDOCRINOLOGY = 'endocrinology',
  GASTROENTEROLOGY = 'gastroenterology',
  GYNECOLOGY = 'gynecology',
  NEUROLOGY = 'neurology',
  ORTHOPEDICS = 'orthopedics',
  PEDIATRICS = 'pediatrics',
  PSYCHIATRY = 'psychiatry',
  UROLOGY = 'urology',
  GENERAL_PRACTICE = 'general_practice'
}

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'enum', enum: MedicalSpecialty })
  specialty: MedicalSpecialty;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => DoctorSchedule, schedule => schedule.doctor)
  schedules: DoctorSchedule[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];
}