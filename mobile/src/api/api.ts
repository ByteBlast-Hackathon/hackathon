import axios from "axios";
import { getToken } from "../storage/AsyncStorage";

type registerProps = {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    birthDate: string;
}

type loginProps = {
    email: string;
    password: string;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.115:3000";
export const api = axios.create({ baseURL: BASE_URL, timeout: 20000 });

/** 1) Chat livre */
export async function aiChat(question: string) {
  const { data } = await api.post("/ai/chat", { question });
  console.log('Data: ', data)
  return data; // espere { reply: string } ou ajuste conforme seu backend
}

/** 2) Autorização de exame (PDF) */
export async function verifyExam(file: { uri: string; name?: string; type?: string }) {
  try {
    console.log("verifyExam - file:", file);

    const form = new FormData();
    // log/inspeciona uri; DocumentPicker com copyToCacheDirectory deve entregar file://
    let uri = file.uri;
    if (uri?.startsWith("content://")) {
      console.warn("verifyExam - received content:// URI (may need conversion):", uri);
    }

    form.append("examFile", {
      uri,
      name: file.name || "exam.pdf",
      type: file.type || "application/pdf",
    } as any);

    const token = await getToken();

    if (!token) {
        console.warn("Token is not here")
    }

    console.log('Token: ' + token)

    // deixe o axios/set native runtime cuidar do Content-Type/boundary
    const { data } = await api.post("/authorization/verify", form, {
        headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
        }
    });
    console.log("verifyExam - response:", data);
    return data;
  } catch (error: any) {
    console.error("verifyExam - error:", error?.response?.data ?? error?.message ?? error);
    throw error;
  }
}

/** 3) Agendamento completo */
export type BookingPayload = {
  name: string;
  birthDate: string;     // "YYYY-MM-DD"
  specialty: string;     // ex: "cardiology"
  reason: string;
  preferredDate: string; // "YYYY-MM-DD"
  preferredTime: string; // "HH:mm"
  city: string;          // ex: "São Paulo"
};

export async function completeBooking(payload: BookingPayload) {
    const token = await getToken();

    if (!token) {
        console.warn('Token is not here')
        return
    }

  const { data } = await api.post("/appointments/complete-booking", payload, {
    headers: {
        Authorization: `Bearer ${token}`
    }
  });
  return data; // backend responde 201; retorne o que ele mandar
}

export const registerRequest = async ({name, email, password, cpf, birthDate, phone}: registerProps) => {
    try {
        console.log("Registering user:", {name, email, password, cpf, phone, birthDate});

        const res = await api.post("/user", {
            name,
            email,
            password,
            cpf,
            phone,
            birthDate,
        });

        return res.data;
    } catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
}

export const loginRequest = async ({ email, password }: loginProps): Promise<string | null> => {
    try {
        console.log("Logging in user: ", {email});

        const res = await api.post("/auth/login", {
            email: email,
            password: password,
        });

        const token = res.data?.access_token ?? null;
        console.log("token:", token);
        return token;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}