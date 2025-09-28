import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Consultar horários disponíveis' })
  @ApiQuery({ name: 'specialty', required: false, description: 'Especialidade médica' })
  @ApiQuery({ name: 'city', required: false, description: 'Cidade' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Lista de horários disponíveis' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getAvailability(
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const slots = await this.appointmentService.getAvailableSlots(
      specialty,
      city,
      start,
      end
    );

    const totalSlots = slots.reduce((acc, day) => {
      return acc + day.doctors.reduce((docAcc: number, doc: any) => {
        return docAcc + (Array.isArray(doc.slots) ? doc.slots.length : 0);
      }, 0);
    }, 0);

    return {
      success: true,
      data: slots,
      total: totalSlots,
      message: slots.length > 0 
        ? `Encontrados ${slots.length} dias com horários disponíveis` 
        : 'Nenhum horário disponível para os critérios informados'
    };
  }

  // NOVO MÉTODO: Todos os horários disponíveis
  @Get('availability/all')
  @ApiOperation({ summary: 'Todos os horários disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista completa de horários disponíveis' })
  async getAllAvailableSlots() {
    const slots = await this.appointmentService.getAllAvailableSlots();

    const totalSlots = slots.reduce((acc, day) => {
      return acc + day.doctors.reduce((docAcc: number, doc: any) => {
        return docAcc + (Array.isArray(doc.slots) ? doc.slots.length : 0);
      }, 0);
    }, 0);

    return {
      success: true,
      data: slots,
      total: totalSlots,
      message: `Encontrados ${totalSlots} horários disponíveis em ${slots.length} dias`
    };
  }

  // NOVO MÉTODO: Horários por cidade
  @Get('availability/city/:city')
  @ApiOperation({ summary: 'Horários disponíveis por cidade' })
  @ApiResponse({ status: 200, description: 'Horários disponíveis na cidade especificada' })
  async getAvailableSlotsByCity(@Param('city') city: string) {
    const slots = await this.appointmentService.getAvailableSlotsByCity(city);

    const totalSlots = slots.reduce((acc, day) => {
      return acc + day.doctors.reduce((docAcc: number, doc: any) => {
        return docAcc + (Array.isArray(doc.slots) ? doc.slots.length : 0);
      }, 0);
    }, 0);

    return {
      success: true,
      data: slots,
      total: totalSlots,
      city,
      message: slots.length > 0 
        ? `Encontrados ${slots.length} dias com horários disponíveis em ${city}` 
        : `Nenhum horário disponível em ${city}`
    };
  }

  // NOVO MÉTODO: Horários por especialidade e cidade
  @Get('availability/specialty/:specialty/city/:city')
  @ApiOperation({ summary: 'Horários por especialidade e cidade' })
  @ApiResponse({ status: 200, description: 'Horários filtrados por especialidade e cidade' })
  async getAvailableSlotsBySpecialtyAndCity(
    @Param('specialty') specialty: string,
    @Param('city') city: string
  ) {
    const slots = await this.appointmentService.getAvailableSlotsBySpecialtyAndCity(specialty, city);

    const totalSlots = slots.reduce((acc, day) => {
      return acc + day.doctors.reduce((docAcc: number, doc: any) => {
        return docAcc + (Array.isArray(doc.slots) ? doc.slots.length : 0);
      }, 0);
    }, 0);

    return {
      success: true,
      data: slots,
      total: totalSlots,
      specialty,
      city,
      message: slots.length > 0 
        ? `Encontrados ${slots.length} dias com horários de ${specialty} em ${city}` 
        : `Nenhum horário disponível para ${specialty} em ${city}`
    };
  }

  // NOVO MÉTODO: Todas as cidades disponíveis
  @Get('cities')
  @ApiOperation({ summary: 'Listar todas as cidades disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de cidades com médicos' })
  async getAvailableCities() {
    const cities = await this.appointmentService.getAvailableCities();

    return {
      success: true,
      data: cities,
      total: cities.length,
      message: `Encontradas ${cities.length} cidades com médicos disponíveis`
    };
  }

  // NOVO MÉTODO: Todos os médicos
  @Get('doctors/all')
  @ApiOperation({ summary: 'Listar todos os médicos' })
  @ApiResponse({ status: 200, description: 'Lista completa de médicos' })
  async getAllDoctors() {
    const doctors = await this.appointmentService.getAllDoctors();

    const doctorsData = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      city: doctor.city,
      phone: doctor.phone,
      email: doctor.email,
      bio: doctor.bio
    }));

    return {
      success: true,
      data: doctorsData,
      total: doctors.length,
      message: `Encontrados ${doctors.length} médicos`
    };
  }

  // NOVO MÉTODO: Médicos por cidade
  @Get('doctors/city/:city')
  @ApiOperation({ summary: 'Listar médicos por cidade' })
  @ApiResponse({ status: 200, description: 'Lista de médicos na cidade especificada' })
  async getDoctorsByCity(@Param('city') city: string) {
    const doctors = await this.appointmentService.getDoctorsByCity(city);

    const doctorsData = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      city: doctor.city,
      phone: doctor.phone,
      email: doctor.email,
      bio: doctor.bio
    }));

    return {
      success: true,
      data: doctorsData,
      total: doctors.length,
      city,
      message: `Encontrados ${doctors.length} médicos em ${city}`
    };
  }

  // NOVO MÉTODO: Estatísticas de disponibilidade
  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas de disponibilidade' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos horários disponíveis' })
  async getAvailabilityStats() {
    const stats = await this.appointmentService.getAvailabilityStats();

    return {
      success: true,
      data: stats
    };
  }

  // MÉTODOS EXISTENTES (mantidos da versão anterior)
  @Post()
  @ApiOperation({ summary: 'Agendar uma consulta' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeSlotId: { type: 'number', example: 1 },
        notes: { type: 'string', example: 'Consulta de rotina' }
      },
      required: ['timeSlotId']
    }
  })
  @ApiResponse({ status: 201, description: 'Consulta agendada com sucesso' })
  @ApiResponse({ status: 404, description: 'Horário ou usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Horário não disponível' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async scheduleAppointment(
    @GetUser() user: User,
    @Body() body: { timeSlotId: number; notes?: string }
  ) {
    const appointment = await this.appointmentService.scheduleAppointment(
      user.id,
      body.timeSlotId,
      body.notes
    );

    return {
      success: true,
      message: 'Consulta agendada com sucesso',
      data: {
        id: appointment.id,
        protocol: appointment.protocol,
        date: appointment.appointmentDate,
        time: appointment.appointmentTime,
        status: appointment.status,
        notes: appointment.notes
      }
    };
  }

  @Post('chat/schedule')
  @ApiOperation({ summary: 'Agendar consulta via chatbot' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        timeSlotId: { type: 'number', example: 1 },
        userNotes: { type: 'string', example: 'Preciso de uma consulta urgente' }
      },
      required: ['timeSlotId']
    }
  })
  @ApiResponse({ status: 201, description: 'Consulta agendada via chatbot' })
  @ApiResponse({ status: 404, description: 'Horário não encontrado' })
  @ApiResponse({ status: 409, description: 'Horário não disponível' })
  async scheduleAppointmentFromChat(
    @GetUser() user: User,
    @Body() body: { timeSlotId: number; userNotes?: string }
  ) {
    const result = await this.appointmentService.scheduleAppointmentFromChat(
      user.id,
      body.timeSlotId,
      body.userNotes
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        data: null
      };
    }

    return {
      success: true,
      message: result.message,
      data: {
        protocol: result.protocol,
        ...result.details
      }
    };
  }

  @Post('chat/query')
  @ApiOperation({ summary: 'Consultar disponibilidade via chatbot' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userInput: { type: 'string', example: 'Preciso de um cardiologista em São Paulo para amanhã' }
      },
      required: ['userInput']
    }
  })
  @ApiResponse({ status: 200, description: 'Resultado da consulta via chatbot' })
  async processAppointmentRequest(
    @GetUser() user: User,
    @Body() body: { userInput: string }
  ) {
    const result = await this.appointmentService.processAppointmentRequest(
      body.userInput,
      user.id
    );

    return {
      success: true,
      data: result
    };
  }

  @Get('my-appointments')
  @ApiOperation({ summary: 'Listar meus agendamentos' })
  @ApiResponse({ status: 200, description: 'Lista de agendamentos do usuário' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getMyAppointments(@GetUser() user: User) {
    const appointments = await this.appointmentService.getUserAppointments(user.id);

    const appointmentsData = appointments.map(apt => ({
      id: apt.id,
      protocol: apt.protocol,
      date: apt.appointmentDate,
      time: apt.appointmentTime,
      doctor: apt.doctor ? {
        id: apt.doctor.id,
        name: apt.doctor.name,
        specialty: apt.doctor.specialty,
        city: apt.doctor.city
      } : null,
      status: apt.status,
      notes: apt.notes
    }));

    return {
      success: true,
      data: appointmentsData,
      total: appointments.length
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes de um agendamento' })
  @ApiResponse({ status: 200, description: 'Detalhes do agendamento' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para visualizar' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getAppointmentDetails(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) appointmentId: number
  ) {
    const appointment = await this.appointmentService.getAppointmentDetails(
      user.id,
      appointmentId
    );

    const appointmentData = {
      id: appointment.id,
      protocol: appointment.protocol,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      doctor: appointment.doctor ? {
        id: appointment.doctor.id,
        name: appointment.doctor.name,
        specialty: appointment.doctor.specialty,
        city: appointment.doctor.city,
        phone: appointment.doctor.phone,
        email: appointment.doctor.email
      } : null,
      status: appointment.status,
      notes: appointment.notes,
      cancellationReason: appointment.cancellationReason,
      createdAt: appointment.createdAt
    };

    return {
      success: true,
      data: appointmentData
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar um agendamento' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Imprevisto pessoal' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Agendamento cancelado com sucesso' })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para cancelar' })
  @ApiResponse({ status: 409, description: 'Não é possível cancelar com menos de 24h' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async cancelAppointment(
    @GetUser() user: User,
    @Param('id', ParseIntPipe) appointmentId: number,
    @Body() body: { reason?: string }
  ) {
    const appointment = await this.appointmentService.cancelAppointment(
      user.id,
      appointmentId,
      body.reason
    );

    return {
      success: true,
      message: 'Agendamento cancelado com sucesso',
      data: {
        protocol: appointment.protocol,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason
      }
    };
  }

  @Get('doctors/specialties')
  @ApiOperation({ summary: 'Listar especialidades médicas disponíveis' })
  @ApiResponse({ status: 200, description: 'Lista de especialidades' })
  async getSpecialties() {
    const specialties = [
      'cardiology', 'dermatology', 'endocrinology', 'gastroenterology',
      'gynecology', 'neurology', 'orthopedics', 'pediatrics',
      'psychiatry', 'urology', 'general_practice'
    ];

    return {
      success: true,
      data: specialties
    };
  }

  @Get('doctors/list')
  @ApiOperation({ summary: 'Listar médicos por especialidade e cidade' })
  @ApiQuery({ name: 'specialty', required: false, description: 'Especialidade médica' })
  @ApiQuery({ name: 'city', required: false, description: 'Cidade' })
  @ApiResponse({ status: 200, description: 'Lista de médicos' })
  async getDoctors(
    @Query('specialty') specialty?: string,
    @Query('city') city?: string
  ) {
    const doctors = await this.appointmentService.getDoctorsBySpecialty(specialty, city);

    const doctorsData = doctors.map(doctor => ({
      id: doctor.id,
      name: doctor.name,
      specialty: doctor.specialty,
      city: doctor.city,
      phone: doctor.phone,
      email: doctor.email,
      bio: doctor.bio
    }));

    return {
      success: true,
      data: doctorsData,
      total: doctors.length
    };
  }

  // -----------------------
  // NOVOS ENDPOINTS ADICIONADOS
  // -----------------------

  // Endpoint para reservar fluxo completo (completeAppointmentBooking)
  @Post('complete-booking')
  @ApiOperation({ summary: 'Fluxo completo de agendamento (dados do paciente + preferências)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'João da Silva' },
        birthDate: { type: 'string', example: '1980-05-12' },
        specialty: { type: 'string', example: 'cardiology' },
        reason: { type: 'string', example: 'Dor no peito' },
        preferredDate: { type: 'string', example: '2025-10-05' },
        preferredTime: { type: 'string', example: '09:00' },
        city: { type: 'string', example: 'São Paulo' }
      },
      required: ['name', 'birthDate', 'specialty', 'reason']
    }
  })
  @ApiResponse({ status: 201, description: 'Fluxo de agendamento completo executado' })
  async completeAppointmentBooking(
    @GetUser() user: User,
    @Body() body: {
      name: string;
      birthDate: string;
      specialty: string;
      reason: string;
      preferredDate?: string;
      preferredTime?: string;
      city?: string;
    }
  ) {
    const result = await this.appointmentService.completeAppointmentBooking(
      user.id,
      {
        name: body.name,
        birthDate: body.birthDate,
        specialty: body.specialty,
        reason: body.reason,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        city: body.city
      }
    );

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        data: null
      };
    }

    return {
      success: true,
      message: result.message,
      protocol: result.protocol,
      data: result.appointmentDetails
    };
  }

  // Endpoint para visualizar agendas formatadas (getAvailableSchedules)
  @Get('schedules')
  @ApiOperation({ summary: 'Visualizar agendas disponíveis (formatado)' })
  @ApiQuery({ name: 'specialty', required: false, description: 'Especialidade médica' })
  @ApiQuery({ name: 'city', required: false, description: 'Cidade' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'Agendas formatadas' })
  async getAvailableSchedules(
    @Query('specialty') specialty?: string,
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const schedules = await this.appointmentService.getAvailableSchedules(specialty, city, start, end);

    return {
      success: true,
      data: schedules
    };
  }
}
