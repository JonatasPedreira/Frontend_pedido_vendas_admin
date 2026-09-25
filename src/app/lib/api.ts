import axios from "axios";
import { getAccessToken, refreshToken, logout } from "./auth";

// Cliente configurado para apontar para a InfoAPI (Porta 3339)
export const api = axios.create({
    baseURL: "http://192.168.253.124:3339",
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para injetar o Token em cada requisição à InfoAPI
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para capturar 401 e realizar o Silent Refresh transparente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se retornou 401 Unauthorized e a requisição ainda não foi tentada novamente
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Tenta renovar o token chamando o STS (/auth/refresh)
                const refreshed = await refreshToken();

                if (refreshed) {
                    // Atualiza o header da requisição falhada com o novo Token
                    const newToken = getAccessToken();
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    
                    // Reexecuta a requisição original de forma transparente
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Se falhar o refresh (ex: refresh token expirado também), desloga
                await logout();
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
