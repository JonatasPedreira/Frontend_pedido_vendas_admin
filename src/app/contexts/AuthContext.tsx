"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, login, logout, LoginPayload, AuthResponse } from "../lib/auth";

interface AuthContextData {
    authenticated: boolean;
    loading: boolean;
    user: AuthResponse["user"] | null;
    sessionExpired: boolean;
    loginUser: (payload: LoginPayload) => Promise<void>;
    logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthResponse["user"] | null>(null);
    const [loading, setLoading] = useState(true); // Começa em true para checagem no cliente
    const [sessionExpired, setSessionExpired] = useState(false);
    
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Esta função roda APENAS no cliente, logo após a montagem do componente
        const checkAuth = () => {
            const auth = isAuthenticated();
            
            if (auth) {
                setAuthenticated(true);
                const savedUser = sessionStorage.getItem("user");
                if (savedUser) setUser(JSON.parse(savedUser));
            } else {
                setAuthenticated(false);
                setUser(null);
            }
            
            setLoading(false); // Desativa o loading após definir o estado real
        };

        checkAuth();
    }, [pathname]); // Roda sempre que a rota mudar para validar a sessão

    // Proteção de Rota (Efeito Colateral separado)
    useEffect(() => {
        if (!loading && !authenticated && pathname !== "/login") {
            router.replace("/login");
        }
    }, [authenticated, loading, pathname, router]);

    useEffect(() => {
        const handleSessionExpired = () => {
            setSessionExpired(true);
        };

        window.addEventListener("session-expired", handleSessionExpired);

        return () =>{
            window.removeEventListener("session-expired", handleSessionExpired);
        };
    }, []);

    const loginUser = async (payload: LoginPayload) => {
        setLoading(true);
        try {
            const data = await login(payload);
            setAuthenticated(true);
            setUser(data.user);
            router.replace("/"); // Redireciona para a home após login com sucesso
        } finally {
            setLoading(false);
        }
    };

    const logoutUser = async () => {
        setLoading(true);
        await logout();
        setAuthenticated(false);
        setUser(null);
        router.replace("/login");
        setLoading(false);
    };

    // Evita renderizar a árvore de componentes enquanto checa o sessionStorage
    if (loading && pathname !== "/login") {
        return null; // Aqui você pode colocar um Spinner/Tela de Carregamento
    }

    const handleSessionExpired = async () => {
        setSessionExpired(false);
        await logoutUser();
    };

    return (
        <AuthContext.Provider value={{ authenticated, loading, user, sessionExpired, loginUser, logoutUser }}>
            {sessionExpired && pathname !== "/login" && (
                <div className="session-expired-overlay">
                    <div className="session-expired-modal">
                        <h2>Sessão expirada</h2>
                        <p>
                            Seu tempo de acesso expirou.
                            <br />
                            Faça login novamente para continuar.
                        </p>
                        <button onClick={handleSessionExpired}>
                            Fazer login novamente
                        </button>
                    </div>
                </div>
            )}
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
