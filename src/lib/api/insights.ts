import { apiClient } from "@/lib/apiClient";

export const callInsightsApi = {
    async getReports(
        agentId: string,
        limit = 50
    ) {
        const response =
            await apiClient.get(
                "/insights/reports",
                {
                    params: {
                        agentId,
                        limit,
                    },
                }
            );

        return response.data;
    },

    async getReport(
        reportId: string
    ) {
        const response =
            await apiClient.get(
                `/insights/report/${reportId}`
            );

        return response.data;
    },

    async generateReport(
        payload: {
            agentId?: string;
            periodDays?: number;
            forceRegenerate?: boolean;
        }
    ) {
        const response =
            await apiClient.post(
                "/insights/generate",
                payload
            );

        return response.data;
    },
};