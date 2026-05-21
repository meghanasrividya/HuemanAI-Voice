import { apiClient } from "@/lib/apiClient";

type AnalyticsParams = {
    startDate?: string;
    endDate?: string;
    hotel?: string;
    segment?: string;
    callType?: string;
};

export async function fetchDashboardAnalytics(
    params?: AnalyticsParams
) {
    const response =
        await apiClient.get(
            "/dashboard/analytics",
            {
                params,
            }
        );

    return response.data;
}

export async function fetchCallOutcomes(
    params?: AnalyticsParams
) {
    const response =
        await apiClient.get(
            "/dashboard/outcomes",
            {
                params,
            }
        );

    return response.data;
}

export async function fetchSegmentBreakdown(
    params?: AnalyticsParams
) {
    const response =
        await apiClient.get(
            "/dashboard/segments",
            {
                params,
            }
        );

    return response.data;
}

export async function fetchTrendAnalytics(
    params?: AnalyticsParams
) {
    const response =
        await apiClient.get(
            "/dashboard/trends",
            {
                params,
            }
        );

    return response.data;
}