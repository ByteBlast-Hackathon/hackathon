import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { Doctor } from '../doctor/entities/doctor.entity';
import { User } from '../user/entities/user.entity';
import { DoctorSchedule } from '../doctor-schedule/entities/doctor-schedule.entity';

interface GroupedSlots {
  [date: string]: {
    [doctorId: number]: {
      doctor: Doctor;
      slots: Array<{
        id: number;
        startTime: string;
        endTime: string;
      }>;
    };
  };
}

interface SlotGroup {
  doctor: Doctor;
  slots: Array<{
    id: number;
    startTime: string;
    endTime: string;
  }>;
}

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(TimeSlot)
    private readonly timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DoctorSchedule)
    private readonly doctorScheduleRepository: Repository<DoctorSchedule>,
  ) {}

  private generateProtocol(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `AGD-${timestamp}-${random}`.toUpperCase();
  }

  // CORREÇÃO: Método para formatar data corretamente
  private formatDate(date: any): string {
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date;
  }

  async getAvailableSlots(
    specialty?: string,
    city?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const query = this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      });

    if (specialty) {
      query.andWhere('doctor.specialty = :specialty', { specialty });
    }

    if (city) {
      query.andWhere('doctor.city = :city', { city });
    }

    if (startDate) {
      query.andWhere('timeSlot.date >= :startDate', { startDate: this.formatDate(startDate) });
    }

    if (endDate) {
      query.andWhere('timeSlot.date <= :endDate', { endDate: this.formatDate(endDate) });
    } else {
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      query.andWhere('timeSlot.date <= :endDate', { endDate: this.formatDate(oneMonthLater) });
    }

    const availableSlots = await query
      .orderBy('timeSlot.date', 'ASC')
      .addOrderBy('timeSlot.start_time', 'ASC')
      .getMany();

    // CORREÇÃO: Agrupar por data corretamente
    const groupedSlots: GroupedSlots = {};

    availableSlots.forEach(slot => {
      // Usar o método formatDate para garantir consistência
      const dateKey = this.formatDate(slot.date);
      
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = {};
      }

      if (slot.doctorSchedule && slot.doctorSchedule.doctor) {
        const doctorId = slot.doctorSchedule.doctor.id;
        
        if (!groupedSlots[dateKey][doctorId]) {
          groupedSlots[dateKey][doctorId] = {
            doctor: slot.doctorSchedule.doctor,
            slots: []
          };
        }

        groupedSlots[dateKey][doctorId].slots.push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    });

    return Object.entries(groupedSlots).map(([date, doctors]) => ({
      date,
      doctors: Object.values(doctors)
    }));
  }

  // NOVO MÉTODO: Todos os horários disponíveis sem filtros
  async getAllAvailableSlots(): Promise<any[]> {
    const availableSlots = await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      })
      .orderBy('timeSlot.date', 'ASC')
      .addOrderBy('timeSlot.start_time', 'ASC')
      .getMany();

    return this.groupSlotsByDateAndDoctor(availableSlots);
  }

  // NOVO MÉTODO: Horários por cidade
  async getAvailableSlotsByCity(city: string): Promise<any[]> {
    const availableSlots = await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      })
      .andWhere('doctor.city = :city', { city })
      .orderBy('timeSlot.date', 'ASC')
      .addOrderBy('timeSlot.start_time', 'ASC')
      .getMany();

    return this.groupSlotsByDateAndDoctor(availableSlots);
  }

  // NOVO MÉTODO: Horários por especialidade e cidade
  async getAvailableSlotsBySpecialtyAndCity(specialty: string, city: string): Promise<any[]> {
    const availableSlots = await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      })
      .andWhere('doctor.specialty = :specialty', { specialty })
      .andWhere('doctor.city = :city', { city })
      .orderBy('timeSlot.date', 'ASC')
      .addOrderBy('timeSlot.start_time', 'ASC')
      .getMany();

    return this.groupSlotsByDateAndDoctor(availableSlots);
  }

  // MÉTODO AUXILIAR: Agrupar slots por data e médico
  private groupSlotsByDateAndDoctor(availableSlots: TimeSlot[]): any[] {
    const groupedSlots: GroupedSlots = {};

    availableSlots.forEach(slot => {
      const dateKey = this.formatDate(slot.date);
      
      if (!groupedSlots[dateKey]) {
        groupedSlots[dateKey] = {};
      }

      if (slot.doctorSchedule && slot.doctorSchedule.doctor) {
        const doctorId = slot.doctorSchedule.doctor.id;
        
        if (!groupedSlots[dateKey][doctorId]) {
          groupedSlots[dateKey][doctorId] = {
            doctor: slot.doctorSchedule.doctor,
            slots: []
          };
        }

        groupedSlots[dateKey][doctorId].slots.push({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime
        });
      }
    });

    return Object.entries(groupedSlots).map(([date, doctors]) => ({
      date,
      doctors: Object.values(doctors)
    }));
  }

  // NOVO MÉTODO: Todos os médicos
  async getAllDoctors(): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  // NOVO MÉTODO: Médicos por cidade
  async getDoctorsByCity(city: string): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: { 
        isActive: true,
        city 
      },
      order: { name: 'ASC' }
    });
  }

  // NOVO MÉTODO: Cidades disponíveis
  async getAvailableCities(): Promise<string[]> {
    const cities = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('DISTINCT doctor.city', 'city')
      .where('doctor.is_active = :isActive', { isActive: true })
      .orderBy('doctor.city', 'ASC')
      .getRawMany();

    return cities.map(city => city.city).filter(city => city);
  }

  // NOVO MÉTODO: Estatísticas de disponibilidade
  async getAvailabilityStats(): Promise<any> {
    const totalSlots = await this.timeSlotRepository.count({
      where: { isAvailable: true }
    });

    const slotsByCity = await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .select('doctor.city', 'city')
      .addSelect('COUNT(timeSlot.id)', 'count')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      })
      .groupBy('doctor.city')
      .getRawMany();

    const slotsBySpecialty = await this.timeSlotRepository
      .createQueryBuilder('timeSlot')
      .innerJoinAndSelect('timeSlot.doctorSchedule', 'doctorSchedule')
      .innerJoinAndSelect('doctorSchedule.doctor', 'doctor')
      .select('doctor.specialty', 'specialty')
      .addSelect('COUNT(timeSlot.id)', 'count')
      .where('timeSlot.is_available = :isAvailable', { isAvailable: true })
      .andWhere('timeSlot.date >= :today', { 
        today: new Date().toISOString().split('T')[0] 
      })
      .groupBy('doctor.specialty')
      .getRawMany();

    return {
      totalAvailableSlots: totalSlots,
      byCity: slotsByCity,
      bySpecialty: slotsBySpecialty,
      lastUpdated: new Date()
    };
  }

  async scheduleAppointment(
    userId: number,
    timeSlotId: number,
    notes?: string
  ): Promise<Appointment> {
    const timeSlot = await this.timeSlotRepository.findOne({
      where: { id: timeSlotId },
      relations: ['doctorSchedule', 'doctorSchedule.doctor']
    });

    if (!timeSlot) {
      throw new NotFoundException('Horário não encontrado');
    }

    if (!timeSlot.isAvailable) {
      throw new ConflictException('Horário não está mais disponível');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Converter a data do timeSlot para Date object para comparação
    const slotDate = typeof timeSlot.date === 'string' 
      ? new Date(timeSlot.date) 
      : timeSlot.date;

    if (slotDate < today) {
      throw new ConflictException('Não é possível agendar para datas passadas');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!timeSlot.doctorSchedule || !timeSlot.doctorSchedule.doctor) {
      throw new NotFoundException('Informações do médico não encontradas');
    }

    const appointment = this.appointmentRepository.create({
      protocol: this.generateProtocol(),
      user: { id: userId },
      doctor: { id: timeSlot.doctorSchedule.doctor.id },
      timeSlot: { id: timeSlotId },
      appointmentDate: slotDate,
      appointmentTime: timeSlot.startTime,
      notes,
      status: AppointmentStatus.SCHEDULED
    });

    timeSlot.isAvailable = false;
    await this.timeSlotRepository.save(timeSlot);

    return await this.appointmentRepository.save(appointment);
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { user: { id: userId } },
      relations: ['doctor', 'timeSlot'],
      order: { appointmentDate: 'ASC', appointmentTime: 'ASC' }
    });
  }

  async cancelAppointment(userId: number, appointmentId: number, reason?: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'timeSlot']
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.user.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para cancelar este agendamento');
    }

    const appointmentDateTime = new Date(
      `${appointment.appointmentDate}T${appointment.appointmentTime}`
    );
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new ConflictException('Só é possível cancelar com mais de 24 horas de antecedência');
    }

    if (appointment.timeSlot) {
      const timeSlot = await this.timeSlotRepository.findOne({
        where: { id: appointment.timeSlot.id }
      });
      if (timeSlot) {
        timeSlot.isAvailable = true;
        await this.timeSlotRepository.save(timeSlot);
      }
    }

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = reason ?? '';

    return await this.appointmentRepository.save(appointment);
  }

  async getAppointmentDetails(userId: number, appointmentId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['doctor', 'user', 'timeSlot']
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    if (appointment.user.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para visualizar este agendamento');
    }

    return appointment;
  }

  async getDoctorsBySpecialty(specialty?: string, city?: string): Promise<Doctor[]> {
    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .where('doctor.is_active = :isActive', { isActive: true });

    if (specialty) {
      query.andWhere('doctor.specialty = :specialty', { specialty });
    }

    if (city) {
      query.andWhere('doctor.city = :city', { city });
    }

    return await query.getMany();
  }

  async processAppointmentRequest(userInput: string, userId: number): Promise<any> {
    const specialtyMatch = userInput.match(/(cardiologista|dermatologista|ortopedista|pediatra|neurologista|clínico geral)/i);
    const cityMatch = userInput.match(/(São Paulo|Rio de Janeiro|Belo Horizonte|Porto Alegre)/i);
    const dateMatch = userInput.match(/(amanhã|próxima semana|próximo mês|\d{1,2}\/\d{1,2}\/\d{4})/i);

    const specialty = specialtyMatch ? this.mapSpecialty(specialtyMatch[1]) : undefined;
    const city = cityMatch ? cityMatch[1] : undefined;

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateMatch) {
      const dateText = dateMatch[1].toLowerCase();
      if (dateText === 'amanhã') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
      } else if (dateText === 'próxima semana') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() + 7);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
      } else if (dateText === 'próximo mês') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() + 1);
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      }
    }

    const availableSlots = await this.getAvailableSlots(specialty, city, startDate, endDate);

    return {
      success: true,
      hasAvailableSlots: availableSlots.length > 0,
      availableSlots: availableSlots.slice(0, 5),
      filters: {
        specialty,
        city,
        dateRange: startDate && endDate ? { startDate, endDate } : undefined
      },
      suggestions: this.generateSuggestions(availableSlots, specialty, city)
    };
  }

  private mapSpecialty(specialtyText: string): string {
    const specialtyMap: { [key: string]: string } = {
      'cardiologista': 'cardiology',
      'dermatologista': 'dermatology',
      'ortopedista': 'orthopedics',
      'pediatra': 'pediatrics',
      'neurologista': 'neurology',
      'clínico geral': 'general_practice'
    };

    return specialtyMap[specialtyText.toLowerCase()] || specialtyText;
  }

  private generateSuggestions(availableSlots: any[], specialty?: string, city?: string): string[] {
    const suggestions: string[] = [];

    if (availableSlots.length === 0) {
      suggestions.push('Não há horários disponíveis para os critérios informados.');
      if (specialty) {
        suggestions.push(`Tente buscar por outras especialidades ou altere o período.`);
      }
      if (city) {
        suggestions.push(`Considere buscar em outras cidades.`);
      }
    } else {
      suggestions.push(`Encontrei ${availableSlots.length} datas com horários disponíveis.`);
      
      const firstDates = availableSlots.slice(0, 3);
      firstDates.forEach((slot, index) => {
        const date = new Date(slot.date).toLocaleDateString('pt-BR');
        suggestions.push(`Data ${index + 1}: ${date} - ${slot.doctors.length} médico(s) disponível(is)`);
      });
    }

    return suggestions;
  }

  async scheduleAppointmentFromChat(
    userId: number,
    timeSlotId: number,
    userNotes?: string
  ): Promise<{ success: boolean; protocol: string; message: string; details: any }> {
    try {
      const appointment = await this.scheduleAppointment(userId, timeSlotId, userNotes);

      const doctor = await this.doctorRepository.findOne({
        where: { id: appointment.doctor.id }
      });

      if (!doctor) {
        throw new NotFoundException('Médico não encontrado');
      }

      return {
        success: true,
        protocol: appointment.protocol,
        message: 'Consulta agendada com sucesso!',
        details: {
          date: appointment.appointmentDate.toLocaleDateString('pt-BR'),
          time: appointment.appointmentTime,
          doctor: doctor.name,
          specialty: doctor.specialty,
          location: doctor.city
        }
      };
    } catch (error) {
      return {
        success: false,
        protocol: '',
        message: `Erro ao agendar consulta: ${error.message}`,
        details: null
      };
    }
  }
}