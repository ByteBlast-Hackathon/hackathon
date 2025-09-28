// Este hook verifica o token a cada 10 minutos e redireciona para login se inválido
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { validateToken } from "@/api/requests/auth";

export default function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function check() {
      // Não verifica na página de login/registro
      if (pathname.startsWith("/auth")) return;
      const valid = await validateToken();
      if (!valid) {
        localStorage.clear();
        sessionStorage.clear();
        router.replace("/auth/login");
      }
    }
    check();
    const interval = setInterval(check, 10 * 60 * 1000); // 10 minutos
    return () => clearInterval(interval);
  }, [pathname, router]);
}
