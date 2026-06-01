import axios from "axios";
import { useAuthStore } from "@/store/authStore";

function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    try {
        const match = document.cookie
            .split(";")
            .find((c) => c.trim().startsWith("XSRF-TOKEN="));
        if (!match) return null;
        return decodeURIComponent(match.split("=")[1]);
    } catch {
        return null;
    }
}

export const apiClient = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "https://voice.huemanai.co.uk/api",
    withCredentials: true,
});

const PUBLIC_AUTH_PATHS = [
    "/user/login",
    "/user/register",
    "/user/forgot-password",
    "/user/reset-password",
];

apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) =>
        config.url?.includes(path)
    );

    if (token && !isPublicAuth) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const method = config.method?.toLowerCase() || "";
    if (["post", "put", "delete", "patch"].includes(method)) {
        const csrf = getCsrfToken();
        if (csrf) {
            config.headers["X-CSRF-Token"] = csrf;
        }
    }

    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        if (status === 401 && typeof window !== "undefined") {
            useAuthStore.getState().logout();
            const path = window.location.pathname;
            const onAuthPage = ["/login", "/forgot-password", "/reset-password", "/register"].some(
                (p) => path === p || path.startsWith(`${p}/`)
            );
            if (!onAuthPage) {
                const returnUrl = encodeURIComponent(path + window.location.search);
                window.location.href = `/login?returnUrl=${returnUrl}`;
            }
        }
        return Promise.reject(error);
    }
);
