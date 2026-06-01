import { apiClient } from "@/lib/apiClient";

export const actionsApi = {
    async getList(params: Record<string, any>) {
        const response = await apiClient.get("/actions", { params });
        return response.data;
    },

    async getAction(id: string) {
        const response = await apiClient.get(`/actions/${id}`);
        return response.data;
    },

    async updateAction(id: string, data: Record<string, any>) {
        const response = await apiClient.patch(`/actions/${id}`, data);
        return response.data;
    },

    async createAction(data: Record<string, any>) {
        const response = await apiClient.post("/actions", data);
        return response.data;
    },

    async getStats(params?: Record<string, any>) {
        const response = await apiClient.get("/actions/stats", { params });
        return response.data;
    },

    async getHotels() {
        const response = await apiClient.get("/actions/hotels");
        return response.data;
    },

    async decryptNumber(id: string | number) {
        const response = await apiClient.get(`/actions/${id}/decrypt-number`);
        return response.data;
    },

    async getVapidPublicKey() {
        const response = await apiClient.get("/push/vapid-public-key");
        return response.data?.key;
    },

    async subscribePush(payload: { endpoint: string; keys: { p256dh: string; auth: string }; browser: string }) {
        const response = await apiClient.post("/push/subscribe", payload);
        return response.data;
    },

    async unsubscribePush(endpoint: string) {
        const response = await apiClient.post("/push/unsubscribe", { endpoint });
        return response.data;
    },
};
