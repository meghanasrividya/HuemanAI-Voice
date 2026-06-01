import { apiClient } from "@/lib/apiClient";

export async function fetchUserProfile() {
  const response = await apiClient.get("/user/profile");
  return response.data;
}

export async function fetchDashboardSummary(payload: {
  startDate: string;
  endDate: string;
  dateRange: string;
}) {
  const response = await apiClient.post("/dashboard/summary", payload);
  return response.data;
}
