"use client";

import { useMemo, useState } from "react";

import {
    startOfDay,
    endOfDay,
    subDays,
} from "date-fns";

import { DateRange } from "react-day-picker";

export function useDateRange(
    defaultDays = 7
) {
    const [range, setRange] =
        useState<DateRange | undefined>({
            from: startOfDay(
                subDays(
                    new Date(),
                    defaultDays
                )
            ),

            to: endOfDay(new Date()),
        });

    const serialized = useMemo(() => {
        return {
            startDate:
                range?.from?.toISOString(),

            endDate:
                range?.to?.toISOString(),
        };
    }, [range]);

    return {
        range,
        setRange,
        serialized,
    };
}