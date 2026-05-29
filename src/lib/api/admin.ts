import { apiClient } from "@/lib/apiClient";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  is_admin: boolean;
  status: string;
  lastLogin?: Record<string, unknown> | null;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await apiClient.get("/admin/users");
  return response.data;
}

export async function updateOrganisationSettings(data: Record<string, unknown>) {
  const response = await apiClient.put("/admin/settings", data);
  return response.data;
}

export async function inviteAdminUser(data: {
  email: string;
  role: string;
  name: string;
  password?: string;
}): Promise<AdminUser[]> {
  const response = await apiClient.post("/admin/users/invite", data);
  return response.data;
}

export async function updateUserStatus(userId: string, status: "active" | "disabled"): Promise<AdminUser[]> {
  const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
  return response.data;
}

export async function removeUser(userId: string): Promise<AdminUser[]> {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  return response.data;
}
