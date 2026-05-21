import {
    formatInTimeZone,
} from "date-fns-tz";

import {
    DEFAULT_TIMEZONE,
} from "./timezone";

export class TimezoneDate {
    private value: Date;

    private timezone: string;

    constructor(
        value?: string | Date,
        timezone = DEFAULT_TIMEZONE
    ) {
        this.value = value
            ? new Date(value)
            : new Date();

        this.timezone = timezone;
    }

    public setTimezone(
        timezone: string
    ) {
        this.timezone = timezone;

        return this;
    }

    public toDate() {
        return this.value;
    }

    public toISOString() {
        return this.value.toISOString();
    }

    public format(
        pattern = "dd MMM yyyy HH:mm"
    ) {
        return formatInTimeZone(
            this.value,
            this.timezone,
            pattern
        );
    }

    public shortDate() {
        return this.format(
            "dd MMM yyyy"
        );
    }

    public shortTime() {
        return this.format("HH:mm");
    }

    public relative() {
        const diff =
            Date.now() -
            this.value.getTime();

        const mins = Math.floor(
            diff / 1000 / 60
        );

        if (mins < 1) {
            return "Just now";
        }

        if (mins < 60) {
            return `${mins}m ago`;
        }

        const hours = Math.floor(
            mins / 60
        );

        if (hours < 24) {
            return `${hours}h ago`;
        }

        const days = Math.floor(
            hours / 24
        );

        return `${days}d ago`;
    }
}