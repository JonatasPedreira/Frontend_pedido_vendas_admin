const STS_URL = "http://192.168.253.124:3001";

export interface LoginPayload {
    tenantSlug: string;
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: number;
        usuCodigo: number;
        funCodigo: number;
        username: string;
        name: string;
        storeId: number;
    };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await fetch(`${STS_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Usuário ou senha inválidos");
    }

    const data: AuthResponse = await res.json();

    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    return data;
}

export async function refreshToken(): Promise<boolean> {
    const currentRefreshToken = sessionStorage.getItem("refreshToken");
    if (!currentRefreshToken) return false;

    const res = await fetch(`${STS_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    return true;
}

export async function logout() {
    const currentRefreshToken = sessionStorage.getItem("refreshToken");

    if (currentRefreshToken) {
        await fetch(`${STS_URL}/auth/logout`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
        }).catch(() => {});
    }

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
}

export function getAccessToken() {
    return typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;
}

export function isAuthenticated() {
    return !!getAccessToken();
}
export function getLoggedUser() {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
}