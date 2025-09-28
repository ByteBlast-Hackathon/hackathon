import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:3000";

// --- INTERFACES ATUALIZADAS ---

export interface BookingRequestProps {
    name: string;
    birthDate: string;
    specialty: string;
    reason: string;
    preferredDate?: string;
    preferredTime?: string;
    city?: string;
}

export interface ChatRequestProps {
  question: string;
}

export interface Appointment {
  id: number;
  protocol: string;
  date: string;  // appointmentDate do backend
  time: string;  // appointmentTime do backend
  status: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  doctor?: {
    id: number;
    name: string;
    specialty: string;
    city: string;
    phone?: string;
    email?: string;
  };
}

// Interface corrigida para corresponder ao retorno real da API
export interface MyAppointmentsResponse {
  success: boolean;
  data: Appointment[];  // Mudado de 'appointments' para 'data'
  total: number;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  protocol?: string;
  data?: Record<string, unknown>;
}

export interface ChatResponse {
  success: boolean;
  question: string;
  answer: string;
  relevantSections: RelevantSection[];
  confidence: number;
  source: string;
  suggestedQuestions: string[];
  timestamp: string;
}

// --- FUNÇÕES DE API ---

const getAuthToken = () => {
    const token = Cookies.get('auth_token');
    if (!token) {
        throw new Error("Não autenticado. Por favor, faça login novamente.");
    }
    return token;
};

export const getMyAppointments = async (): Promise<MyAppointmentsResponse> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/appointments/my-appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Erro ao buscar consultas:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Erro ao buscar consultas");
    } else {
      console.error("Erro inesperado ao buscar consultas:", error);
      throw new Error("Erro inesperado ao buscar consultas");
    }
  }
};

export const askGenerativeAI = async ({ question }: ChatRequestProps): Promise<ChatResponse> => {
  try {
    const token = getAuthToken();
    const response = await axios.post(`${API_BASE_URL}/ai/chat`, { question }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Erro na pergunta à IA:", error.response?.data || error.message);
    } else {
      console.error("Erro inesperado na pergunta à IA:", error);
    }
    throw error;
  }
};

export const bookAppointmentRequest = async (bookingData: BookingRequestProps): Promise<BookingResponse> => {
    try {
        const token = getAuthToken();
        const response = await axios.post(`${API_BASE_URL}/appointments/complete-booking`, bookingData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro no agendamento:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Erro no agendamento");
        } else {
            console.error("Erro inesperado no agendamento:", error);
            throw new Error("Erro inesperado no agendamento");
        }
    }
};