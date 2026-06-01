import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";

export const authApi = {
    async login(credentials: { email: string; password: string }) {
        const response = await apiClient.post("/user/login", credentials);
        const { access_token, user } = response.data;
        useAuthStore.getState().login(access_token, user);
        return { token: access_token, user };
    },

    async logout() {
        try {
            await apiClient.post("/user/logout");
        } finally {
            useAuthStore.getState().logout();
        }
    },
};
