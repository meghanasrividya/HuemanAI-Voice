"use client";

import { useState, useMemo } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

import DateRangePicker from "@/components/dashboard/date/DateRangePicker";
import { useDateRange } from "@/hooks/useDateRange";
import { useReservationDashboard, type OutcomeItem } from "@/hooks/useReservationDashboard";
import { useFeedbackDashboard, type FeedbackOutcomeItem } from "@/hooks/useFeedbackDashboard";
import { cn } from "@/lib/utils";

// Ordered colors matching RESERVATION_OUTCOMES
const OUTCOME_COLORS = [
    "#10b981", // Booking Secured - emerald
    "#06b6d4", // Enquiry Handled - cyan
    "#6366f1", // Large Party Bookings - indigo
    "#f59e0b", // Promotional / Offer - amber
    "#f97316", // Transferred to Staff - orange
    "#ef4444", // Booking Cancelled - red
    "#14b8a6", // General Assistance - teal
    "#8b5cf6", // Calls After Hours - violet
    "#ec4899", // Successful Upsells - pink
];

const FEEDBACK_COLORS = [
    "#10b981", "#06b6d4", "#f59e0b", "#ef4444",
    "#8b5cf6", "#f97316", "#14b8a6", "#ec4899",
];

function getColor(index: number, colors: string[], item?: OutcomeItem | FeedbackOutcomeItem) {
    return item?.color || colors[index % colors.length];
}

// ── Segmented outcomes bar ──────────────────────────────────────────────
function OutcomesBar({ outcomes, colors }: {
    outcomes: (OutcomeItem | FeedbackOutcomeItem)[];
    colors: string[];
}) {
    if (!outcomes.length) return null;
    return (
        <div className="flex h-3 w-full overflow-hidden rounded-full">
            {outcomes.map((o, i) => (
                <div
                    key={o.label}
                    style={{ width: `${o.percentage}%`, backgroundColor: getColor(i, colors, o) }}
                    title={`${o.label}: ${o.count} (${o.percentage.toFixed(1)}%)`}
                />
            ))}
        </div>
    );
}

// ── KPI card ────────────────────────────────────────────────────────────
function KpiCard({
    label,
    value,
    trend,
    dot,
}: {
    label: string;
    value: string | number;
    trend?: number;
    dot?: boolean;
}) {
    return (
        <div className="relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
            {dot && (
                <span className="absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            )}
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
            {trend !== undefined && (
                <div
                    className={cn(
                        "mt-3 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        trend >= 0
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                    )}
                >
                    {trend >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                    ) : (
                        <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(trend).toFixed(1)}%
                </div>
            )}
        </div>
    );
}

// ── Generic placeholder card ────────────────────────────────────────────
function PlaceholderCard({ title, subtitle, badge }: {
    title: string;
    subtitle?: string;
    badge?: string;
}) {
    return (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-premium-sm">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        {title}
                    </p>
                    {subtitle && (
                        <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
                    )}
                </div>
                {badge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                        {badge}
                    </span>
                )}
            </div>
            <div className="mt-4 h-32 rounded-xl bg-muted/30" />
        </div>
    );
}

// ── Loading skeleton ─────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-xl bg-muted/40", className)} />;
}

// ── Reservation tab content ─────────────────────────────────────────────
function ReservationContent({ params }: { params: { startDate?: string; endDate?: string } }) {
    const { data, isLoading, isError, error, refetch } = useReservationDashboard(params);

    if (isLoading) {
        return (
            <div className="space-y-5">
                <Skeleton className="h-40" />
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
                </div>
                <div className="grid gap-5 xl:grid-cols-2">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-10 text-center">
                <p className="font-semibold text-destructive">Could not load dashboard data</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {(error as Error)?.message || "Check that you are signed in and the API is reachable."}
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-5 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                    Retry
                </button>
            </div>
        );
    }

    const outcomes: OutcomeItem[] = data?.outcomes ?? [];
    const totalCalls = data?.total_calls ?? 0;

    return (
        <div className="space-y-5">
            {/* Call Outcomes */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
                <p className="text-sm font-semibold text-muted-foreground">Call Outcomes</p>
                <p className="mt-1">
                    <span className="text-4xl font-bold tabular-nums">{totalCalls}</span>
                    <span className="ml-2 text-sm text-muted-foreground">total calls</span>
                </p>
                <div className="mt-5">
                    <OutcomesBar outcomes={outcomes} colors={OUTCOME_COLORS} />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {outcomes.map((o, i) => (
                        <div key={o.label} className="flex items-center gap-2 text-sm">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: getColor(i, OUTCOME_COLORS, o) }}
                            />
                            <span className="text-foreground">{o.label}</span>
                            <span className="ml-auto font-medium tabular-nums">
                                {o.count}{" "}
                                <span className="text-muted-foreground">({o.percentage.toFixed(1)}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* KPI row */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <KpiCard
                    label="Total Bookings Captured"
                    value={data?.bookings_captured ?? "—"}
                    trend={data?.bookings_captured_trend}
                />
                <KpiCard
                    label="Total Covers"
                    value={data?.total_covers ?? "—"}
                    trend={data?.total_covers_trend}
                />
                <KpiCard
                    label="Reservations %"
                    value={data?.reservations_pct != null ? `${data.reservations_pct.toFixed(1)}%` : "—"}
                />
                <KpiCard
                    label="Avg Time"
                    value={data?.avg_time ?? "—"}
                    trend={data?.avg_time_trend}
                    dot
                />
            </div>

            {/* Breakdown cards */}
            <div className="grid gap-5 xl:grid-cols-2">
                <PlaceholderCard
                    title="Non-Working Hours Breakdown"
                    subtitle="Activity recorded outside your typical opening times"
                    badge="After Hours"
                />
                <PlaceholderCard
                    title="Reservation Breakdown"
                    subtitle="Distribution of reservation types with covers"
                />
            </div>
        </div>
    );
}

// ── Feedback tab content ─────────────────────────────────────────────────
function FeedbackContent({ params }: { params: { startDate?: string; endDate?: string } }) {
    const { data, isLoading, isError, error, refetch } = useFeedbackDashboard(params);

    if (isLoading) {
        return (
            <div className="space-y-5">
                <Skeleton className="h-40" />
                <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                    {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-10 text-center">
                <p className="font-semibold text-destructive">Could not load feedback data</p>
                <p className="mt-2 text-sm text-muted-foreground">
                    {(error as Error)?.message || "Check that you are signed in and the API is reachable."}
                </p>
                <button
                    type="button"
                    onClick={() => refetch()}
                    className="mt-5 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                    Retry
                </button>
            </div>
        );
    }

    const outcomes: FeedbackOutcomeItem[] = data?.outcomes ?? [];
    const totalCalls = data?.total_calls ?? 0;

    return (
        <div className="space-y-5">
            {/* Feedback Outcomes */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-premium-sm">
                <p className="text-sm font-semibold text-muted-foreground">Feedback Outcomes</p>
                <p className="mt-1">
                    <span className="text-4xl font-bold tabular-nums">{totalCalls}</span>
                    <span className="ml-2 text-sm text-muted-foreground">total calls</span>
                </p>
                <div className="mt-5">
                    <OutcomesBar outcomes={outcomes} colors={FEEDBACK_COLORS} />
                </div>
                <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {outcomes.map((o, i) => (
                        <div key={o.label} className="flex items-center gap-2 text-sm">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ backgroundColor: getColor(i, FEEDBACK_COLORS, o) }}
                            />
                            <span className="text-foreground">{o.label}</span>
                            <span className="ml-auto font-medium tabular-nums">
                                {o.count}{" "}
                                <span className="text-muted-foreground">({o.percentage.toFixed(1)}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback KPIs */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                <KpiCard
                    label="Meaningful Feedback"
                    value={data?.meaningful_feedback ?? "—"}
                    trend={data?.meaningful_feedback_trend}
                />
                <KpiCard label="Positive" value={data?.positive_pct != null ? `${data.positive_pct.toFixed(1)}%` : "—"} />
                <KpiCard label="Negative" value={data?.negative_pct != null ? `${data.negative_pct.toFixed(1)}%` : "—"} />
                <KpiCard
                    label="Avg Sentiment"
                    value={data?.avg_sentiment != null ? `${data.avg_sentiment.toFixed(1)}` : "—"}
                    trend={data?.avg_sentiment_trend}
                />
            </div>
        </div>
    );
}

// ── Main dashboard page ──────────────────────────────────────────────────
type Tab = "reservation" | "feedback";

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<Tab>("reservation");
    const { range, setRange, serialized } = useDateRange(7);

    const dateLabel = useMemo(() => {
        if (!range?.from) return "Last 7 days";
        if (!range.to) return format(range.from, "MMM dd, yyyy");
        return `${format(range.from, "MMM dd")} – ${format(range.to, "MMM dd, yyyy")}`;
    }, [range]);

    return (
        <div className="space-y-5">
            {/* ── Page header ── */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    {/* Tab toggle */}
                    <div className="flex items-center gap-1 rounded-full border border-border bg-muted/30 p-1">
                        {(["reservation", "feedback"] as Tab[]).map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-all",
                                    activeTab === tab
                                        ? "bg-foreground text-background shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DateRangePicker value={range} onChange={setRange} />
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-premium-sm transition hover:bg-muted"
                    >
                        <Download className="h-4 w-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* ── Tab content ── */}
            {activeTab === "reservation" ? (
                <ReservationContent params={serialized} />
            ) : (
                <FeedbackContent params={serialized} />
            )}
        </div>
    );
}
