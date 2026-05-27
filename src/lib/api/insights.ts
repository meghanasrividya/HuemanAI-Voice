import { apiClient } from "@/lib/apiClient";
import { CallReport } from "@/components/insights/types";

export const callInsightsApi = {
    async getReports(
        agentId: string,
        limit = 50,
        category: "Reservation" | "Feedback" = "Reservation"
    ): Promise<{ reports: CallReport[] }> {
        const endpoint = category === "Feedback" ? "/insights/Feedback" : "/insights/Reservation";
        const response = await apiClient.get(endpoint, {
            params: { agentId, limit },
        });
        return response.data;
    },

    async getReport(
        reportId: string
    ): Promise<{ status: string; report?: CallReport; error?: string }> {
        const response = await apiClient.get(`/insights/calls/${reportId}`);
        return response.data;
    },

    async generateReport(payload: {
        agentId?: string;
        periodDays?: number;
        forceRegenerate?: boolean;
    }): Promise<{ status: string; reportId: string; error?: string }> {
        const response = await apiClient.post("/insights/generate", payload);
        return response.data;
    },
};