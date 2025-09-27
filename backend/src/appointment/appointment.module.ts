// src/appointment/appointment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { DoctorSchedule } from '../doctor-schedule/entities/doctor-schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      TimeSlot,
      Doctor,
      User,
      DoctorSchedule
    ])
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports: [AppointmentService]
})
export class AppointmentModule {}