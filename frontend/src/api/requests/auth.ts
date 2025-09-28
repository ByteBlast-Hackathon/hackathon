import axios from "axios";
import Cookies from "js-cookie";


// --- INTERFACES (DEFINIÇÕES DE TIPO) ---

interface RegisterProps {
    name: string;
    email: string;
    password: string;
}

interface LoginProps {
    email: string;
    pass: string;
}

// --- FUNÇÕES DE API ---

export const registerRequest = async ({ name, email, password }: RegisterProps) => {
    try {
        const response = await axios.post(`http://localhost:3000/user`, {
            name,
            email,
            password,
        });
        console.log("Utilizador registado com sucesso:", response.data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro no registo:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado no registo:", error);
        }
        // Retorna o erro para que o frontend possa exibir uma mensagem
        throw error;
    }
};


export const loginRequest = async ({ email, pass }: LoginProps) => {
    try {
        const response = await axios.post(`http://localhost:3000/auth/login`, {
            email,
            password: pass,
        });

        const token = response.data?.access_token;
        if (!token) {
            throw new Error("Token não recebido do servidor.");
        }

        console.log("Login bem-sucedido. Token:", token);

        // Guarda o token num cookie seguro para uso futuro
        Cookies.set('auth_token', token, {
            expires: 1 / 24, // Expira em 1 hora
            secure: window.location.protocol === 'https:',
            sameSite: 'lax',
        });

        // Define o cabeçalho de autorização padrão para todas as futuras requisições do axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Após o login, busca e retorna os dados do utilizador
        return await getUserData();

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro no login:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado no login:", error);
        }
        throw error;
    }
};


export const validateToken = async () => {
    try {
        const token = Cookies.get('auth_token');
        if (!token) {
            console.log("Nenhum token encontrado para validação.");
            return false;
        }

        // Define o cabeçalho apenas para esta requisição, caso ainda não esteja definido globalmente
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`http://localhost:3000/auth/validate`, { headers });

        // A rota de validação retorna 204 (No Content) em caso de sucesso
        if (response.status === 204) {
            console.log("Token é válido.");
            return true;
        }
        return false;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Token inválido ou expirado:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado na validação do token:", error);
        }
        // Se a validação falhar, remove o cookie inválido
        Cookies.remove('auth_token');
        delete axios.defaults.headers.common['Authorization'];
        return false;
    }
};

/**
 * Busca os dados do perfil do utilizador autenticado.
 */
export const getUserData = async () => {
    try {
        const token = Cookies.get('auth_token');
        if (!token) {
            throw new Error("Não autenticado. Nenhum token encontrado.");
        }

        // Garante que o cabeçalho de autorização está definido
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Chama o endpoint correto para o perfil do utilizador
        const response = await axios.get(`http://localhost:3000/auth/profile`);
        console.log("Dados do utilizador recebidos:", response.data);
        localStorage.setItem("name", response.data.name);
        localStorage.setItem("id", response.data.id);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro ao buscar dados do utilizador:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado ao buscar dados do utilizador:", error);
        }
        throw error;
    }
};


export const authorizeRequest = async (file: File) => {
    try {
        const token = Cookies.get('auth_token');
        if (!token) {
            throw new Error("Não autenticado. Nenhum token encontrado.");
        }

        // Cria um objeto FormData para enviar o ficheiro
        const formData = new FormData();
        formData.append('examFile', file); // 'examFile' deve corresponder ao nome no controller

        const response = await axios.post(`http://localhost:3000/authorization/verify`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log("Resposta da autorização:", response.data);
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Erro ao enviar pedido de autorização:", error.response?.data || error.message);
        } else {
            console.error("Erro inesperado ao enviar pedido de autorização:", error);
        }
        throw error;
    }
};

