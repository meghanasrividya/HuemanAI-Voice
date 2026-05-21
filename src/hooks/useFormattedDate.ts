"use client";

import { useMemo } from "react";

import {
    format,
} from "date-fns";

export function useFormattedDate(
    value?: string | Date,
    pattern = "dd MMM yyyy"
) {
    return useMemo(() => {
        if (!value) return "";

        try {
            return format(
                typeof value === "string"
                    ? new Date(value)
                    : value,
                pattern
            );
        } catch {
            return "";
        }
    }, [value, pattern]);
}