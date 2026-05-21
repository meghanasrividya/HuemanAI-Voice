"use client";

import { useMemo, useState } from "react";

import { DateRange } from "react-day-picker";

type Filters = {
    hotel?: string;
    segment?: string;
    callType?: string;
    search?: string;
};

export function useDashboardFilters() {
    const [dateRange, setDateRange] =
        useState<DateRange | undefined>();

    const [hotel, setHotel] =
        useState("all");

    const [segment, setSegment] =
        useState("all");

    const [callType, setCallType] =
        useState("all");

    const [search, setSearch] =
        useState("");

    const filters = useMemo<Filters>(
        () => ({
            hotel:
                hotel === "all"
                    ? undefined
                    : hotel,

            segment:
                segment === "all"
                    ? undefined
                    : segment,

            callType:
                callType === "all"
                    ? undefined
                    : callType,

            search:
                search.trim() || undefined,
        }),

        [
            hotel,
            segment,
            callType,
            search,
        ]
    );

    function resetFilters() {
        setHotel("all");
        setSegment("all");
        setCallType("all");
        setSearch("");
        setDateRange(undefined);
    }

    return {
        filters,

        dateRange,
        setDateRange,

        hotel,
        setHotel,

        segment,
        setSegment,

        callType,
        setCallType,

        search,
        setSearch,

        resetFilters,
    };
}