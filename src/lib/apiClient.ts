import axios from "axios";

export const apiClient = axios.create({
    baseURL:
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:3000/api",

    withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const rawToken = localStorage.getItem("access_token") || "";
        const token = rawToken.replace("Bearer ", "");
        const csrfToken = localStorage.getItem("csrf_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (csrfToken) {
            config.headers["X-CSRF-TOKEN"] = csrfToken;
        }
    }

    config.headers.Accept = "application/json";
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }

    return config;
});

apiClient.interceptors.response.use((response) => {
    if (typeof window !== "undefined" && response.data && response.data._csrf) {
        localStorage.setItem("csrf_token", response.data._csrf);
    }
    return response;
});