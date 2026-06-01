"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type FeedbackOutcomeItem = {
    label: string;
    count: number;
    percentage: number;
    color?: string;
};

export type FeedbackData = {
    total_calls?: number;
    outcomes?: FeedbackOutcomeItem[];
    meaningful_feedback?: number;
    meaningful_feedback_trend?: number;
    positive_pct?: number;
    negative_pct?: number;
    avg_sentiment?: number;
    avg_sentiment_trend?: number;
    sentiment_breakdown?: any;
    keyword_cloud?: any[];
};

type Params = { startDate?: string; endDate?: string; hotel?: string };

async function fetchFeedbackDashboard(params: Params): Promise<FeedbackData> {
    const response = await apiClient.post("/dashboard/feedback", {
        start_date: params.startDate,
        end_date: params.endDate,
        hotel: params.hotel,
    });
    return response.data;
}

export function useFeedbackDashboard(params: Params) {
    return useQuery({
        queryKey: ["feedback-dashboard", params],
        queryFn: () => fetchFeedbackDashboard(params),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
