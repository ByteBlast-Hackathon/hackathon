import jwt from "jsonwebtoken";

interface JwtPayload {
    sub?: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
    [key: string]: any;
}

export function verifyAndDecodeJWT(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET não definido no .env");
    }

    try {
        // Verifica assinatura + validade (exp)
        return jwt.verify(token, secret) as JwtPayload;
    } catch (err: any) {
        throw new Error("Token inválido ou expirado: " + err.message);
    }
}