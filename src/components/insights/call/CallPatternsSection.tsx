"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { motion } from "framer-motion";
import { CallPatternData } from "@/components/insights/types";

// ─── Palette ──────────────────────────────────────────────────────────────────
const CHART_COLORS = [
    "#6366f1", "#8b5cf6", "#a78bfa", "#818cf8",
    "#c4b5fd", "#7c3aed", "#4f46e5", "#4338ca",
];

const OUTCOME_COLORS: Record<string, string> = {
    "Booking Secured": "#10b981",
    "Enquiry Handled": "#6366f1",
    "Large Party Bookings": "#8b5cf6",
    "Promotional / Offer": "#f59e0b",
    "Transferred to Staff": "#f97316",
    "Booking Cancelled": "#ef4444",
    "General Assistance": "#64748b",
};

// ─── Tooltip styles (required by recharts — cannot use Tailwind) ──────────────
const TOOLTIP_STYLE = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
    padding: "8px 12px",
};

const AXIS_STYLE = {
    fontSize: 11,
    fill: "hsl(var(--muted-foreground))",
};

// ─── Helper: shorten an hour range string ────────────────────────────────────
function shortHour(h: number | string): string {
    if (typeof h === "number") {
        const ampm = h < 12 ? "am" : "pm";
        return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${ampm}`;
    }
    // String range like "07:00-08:59" → "7am"
    const start = String(h).split("-")[0].split(":")[0];
    const num = parseInt(start, 10);
    if (isNaN(num)) return String(h);
    const ampm = num < 12 ? "am" : "pm";
    return `${num === 0 ? 12 : num > 12 ? num - 12 : num}${ampm}`;
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function ChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-border bg-card p-4 sm:p-5"
        >
            <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-semibold text-foreground uppercase tracking-wider">
                {title}
            </h3>
            {children}
        </motion.div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
type Props = {
    patterns: CallPatternData;
};

export default function CallPatternsSection({ patterns }: Props) {
    return (
        <div className="space-y-4 sm:space-y-5">
            {/* Section title */}
            <h2 className="text-sm sm:text-base font-semibold section-heading-gradient">
                Call Patterns
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">

                {/* ── Day of Week ── */}
                <ChartCard title="Calls by Day of Week">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                            data={patterns.byDayOfWeek}
                            barSize={18}
                            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="day"
                                tickFormatter={(v) => v.slice(0, 3)}
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                            />
                            <Bar dataKey="count" name="Calls" radius={[4, 4, 0, 0]}>
                                {patterns.byDayOfWeek.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        opacity={0.9}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* ── Hour of Day ── */}
                <ChartCard title="Calls by Hour of Day">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                            data={patterns.byHourOfDay.map((p) => ({
                                ...p,
                                displayHour: shortHour(p.hour),
                            }))}
                            barSize={16}
                            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="displayHour"
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                            />
                            <Bar dataKey="count" name="Calls" radius={[4, 4, 0, 0]}>
                                {patterns.byHourOfDay.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        opacity={0.9}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* ── Call Outcomes (if present) ── */}
                {patterns.byOutcome && patterns.byOutcome.length > 0 && (
                    <ChartCard title="Call Outcomes">
                        <div className="space-y-2">
                            {patterns.byOutcome
                                .sort((a, b) => b.count - a.count)
                                .map((item) => {
                                    const color =
                                        OUTCOME_COLORS[item.outcome] ?? "#6366f1";
                                    return (
                                        <div key={item.outcome} className="space-y-1">
                                            <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                                <span className="text-muted-foreground truncate pr-2 max-w-[55%]">
                                                    {item.outcome}
                                                </span>
                                                <span className="font-semibold text-foreground shrink-0">
                                                    {item.count}{" "}
                                                    <span className="font-normal text-muted-foreground">
                                                        ({item.percentage.toFixed(1)}%)
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.percentage}%` }}
                                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </ChartCard>
                )}

                {/* ── Top Questions ── */}
                <ChartCard title="Top Call Reasons">
                    <div className="space-y-2">
                        {patterns.topQuestions.slice(0, 8).map((item) => {
                            const max = Math.max(
                                ...patterns.topQuestions.slice(0, 8).map((q) => q.count)
                            );
                            return (
                                <div key={item.question} className="space-y-1">
                                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                                        <span className="text-muted-foreground truncate pr-2 max-w-[60%]">
                                            {item.question}
                                        </span>
                                        <span className="font-semibold text-foreground shrink-0">
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(item.count / max) * 100}%`,
                                            }}
                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                            className="h-full rounded-full bg-primary"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>

                {/* ── Party Size ── */}
                <ChartCard title="Party Size Distribution">
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart
                            data={patterns.byPartySize}
                            barSize={24}
                            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                        >
                            <XAxis
                                dataKey="size"
                                tickFormatter={(v) => `${v}`}
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={AXIS_STYLE}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                                formatter={(val) => [val, "Bookings"]}
                            />
                            <Bar
                                dataKey="count"
                                name="Bookings"
                                radius={[4, 4, 0, 0]}
                            >
                                {patterns.byPartySize.map((_, i) => (
                                    <Cell
                                        key={i}
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        opacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* ── Special Requests ── */}
                {patterns.topSpecialRequests &&
                    patterns.topSpecialRequests.length > 0 && (
                        <ChartCard title="Top Special Requests">
                            <div className="flex flex-wrap gap-2">
                                {patterns.topSpecialRequests.map((item, i) => (
                                    <div
                                        key={item.request}
                                        className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5"
                                    >
                                        <div
                                            className="h-2 w-2 rounded-full shrink-0"
                                            style={{
                                                backgroundColor:
                                                    CHART_COLORS[i % CHART_COLORS.length],
                                            }}
                                        />
                                        <span className="text-xs text-foreground">
                                            {item.request}
                                        </span>
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            ×{item.count}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </ChartCard>
                    )}
            </div>
        </div>
    );
}