"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";

type Params = {
    startDate?: string;
    endDate?: string;
    hotel?: string;
    segment?: string;
    callType?: string;
};

async function fetchCallAnalytics(
    params: Params
) {
    const response =
        await apiClient.get(
            "/analytics/calls",
            {
                params,
            }
        );

    return response.data;
}

export function useCallAnalytics(
    params: Params
) {
    return useQuery({
        queryKey: [
            "call-analytics",
            params,
        ],

        queryFn: () =>
            fetchCallAnalytics(params),

        staleTime: 1000 * 60 * 5,

        refetchOnWindowFocus: false,
    });
}