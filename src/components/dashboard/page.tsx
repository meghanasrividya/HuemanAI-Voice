"use client";

import {
    useMemo,
} from "react";

import DateRangePicker from "@/components/dashboard/date/DateRangePicker";

import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";

import CallVolumeChart from "@/components/dashboard/CallVolumeChart";

import CallOutcomeChart from "@/components/dashboard/CallOutcomeChart";

import CallSegmentBreakdown from "@/components/dashboard/CallSegmentBreakdown";

import {
    useDateRange,
} from "@/hooks/useDateRange";

import {
    useCallAnalytics,
} from "@/hooks/useCallAnalytics";

export default function DashboardPage() {
    const {
        range,
        setRange,
        serialized,
    } = useDateRange(7);

    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useCallAnalytics(
        serialized
    );

    const analytics =
        data?.analytics;

    const volumeData = useMemo(
        () =>
            analytics?.volumeTrend ||
            [],
        [analytics]
    );

    const outcomeData =
        analytics?.outcomes || [];

    const segmentData =
        analytics?.segments || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Voice analytics and
                        operational KPIs
                    </p>
                </div>

                <DateRangePicker
                    value={range}
                    onChange={setRange}
                />
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                    Loading analytics...
                </div>
            )}

            {isError && !isLoading && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-8 text-center">
                    <p className="font-medium text-destructive">Could not load dashboard data</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {(error as Error)?.message || "Check that you are signed in and the API is reachable."}
                    </p>
                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!isLoading && !isError && !analytics && (
                <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                    No analytics data for this date range.
                </div>
            )}

            {/* Content */}
            {!isLoading &&
                !isError &&
                analytics && (
                    <>
                        {/* KPI */}
                        <AnalyticsOverview
                            totalCalls={
                                analytics.totalCalls ||
                                0
                            }
                            bookings={
                                analytics.bookings ||
                                0
                            }
                            avgDuration={
                                analytics.avgDuration ||
                                0
                            }
                            conversionRate={
                                analytics.conversionRate ||
                                0
                            }
                            trends={
                                analytics.trends
                            }
                        />

                        {/* Charts */}
                        <div className="grid gap-6 xl:grid-cols-2">
                            <CallVolumeChart
                                title="Call Volume Trend"
                                subtitle="Calls and bookings over time"
                                data={volumeData}
                            />

                            <CallOutcomeChart
                                data={outcomeData}
                            />
                        </div>

                        {/* Segments */}
                        <div className="grid gap-6 xl:grid-cols-2">
                            <CallSegmentBreakdown
                                data={segmentData}
                            />
                        </div>
                    </>
                )}
        </div>
    );
}