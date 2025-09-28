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

interface AppointmentBookingData {
  name: string;
  birthDate: string;
  specialty: string;
  reason: string;
  preferredDate?: string;
  preferredTime?: string;
  city?: string;
}

interface AppointmentConfirmation {
  success: boolean;
  protocol: string;
  message: string;
  appointmentDetails: {
    patientName: string;
    patientBirthDate: string;
    appointmentDate: string;
    appointmentTime: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorCity: string;
    reason: string;
    status: string;
  };
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

  // NOVO SERVIÇO: Fluxo completo de agendamento
  async completeAppointmentBooking(
    userId: number,
    bookingData: AppointmentBookingData
  ): Promise<AppointmentConfirmation> {
    try {
      // 1. Validar dados do usuário
      if (!bookingData.name || !bookingData.birthDate || !bookingData.specialty || !bookingData.reason) {
        throw new ConflictException('Todos os dados obrigatórios devem ser informados: nome, data de nascimento, especialidade e motivo da consulta');
      }

      // 2. Validar data de nascimento
      const birthDate = new Date(bookingData.birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (birthDate >= today) {
        throw new ConflictException('Data de nascimento deve ser uma data passada');
      }

      // 3. Converter especialidade para formato interno
      const internalSpecialty = this.mapSpecialtyToInternal(bookingData.specialty);
      
      // 4. Buscar horários disponíveis baseado na especialidade e cidade
      const availableSlots = await this.getAvailableSlots(
        internalSpecialty,
        bookingData.city
      );

      if (availableSlots.length === 0) {
        throw new NotFoundException('Não há horários disponíveis para a especialidade e critérios informados');
      }

      // 5. Selecionar horário baseado nas preferências
      let selectedSlot: any = null;
      let selectedDoctor: any = null;

      // Tentar encontrar horário na data e horário preferidos, se fornecidos
      if (bookingData.preferredDate) {
        for (const day of availableSlots) {
          if (day.date === bookingData.preferredDate) {
            for (const doctorData of day.doctors) {
              if (doctorData.slots.length > 0) {
                // Se tem horário preferido, tentar encontrar
                if (bookingData.preferredTime) {
                  const preferredSlot = doctorData.slots.find(slot => 
                    slot.startTime === bookingData.preferredTime
                  );
                  if (preferredSlot) {
                    selectedSlot = preferredSlot;
                    selectedDoctor = doctorData.doctor;
                    break;
                  }
                }
                // Se não encontrou horário preferido ou não foi informado, pegar o primeiro
                if (!selectedSlot) {
                  selectedSlot = doctorData.slots[0];
                  selectedDoctor = doctorData.doctor;
                  break;
                }
              }
            }
          }
          if (selectedSlot) break;
        }
      }

      // Se não encontrou na data preferida, pegar o primeiro disponível
      if (!selectedSlot) {
        for (const day of availableSlots) {
          for (const doctorData of day.doctors) {
            if (doctorData.slots.length > 0) {
              selectedSlot = doctorData.slots[0];
              selectedDoctor = doctorData.doctor;
              break;
            }
          }
          if (selectedSlot) break;
        }
      }

      if (!selectedSlot || !selectedDoctor) {
        throw new NotFoundException('Não foi possível encontrar um horário disponível');
      }

      // 6. Agendar a consulta
      const appointment = await this.scheduleAppointment(
        userId,
        selectedSlot.id,
        bookingData.reason
      );

      // 7. Buscar dados completos do médico
      const doctor = await this.doctorRepository.findOne({
        where: { id: selectedDoctor.id }
      });

      if (!doctor) {
        throw new NotFoundException('Médico não encontrado');
      }

      // 8. Retornar confirmação com todos os dados
      return {
        success: true,
        protocol: appointment.protocol,
        message: 'Consulta agendada com sucesso!',
        appointmentDetails: {
          patientName: bookingData.name,
          patientBirthDate: new Date(bookingData.birthDate).toLocaleDateString('pt-BR'),
          appointmentDate: new Date(appointment.appointmentDate).toLocaleDateString('pt-BR'),
          appointmentTime: appointment.appointmentTime,
          doctorName: doctor.name,
          doctorSpecialty: this.mapSpecialtyToPortuguese(doctor.specialty),
          doctorCity: doctor.city,
          reason: bookingData.reason,
          status: this.mapStatusToPortuguese(appointment.status)
        }
      };

    } catch (error) {
      return {
        success: false,
        protocol: '',
        message: `Erro no agendamento: ${error.message}`,
        appointmentDetails: {
          patientName: '',
          patientBirthDate: '',
          appointmentDate: '',
          appointmentTime: '',
          doctorName: '',
          doctorSpecialty: '',
          doctorCity: '',
          reason: '',
          status: ''
        }
      };
    }
  }

  // NOVO SERVIÇO: Visualizar agendas disponíveis formatadas
  async getAvailableSchedules(specialty?: string, city?: string, startDate?: Date, endDate?: Date): Promise<any> {
    // Converter especialidade para formato interno se fornecida
    const internalSpecialty = specialty ? this.mapSpecialtyToInternal(specialty) : specialty;
    
    const availableSlots = await this.getAvailableSlots(internalSpecialty, city, startDate, endDate);

    const formattedSchedules = availableSlots.map(day => ({
      date: new Date(day.date).toLocaleDateString('pt-BR'),
      dayOfWeek: this.getDayOfWeekPortuguese(new Date(day.date)),
      availableDoctors: day.doctors.map(doctorData => ({
        doctorId: doctorData.doctor.id,
        doctorName: doctorData.doctor.name,
        specialty: this.mapSpecialtyToPortuguese(doctorData.doctor.specialty),
        city: doctorData.doctor.city,
        availableSlots: doctorData.slots.map(slot => ({
          slotId: slot.id,
          time: `${slot.startTime} - ${slot.endTime}`,
          available: true
        }))
      }))
    }));

    return {
      totalDays: formattedSchedules.length,
      totalSlots: availableSlots.reduce((acc, day) => {
        return acc + day.doctors.reduce((docAcc, doc) => docAcc + doc.slots.length, 0);
      }, 0),
      schedules: formattedSchedules
    };
  }

  // MÉTODO AUXILIAR: Obter dia da semana em português
  private getDayOfWeekPortuguese(date: Date): string {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[date.getDay()];
  }

  // MÉTODO AUXILIAR: Converter especialidade para formato interno
  private mapSpecialtyToInternal(specialty: string): string {
    const specialtyMap: { [key: string]: string } = {
      'cardiologia': 'cardiology',
      'dermatologia': 'dermatology',
      'endocrinologia': 'endocrinology',
      'gastroenterologia': 'gastroenterology',
      'ginecologia': 'gynecology',
      'neurologia': 'neurology',
      'ortopedia': 'orthopedics',
      'pediatria': 'pediatrics',
      'psiquiatria': 'psychiatry',
      'urologia': 'urology',
      'clínica geral': 'general_practice',
      'clinica geral': 'general_practice',
      'clínico geral': 'general_practice',
      'clinico geral': 'general_practice'
    };

    return specialtyMap[specialty.toLowerCase()] || specialty;
  }

  // MÉTODO AUXILIAR: Converter especialidade para português
  private mapSpecialtyToPortuguese(specialty: string): string {
    const specialtyMap: { [key: string]: string } = {
      'cardiology': 'Cardiologia',
      'dermatology': 'Dermatologia',
      'endocrinology': 'Endocrinologia',
      'gastroenterology': 'Gastroenterologia',
      'gynecology': 'Ginecologia',
      'neurology': 'Neurologia',
      'orthopedics': 'Ortopedia',
      'pediatrics': 'Pediatria',
      'psychiatry': 'Psiquiatria',
      'urology': 'Urologia',
      'general_practice': 'Clínica Geral'
    };

    return specialtyMap[specialty.toLowerCase()] || specialty;
  }

  // MÉTODO AUXILIAR: Converter status para português
  private mapStatusToPortuguese(status: AppointmentStatus): string {
    const statusMap: { [key: string]: string } = {
      'scheduled': 'Agendado',
      'confirmed': 'Confirmado',
      'completed': 'Concluído',
      'cancelled': 'Cancelado',
      'no_show': 'Não Compareceu'
    };

    return statusMap[status] || status;
  }

  // MÉTODO AUXILIAR: Validar especialidade
  private validateSpecialty(specialty: string): boolean {
    const validSpecialties = [
      'cardiologia', 'dermatologia', 'endocrinologia', 'gastroenterologia',
      'ginecologia', 'neurologia', 'ortopedia', 'pediatria',
      'psiquiatria', 'urologia', 'clínica geral'
    ];
    return validSpecialties.includes(specialty.toLowerCase());
  }

  // Os métodos existentes continuam exatamente iguais abaixo...

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

  async getAllDoctors(): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' }
    });
  }

  async getDoctorsByCity(city: string): Promise<Doctor[]> {
    return await this.doctorRepository.find({
      where: { 
        isActive: true,
        city 
      },
      order: { name: 'ASC' }
    });
  }

  async getAvailableCities(): Promise<string[]> {
    const cities = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('DISTINCT doctor.city', 'city')
      .where('doctor.is_active = :isActive', { isActive: true })
      .orderBy('doctor.city', 'ASC')
      .getRawMany();

    return cities.map(city => city.city).filter(city => city);
  }

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
    const specialtyMatch = userInput.match(/(cardiologia|dermatologia|ortopedia|pediatria|neurologia|clínica geral|ginecologia|psiquiatria|urologia|endocrinologia|gastroenterologia)/i);
    const cityMatch = userInput.match(/(São Paulo|Rio de Janeiro|Belo Horizonte|Porto Alegre|Curitiba|Salvador|Fortaleza|Recife|Porto Alegre)/i);
    const dateMatch = userInput.match(/(amanhã|próxima semana|próximo mês|\d{1,2}\/\d{1,2}\/\d{4})/i);

    const specialty = specialtyMatch ? this.mapSpecialtyToInternal(specialtyMatch[1]) : undefined;
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
      'cardiologia': 'cardiology',
      'dermatologia': 'dermatology',
      'ortopedia': 'orthopedics',
      'pediatria': 'pediatrics',
      'neurologia': 'neurology',
      'clínica geral': 'general_practice',
      'ginecologia': 'gynecology',
      'psiquiatria': 'psychiatry',
      'urologia': 'urology',
      'endocrinologia': 'endocrinology',
      'gastroenterologia': 'gastroenterology'
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
          specialty: this.mapSpecialtyToPortuguese(doctor.specialty),
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