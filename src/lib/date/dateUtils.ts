import {
    formatInTimeZone,
} from "date-fns-tz";

export const DEFAULT_DISPLAY_TIMEZONE =
    "Europe/London";

export function parseTimestampAsUtc(
    value?: string | Date | null
) {
    if (!value) {
        return new Date();
    }

    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "string") {
        let cleanValue = value.trim();
        if (!cleanValue.endsWith("Z") && !/[+-]\d{2}:?\d{2}$/.test(cleanValue)) {
            cleanValue = cleanValue.replace(" ", "T") + "Z";
        }
        return new Date(cleanValue);
    }

    return new Date(value);
}

export function formatDateInTimezone(
    value: Date | string,
    options?: Intl.DateTimeFormatOptions,
    timezone = DEFAULT_DISPLAY_TIMEZONE
) {
    const date =
        typeof value === "string"
            ? parseTimestampAsUtc(value)
            : value;

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            timeZone: timezone,
            ...options,
        }
    ).format(date);
}

export function formatDateTime(
    value?: string | Date,
    timezone = DEFAULT_DISPLAY_TIMEZONE
) {
    if (!value) return "";

    const date =
        typeof value === "string"
            ? parseTimestampAsUtc(value)
            : value;

    return formatInTimeZone(
        date,
        timezone,
        "dd MMM yyyy, HH:mm"
    );
}

export function formatShortDate(
    value?: string | Date,
    timezone = DEFAULT_DISPLAY_TIMEZONE
) {
    if (!value) return "";

    const date =
        typeof value === "string"
            ? parseTimestampAsUtc(value)
            : value;

    return formatInTimeZone(
        date,
        timezone,
        "dd MMM yyyy"
    );
}

export function formatShortTime(
    value?: string | Date,
    timezone = DEFAULT_DISPLAY_TIMEZONE
) {
    if (!value) return "";

    const date =
        typeof value === "string"
            ? parseTimestampAsUtc(value)
            : value;

    return formatInTimeZone(
        date,
        timezone,
        "HH:mm"
    );
}

export function startOfDayUtc(
    date: Date
) {
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0,
            0,
            0
        )
    );
}

export function getDateKeyInTimezone(
    date: Date,
    timezone = DEFAULT_DISPLAY_TIMEZONE
): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

export function endOfDayUtc(
    date: Date
) {
    return new Date(
        Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            23,
            59,
            59
        )
    );
}