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

apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

