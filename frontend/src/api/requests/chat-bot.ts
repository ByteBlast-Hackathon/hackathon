import axios from "axios";
import Cookies from "js-cookie";

// Define a URL base da sua API para evitar repetição
const API_BASE_URL = "http://localhost:3000";

// --- INTERFACES (Definições de Tipo) ---

// Tipo para os procedimentos, espelhando a entidade do backend
interface Procedure {
    id: number;
    codigo: string;
    terminologia: string;
    correlacao: boolean;
    procedimento: string | null;
    resolucao_normativa: string | null;
    vigencia: string | null;
    od: string | null;
    amb: string | null;
    hco: string | null;
    hso: string | null;
    pac: string | null;
    dut: string | null;
    subgrupo: string | null;
    grupo: string | null;
    capitulo: string | null;
    categoria: string;
}

// Tarefa 1: Chat com IA Generativa
interface ChatRequestProps {
    question: string;
}

interface RelevantSection {
    id: number;
    title: string;
    timeEstimate: number;
    documents: unknown[];
}

interface ChatResponse {
    success: boolean;
    question: string;
    answer: string;
    relevantSections: RelevantSection[];
    confidence: number;
    source: string;
    suggestedQuestions: string[];
    timestamp: string;
}

// Tarefa 2: Autorização de Exame
interface AuthorizationRequestProps {
    file: File;
}

interface AuthorizationResponse {
    status: 'Autorizado' | 'Em Análise' | 'Em Análise (OPME)' | 'Falha' | 'Não Autorizado';
    message: string;
    procedimentos?: Procedure[];
}

// Tarefa 3: Agendamento de Consulta
// --- ALTERAÇÃO AQUI: Adicionado 'export' para que a interface possa ser importada ---
export interface BookingRequestProps {
    name: string;
    birthDate: string;
    specialty: string;
    reason: string;
    preferredDate?: string;
    preferredTime?: string;
    city?: string;
}

interface BookingResponse {
    success: boolean;
    message: string;
    protocol?: string;
    data?: Record<string, unknown>;
}


// --- FUNÇÕES DE API ---

const getAuthToken = () => {
    const token = Cookies.get('auth_token');
    if (!token) {
        throw new Error("Não autenticado. Por favor, faça login novamente.");
    }
    return token;
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

export const authorizeExamRequest = async ({ file }: AuthorizationRequestProps): Promise<AuthorizationResponse> => {
    try {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('examFile', file);

        const response = await axios.post(`${API_BASE_URL}/authorization/verify`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro no pedido de autorização:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado no pedido de autorização:", error);
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
        } else {
            console.error("Erro inesperado no agendamento:", error);
        }
        throw error;
    }
};

