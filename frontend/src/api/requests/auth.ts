import axios from "axios";
import Cookies from "js-cookie";

interface registerProps {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    birthDate: string;
}

interface loginProps {
    email: string;
    pass: string;
}

export const registerRequest = ({ name, email, password, cpf, birthDate, phone }: registerProps) => {
    try {
        axios.post("http://localhost:3000/user", {
            name,
            email,
            password,
            cpf,
            phone,
            birthDate,
        }).then(({ data }) => {
            console.log("Usuário registrado:", data);
        });
    } catch (error) {
        console.error("Erro no registro:", error);
    }
};

export const loginRequest = ({ email, pass }: loginProps) => {
    try {
        axios.post("http://localhost:3000/auth/login", {
            email,
            password: pass,
        }).then(async (res) => {
            const token: string = res.data?.access_token;
            console.log("Token recebido:", token);

            if (token) {
                // Persist token in a cookie so other functions can read it (getUserData, validateToken, etc.)
                // Use a reasonably conservative expiry (1 hour to match backend signOptions). In prod, set secure and sameSite flags.
                try {
                    Cookies.set('auth_token', token, {
                        expires: 1/24, // 1 hour = 1/24 day
                        secure: window.location.protocol === 'https:',
                        sameSite: 'lax',
                    });
                } catch (cookieErr) {
                    console.warn('Não foi possível salvar o cookie de auth (ambiente restrito?):', cookieErr);
                }

                // Also set axios default Authorization header for the current session
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                } catch (e) {
                    // ignore in non-browser or restricted envs
                }

                await getUserData(token);
            }
        }).catch((err) => {
            console.error("Erro no login:", err);
            return false
        });
    } catch (error) {
        console.error("Erro durante login:", error);
    }
};

export async function validateToken(token?: string) {
    try {
        let authToken = token;

        // If no token provided, try reading from cookie
        if (!authToken) {
            authToken = Cookies.get('auth_token');
        }

        console.log("Validando token:", authToken);

        if (!authToken) {
            console.warn("Nenhum token encontrado");
            return;
        }

        const { data } = await axios.get("http://localhost:3000/auth/validate", {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        console.log("Token válido:", data);
        return data;
    } catch (error) {
        console.error("Erro na validação do token:", error);
    }
}


export const getUserData = async (token: string) => {
    console.log("Token recebido:", token);
    try {
        console.log(token)
        if (!token) {
            console.warn("Nenhum token encontrado");
            return;
        }

        if (!axios.defaults.headers.common['Authorization']) {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } catch (e) {
            }
        }

        const { data } = await axios.get("http://localhost:3000/user/profile", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return data;
    } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
    }
}