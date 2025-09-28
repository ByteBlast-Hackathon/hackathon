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
    documents: unknown[]; // 'unknown' é uma alternativa mais segura para 'any'
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
    status: string;
    message: string;
    procedimentos?: Procedure[]; // Usando o tipo Procedure definido
}

// Tarefa 3: Agendamento de Consulta
interface BookingRequestProps {
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
    data?: Record<string, unknown>; // 'Record<string, unknown>' é ideal para um objeto com estrutura desconhecida
}


// --- FUNÇÕES DE API ---

/**
 * Função auxiliar para obter o token de autenticação e os cabeçalhos.
 * Lança um erro se o token não for encontrado.
 */
const getAuthHeaders = () => {
    const token = Cookies.get('auth_token');
    if (!token) {
        throw new Error("Não autenticado. Por favor, faça login novamente.");
    }
    return {
        Authorization: `Bearer ${token}`,
    };
};

/**
 * TAREFA 1: Envia uma pergunta para o chatbot de IA generativa.
 * @param props - O objeto contendo a pergunta do utilizador.
 * @returns A resposta detalhada da IA.
 */
export const askGenerativeAI = async ({ question }: ChatRequestProps): Promise<ChatResponse> => {
    try {
        const headers = getAuthHeaders();
        // NOTA: O seu endpoint era /chat. Assumindo que ele está num controller /ai. Ajuste se necessário.
        const response = await axios.post(`${API_BASE_URL}/ai/chat`, { question }, { headers });
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

/**
 * TAREFA 2: Envia um ficheiro PDF para o sistema de autorização de exames.
 * @param props - O objeto contendo o ficheiro a ser enviado.
 * @returns O status da autorização (Autorizado, Em Análise, etc.).
 */
export const authorizeExamRequest = async ({ file }: AuthorizationRequestProps): Promise<AuthorizationResponse> => {
    try {
        const headers = {
            ...getAuthHeaders(),
            'Content-Type': 'multipart/form-data',
        };

        const formData = new FormData();
        formData.append('examFile', file);

        const response = await axios.post(`${API_BASE_URL}/authorization/verify`, formData, { headers });
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

/**
 * TAREFA 3: Envia os dados para um agendamento completo de consulta.
 * @param bookingData - Os detalhes do agendamento fornecidos pelo utilizador.
 * @returns A confirmação do agendamento com um número de protocolo.
 */
export const bookAppointmentRequest = async (bookingData: BookingRequestProps): Promise<BookingResponse> => {
    try {
        const headers = getAuthHeaders();
        // NOTA: O endpoint era /complete-booking. Assumindo que está num controller /appointment. Ajuste se necessário.
        const response = await axios.post(`${API_BASE_URL}/appointment/complete-booking`, bookingData, { headers });
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

