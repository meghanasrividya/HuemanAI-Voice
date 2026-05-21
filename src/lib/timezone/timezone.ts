export const DEFAULT_TIMEZONE =
    "Europe/London";

export function getUserTimezone() {
    try {
        return Intl.DateTimeFormat()
            .resolvedOptions()
            .timeZone;
    } catch {
        return DEFAULT_TIMEZONE;
    }
}

export function convertToTimezone(
    date: Date | string,
    timezone = DEFAULT_TIMEZONE
) {
    const value =
        typeof date === "string"
            ? new Date(date)
            : date;

    return new Date(
        value.toLocaleString("en-US", {
            timeZone: timezone,
        })
    );
}

export function formatTimezoneLabel(
    timezone: string
) {
    return timezone.replaceAll(
        "_",
        " "
    );
}

export function isSameTimezone(
    a?: string,
    b?: string
) {
    return (
        (a || DEFAULT_TIMEZONE) ===
        (b || DEFAULT_TIMEZONE)
    );
}