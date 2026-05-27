"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/apiClient";

async function fetchOrganisationSettings() {
    try {
        const response =
            await apiClient.get(
                "/organisation/settings"
            );

        return response.data;
    } catch {
        return {
            settings: {
                insight_agent_ids: {
                    reservation: "agent_dc9662de627352087b223027f2",
                    feedback: "agent_dc9662de627352087b223027f2"
                }
            }
        };
    }
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