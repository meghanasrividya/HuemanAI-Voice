"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// Shape returned by GET /admin/settings
export interface OrganisationSettings {
  id?: string;
  organisation_name?: string;
  business_type?: string;
  default_timezone?: string;
  default_language?: string;
  currency?: string;
  enable_outbound_calls?: boolean;
  enable_ai_insights?: boolean;
  enable_locations?: boolean;
  updated_at?: string;
  updated_by?: string;
}

async function fetchOrganisationSettings(): Promise<OrganisationSettings> {
  const response = await apiClient.get("/admin/settings");
  // The API returns the settings object directly (no nested .settings key)
  return response.data;
}

export function useOrganisationSettings() {
  const query = useQuery({
    queryKey: ["organisation-settings"],
    queryFn: fetchOrganisationSettings,
    staleTime: 0,               // always consider data stale
    refetchOnMount: "always",   // re-fetch every time admin page opens
    refetchOnWindowFocus: false,
  });

  return {
    // response is the flat object itself
    settings: query.data as OrganisationSettings | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}