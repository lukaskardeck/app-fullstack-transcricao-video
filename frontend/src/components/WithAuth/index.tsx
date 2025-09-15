import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";

interface WithAuthProps {
  redirectTo?: string;
}

export function withAuth<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options: WithAuthProps = {}
) {
  const { redirectTo = "/login" } = options;

  return function AuthenticatedComponent(props: T) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.replace(redirectTo);
        }
      });

      return () => unsubscribe();
    }, [router, redirectTo]);

    // Ainda carregando
    if (isAuthenticated === null) {
      return <LoadingScreen message="Verificando autenticação..." />;
    }

    // Não autenticado (vai redirecionar)
    if (!isAuthenticated) {
      return <LoadingScreen message="Redirecionando..." />;
    }

    // Autenticado - renderiza o componente
    return <WrappedComponent {...props} />;
  };
}