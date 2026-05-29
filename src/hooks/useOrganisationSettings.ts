"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// Shape returned by GET /organisation/settings or /admin/settings
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
  insight_agent_ids?: {
    reservation?: string;
    feedback?: string;
  };
  settings?: {
    insight_agent_ids?: {
      reservation?: string;
      feedback?: string;
    };
  };
}

async function fetchOrganisationSettings(): Promise<OrganisationSettings> {
  try {
    const response = await apiClient.get("/organisation/settings");
    const data = response.data;
    if (data && data.settings) {
      return {
        ...data,
        insight_agent_ids: data.insight_agent_ids || data.settings.insight_agent_ids,
      };
    }
    return data;
  } catch {
    return {
      insight_agent_ids: {
        reservation: "agent_dc9662de627352087b223027f2",
        feedback: "agent_dc9662de627352087b223027f2"
      },
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