"use client";

import {
    Phone,
    CalendarCheck,
    Clock3,
    TrendingUp,
} from "lucide-react";

import MetricWidget from "./widgets/MetricWidget";

type Props = {
    totalCalls: number;
    bookings: number;
    avgDuration: number;
    conversionRate: number;

    trends?: {
        calls?: number;
        bookings?: number;
        avgDuration?: number;
        conversionRate?: number;
    };
};

function formatDuration(
    seconds: number
) {
    const mins = Math.floor(
        seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}m ${secs}s`;
}

export default function AnalyticsOverview({
                                              totalCalls,
                                              bookings,
                                              avgDuration,
                                              conversionRate,
                                              trends,
                                          }: Props) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricWidget
                label="Total Calls"
                value={totalCalls.toLocaleString()}
                trend={trends?.calls}
                icon={
                    <Phone className="h-5 w-5 text-blue-500" />
                }
            />

            <MetricWidget
                label="Bookings"
                value={bookings.toLocaleString()}
                trend={trends?.bookings}
                icon={
                    <CalendarCheck className="h-5 w-5 text-emerald-500" />
                }
            />

            <MetricWidget
                label="Average Duration"
                value={formatDuration(
                    avgDuration
                )}
                trend={trends?.avgDuration}
                icon={
                    <Clock3 className="h-5 w-5 text-amber-500" />
                }
            />

            <MetricWidget
                label="Conversion Rate"
                value={`${conversionRate.toFixed(
                    1
                )}%`}
                trend={
                    trends?.conversionRate
                }
                icon={
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                }
            />
        </div>
    );
}