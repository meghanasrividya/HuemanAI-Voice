export function formatNumber(
    value?: number | null,
    options?: Intl.NumberFormatOptions
) {
    if (
        value === undefined ||
        value === null ||
        Number.isNaN(value)
    ) {
        return "-";
    }

    return new Intl.NumberFormat(
        "en-GB",
        options
    ).format(value);
}

export function formatPercent(
    value?: number | null,
    digits = 1
) {
    if (
        value === undefined ||
        value === null ||
        Number.isNaN(value)
    ) {
        return "-";
    }

    return `${value.toFixed(digits)}%`;
}

export function formatCurrency(
    value?: number | null,
    currency = "GBP"
) {
    if (
        value === undefined ||
        value === null ||
        Number.isNaN(value)
    ) {
        return "-";
    }

    return new Intl.NumberFormat(
        "en-GB",
        {
            style: "currency",
            currency,
            maximumFractionDigits: 0,
        }
    ).format(value);
}

export function formatDuration(
    totalSeconds?: number | null
) {
    if (
        totalSeconds === undefined ||
        totalSeconds === null ||
        Number.isNaN(totalSeconds)
    ) {
        return "-";
    }

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }

    return `${seconds}s`;
}

export function compactNumber(
    value?: number | null
) {
    if (
        value === undefined ||
        value === null ||
        Number.isNaN(value)
    ) {
        return "-";
    }

    return new Intl.NumberFormat(
        "en",
        {
            notation: "compact",
            maximumFractionDigits: 1,
        }
    ).format(value);
}