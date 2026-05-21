"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    CheckCircle2,
    XCircle,
} from "lucide-react";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

import { cn } from "@/lib/utils";

type PatternData = {
    byDayOfWeek: {
        day: string;
        count: number;
        bookings: number;
    }[];

    byHourOfDay: {
        hour: number | string;
        count: number;
        bookings: number;
    }[];

    topQuestions: {
        question: string;
        count: number;
        answered: boolean;
    }[];

    byPartySize: {
        size: string;
        count: number;
    }[];

    topSpecialRequests?: {
        request: string;
        count: number;
    }[];
};

type Props = {
    patterns: PatternData;
};

const tooltipStyle = {
    backgroundColor: "hsl(220 14% 11%)",
    border: "1px solid hsl(220 13% 18%)",
    borderRadius: "6px",
    fontSize: "12px",
    color: "hsl(220 9% 80%)",
};

const axisStyle = {
    stroke: "hsl(220 13% 30%)",
    fontSize: 11,
    fontFamily: "inherit",
};

function formatHour(hour: number | string) {
    const parsed =
        typeof hour === "string"
            ? parseInt(hour)
            : hour;

    if (isNaN(parsed)) return String(hour);

    if (parsed === 0) return "12am";

    if (parsed === 12) return "12pm";

    if (parsed > 12) {
        return `${parsed - 12}pm`;
    }

    return `${parsed}am`;
}

function PartySizeRow({
                          size,
                          count,
                          max,
                      }: {
    size: string;
    count: number;
    max: number;
}) {
    const percentage =
        max > 0 ? (count / max) * 100 : 0;

    return (
        <div className="flex items-center gap-3">
      <span className="w-6 shrink-0 text-right text-xs font-medium text-muted-foreground tabular-nums">
        {size}
      </span>

            <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted/30">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: 0.6,
                        ease: "easeOut",
                    }}
                    className="h-full rounded-sm"
                    style={{
                        backgroundColor: "hsl(217 91% 60%)",
                        opacity: 0.75,
                    }}
                />
            </div>

            <span className="w-6 shrink-0 text-xs text-muted-foreground tabular-nums">
        {count}
      </span>
        </div>
    );
}

export default function CallPatternsSection({
                                                patterns,
                                            }: Props) {
    const [expanded, setExpanded] =
        useState(true);

    const maxPartySize = Math.max(
        ...(patterns.byPartySize?.map(
            (item) => item.count
        ) ?? [1])
    );

    return (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors"
            >
                <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-widest section-heading-gradient">
            Call Patterns & Analytics
          </span>
                </div>

                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                        expanded && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{
                            height: 0,
                            opacity: 0,
                        }}
                        animate={{
                            height: "auto",
                            opacity: 1,
                        }}
                        exit={{
                            height: 0,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                        }}
                        className="overflow-hidden"
                    >
                        <div className="divide-y divide-border border-t border-border">
                            {/* Charts */}
                            <div className="grid gap-0 divide-border md:grid-cols-2 md:divide-x">
                                {/* Day of Week */}
                                <div className="p-5">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest section-heading-gradient">
                                        Calls by Day of Week
                                    </p>

                                    <div className="h-52">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={patterns.byDayOfWeek}
                                                barGap={2}
                                                barCategoryGap="30%"
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="hsl(220 13% 18%)"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="day"
                                                    tick={{ ...axisStyle }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={(v) =>
                                                        v.slice(0, 3)
                                                    }
                                                />

                                                <YAxis
                                                    tick={{ ...axisStyle }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={28}
                                                />

                                                <Tooltip
                                                    contentStyle={tooltipStyle}
                                                    cursor={{
                                                        fill:
                                                            "hsl(220 13% 18%)",
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="count"
                                                    name="Total Calls"
                                                    fill="hsl(220 9% 72%)"
                                                    radius={[3, 3, 0, 0]}
                                                    maxBarSize={32}
                                                />

                                                <Bar
                                                    dataKey="bookings"
                                                    name="Bookings"
                                                    fill="hsl(142 71% 45%)"
                                                    radius={[3, 3, 0, 0]}
                                                    maxBarSize={32}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Hour of Day */}
                                <div className="p-5">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest section-heading-gradient">
                                        Calls by Hour of Day
                                    </p>

                                    <div className="h-52">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <BarChart
                                                data={patterns.byHourOfDay}
                                                barGap={2}
                                                barCategoryGap="25%"
                                            >
                                                <CartesianGrid
                                                    strokeDasharray="3 3"
                                                    stroke="hsl(220 13% 18%)"
                                                    vertical={false}
                                                />

                                                <XAxis
                                                    dataKey="hour"
                                                    tick={{ ...axisStyle }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tickFormatter={formatHour}
                                                    interval={2}
                                                />

                                                <YAxis
                                                    tick={{ ...axisStyle }}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    width={28}
                                                />

                                                <Tooltip
                                                    contentStyle={tooltipStyle}
                                                    cursor={{
                                                        fill:
                                                            "hsl(220 13% 18%)",
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="count"
                                                    name="Total Calls"
                                                    fill="hsl(220 9% 72%)"
                                                    radius={[3, 3, 0, 0]}
                                                    maxBarSize={24}
                                                />

                                                <Bar
                                                    dataKey="bookings"
                                                    name="Bookings"
                                                    fill="hsl(142 71% 45%)"
                                                    radius={[3, 3, 0, 0]}
                                                    maxBarSize={24}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Top Questions */}
                            <div className="p-5">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-widest section-heading-gradient">
                                    Top Questions Asked
                                </p>

                                <div className="grid gap-2 sm:grid-cols-2">
                                    {patterns.topQuestions.map(
                                        (question, index) => (
                                            <div
                                                key={index}
                                                className="flex items-start gap-2.5 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5"
                                            >
                                                {question.answered ? (
                                                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400/80" />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm leading-snug text-foreground">
                                                        {question.question}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {question.count}× ·{" "}
                                                        {question.answered
                                                            ? "Answered"
                                                            : "Not answered"}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Party Size + Special Requests */}
                            <div className="grid gap-0 divide-border md:grid-cols-2 md:divide-x">
                                {/* Party Size */}
                                <div className="p-5">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest section-heading-gradient">
                                        Bookings by Party Size
                                    </p>

                                    <div className="space-y-2.5">
                                        {patterns.byPartySize.map(
                                            (item) => (
                                                <PartySizeRow
                                                    key={item.size}
                                                    size={item.size}
                                                    count={item.count}
                                                    max={maxPartySize}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>

                                {/* Special Requests */}
                                {patterns.topSpecialRequests &&
                                    patterns
                                        .topSpecialRequests.length >
                                    0 && (
                                        <div className="p-5">
                                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest section-heading-gradient">
                                                Top Special Requests
                                            </p>

                                            <div className="space-y-2">
                                                {[...patterns.topSpecialRequests]
                                                    .sort(
                                                        (a, b) =>
                                                            b.count - a.count
                                                    )
                                                    .map((item, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between gap-3"
                                                        >
                              <span className="truncate text-sm text-foreground">
                                {item.request}
                              </span>

                                                            <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-muted/50 px-1.5 text-xs font-semibold text-muted-foreground tabular-nums">
                                {item.count}
                              </span>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}