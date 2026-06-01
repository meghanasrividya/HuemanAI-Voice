"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export type OutcomeItem = {
    label: string;
    count: number;
    percentage: number;
    color?: string;
};

export type ReservationData = {
    total_calls?: number;
    outcomes?: OutcomeItem[];
    bookings_captured?: number;
    bookings_captured_trend?: number;
    total_covers?: number;
    total_covers_trend?: number;
    reservations_pct?: number;
    avg_time?: string;
    avg_time_trend?: number;
    non_working_hours?: {
        title?: string;
        subtitle?: string;
        data?: any[];
    };
    reservation_breakdown?: {
        title?: string;
        subtitle?: string;
        data?: any[];
    };
};

type Params = { startDate?: string; endDate?: string; hotel?: string };

async function fetchReservationDashboard(params: Params): Promise<ReservationData> {
    const response = await apiClient.post("/dashboard/reservation", {
        start_date: params.startDate,
        end_date: params.endDate,
        hotel: params.hotel,
    });
    return response.data;
}

export function useReservationDashboard(params: Params) {
    return useQuery({
        queryKey: ["reservation-dashboard", params],
        queryFn: () => fetchReservationDashboard(params),
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
