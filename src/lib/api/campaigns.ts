import { apiClient } from "@/lib/apiClient";

export async function fetchCampaignsList(page: number = 1, limit: number = 10) {
  const response = await apiClient.get(`/campaigns?page=${page}&limit=${limit}`);
  return response.data;
}

export async function fetchCampaignById(campaignId: string | number) {
  const response = await apiClient.get(`/campaigns/${campaignId}`);
  return response.data;
}

export async function fetchCampaignContacts(campaignId: string | number, page: number = 1, limit: number = 10) {
  const response = await apiClient.get(`/campaigns/${campaignId}/contacts?page=${page}&limit=${limit}`);
  return response.data;
}

export async function createCampaign(data: {
  name: string;
  script_id: string;
  schedule_type: string;
  status: string;
}) {
  const response = await apiClient.post("/campaigns", data);
  return response.data;
}

export async function uploadCampaignContacts(campaignId: string | number, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post(`/campaigns/${campaignId}/upload-contacts`, formData);
  return response.data;
}

export async function updateCampaignStatus(campaignId: string | number, status: string) {
  const response = await apiClient.put(`/campaigns/${campaignId}`, { status });
  return response.data;
}

