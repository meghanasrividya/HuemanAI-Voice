import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const configuredApiBase =
    process.env.NEXT_PUBLIC_API_URL?.trim();

export const apiClient = axios.create({
    baseURL:
        configuredApiBase && configuredApiBase.length > 0
            ? configuredApiBase
            : "/api",

    withCredentials: true,
});
apiClient.interceptors.request.use((config) => {
    let token = "";
    if (typeof window !== "undefined") {
        token = useAuthStore.getState().token || "";
        if (!token) {
            const rawToken = localStorage.getItem("access_token") || "";
            token = rawToken.replace("Bearer ", "");
        }
        const csrfToken = localStorage.getItem("csrf_token");

        if (csrfToken) {
            config.headers["X-CSRF-TOKEN"] = csrfToken;
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers.Accept = "application/json";
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => {
    if (typeof window !== "undefined" && response.data && response.data._csrf) {
        localStorage.setItem("csrf_token", response.data._csrf);
    }
    return response;
});
