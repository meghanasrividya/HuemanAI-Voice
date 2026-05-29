import { apiClient } from "@/lib/apiClient";

export async function fetchActionHotels() {
    const response = await apiClient.get("/actions/hotels");
    return response.data;
}

export async function fetchActionStats() {
    const response = await apiClient.post("/actions/stats");
    return response.data;
}

export async function fetchActionsList(payload: any) {
  const response = await apiClient.post("/actions/list", payload);
  return response.data;
}

export async function fetchActions(params?: any) {
    const response = await apiClient.get("/actions", {
        params,
    });
    return response.data;
}

export async function fetchActionById(actionId: string) {
    const response = await apiClient.get(`/actions/${actionId}`);
    return response.data;
}

export async function createAction(data: any) {
    const response = await apiClient.post("/actions/create", data);
    return response.data;
}

export async function decryptPhoneNumber(actionId: string) {
    const response = await apiClient.get(`/actions/${actionId}/decrypt-number`);
    return response.data;
}

export async function updateAction(actionId: string, data: any) {
    const response = await apiClient.put(`/actions/${actionId}`, data);
    return response.data;
}

export async function deleteAction(actionId: string) {
    const response = await apiClient.delete(`/actions/${actionId}`);
    return response.data;
}

export async function fetchAdminSettings() {
    const response = await apiClient.get("/admin/settings");
    return response.data;
}
