import { apiClient } from "@/lib/apiClient";

export async function fetchUsers() {
    const response = await apiClient.get("/users");
    return response.data;
}

export async function inviteUser(email: string, role: string, name: string, password: string) {
    const response = await apiClient.post("/users/invite", { email, role, name, password });
    return response.data;
}

export async function removeUser(id: string) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
}

export async function updateUserStatus(id: string, status: string) {
    const response = await apiClient.patch(`/users/${id}/status`, { status });
    return response.data;
}

export async function updateUserRole(id: string, role: string) {
    const response = await apiClient.patch(`/users/${id}/role`, { role });
    return response.data;
}
