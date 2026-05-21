"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";

async function fetchOrganisationSettings() {
    const response =
        await apiClient.get(
            "/organisation/settings"
        );

    return response.data;
}

export function useOrganisationSettings() {
    const query = useQuery({
        queryKey: [
            "organisation-settings",
        ],

        queryFn:
        fetchOrganisationSettings,

        staleTime:
            1000 * 60 * 10,

        refetchOnWindowFocus: false,
    });

    return {
        settings:
        query.data?.settings,

        isLoading:
        query.isLoading,

        error: query.error,

        refetch:
        query.refetch,
    };
}