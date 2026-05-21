"use client";

import { motion } from "framer-motion";

import {
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

import { cn } from "@/lib/utils";

type BreakdownItem = {
    name: string;
    count: number;
};

type TrendData = {
    changePct?: number;
    rag?: "green" | "amber" | "red";
    sparkline?: number[];
};

type Props = {
    label: string;
    value: number | string;
    delta?: number;
    format?:
        | "number"
        | "percent"
        | "duration"
        | "score";

    trend?: TrendData;

    className?: string;

    onClick?: () => void;

    breakdown?: BreakdownItem[];
};

const ragColors = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
};

function Sparkline({
                       data,
                       className,
                   }: {
    data?: number[];
    className?: string;
}) {
    if (!data || data.length < 2)
        return null;

    const max = Math.max(...data, 1);

    const min = Math.min(...data, 0);

    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x =
                (index / (data.length - 1)) *
                80;

            const y =
                24 -
                ((value - min) / range) * 24;

            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            width={80}
            height={24}
            viewBox="0 0 80 24"
            className={cn(
                "opacity-40",
                className
            )}
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function formatValue(
    value: number | string,
    format: Props["format"]
) {
    if (typeof value === "string")
        return value;

    switch (format) {
        case "percent":
            return `${value.toFixed(1)}%`;

        case "duration":
            const mins = Math.floor(
                value / 60
            );

            const secs = value % 60;

            return `${mins}:${secs
                .toString()
                .padStart(2, "0")}`;

        case "score":
            return value.toFixed(2);

        default:
            return value.toLocaleString();
    }
}

export default function KpiCard({
                                    label,
                                    value,
                                    delta,
                                    format = "number",
                                    trend,
                                    className,
                                    onClick,
                                    breakdown,
                                }: Props) {
    const changePct =
        trend?.changePct ?? delta;

    const positive =
        changePct !== undefined &&
        changePct > 0;

    const negative =
        changePct !== undefined &&
        changePct < 0;

    const neutral =
        changePct !== undefined &&
        changePct === 0;

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-premium-sm card-glow card-shine flex flex-col justify-between min-h-[140px]",
                onClick &&
                "cursor-pointer hover:border-border/80",
                className
            )}
        >
            {/* RAG */}
            {trend?.rag && (
                <div className="absolute top-3 right-3">
                    <div
                        className={cn(
                            "h-2.5 w-2.5 rounded-full",
                            ragColors[trend.rag]
                        )}
                    />
                </div>
            )}

            <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>

                <div className="flex items-end gap-4 overflow-hidden">
                    <p className="text-3xl font-semibold tracking-tight tabular-nums">
                        {formatValue(value, format)}
                    </p>

                    {breakdown &&
                        breakdown.length > 0 && (
                            <div className="mb-1 flex flex-col gap-1 border-l border-border/60 pl-3 text-[10px] leading-tight">
                                {breakdown
                                    .filter(
                                        (item) => item.name
                                    )
                                    .map((item) => (
                                        <div
                                            key={item.name}
                                            className="flex items-center gap-1.5 leading-none"
                                        >
                      <span className="font-medium whitespace-nowrap text-muted-foreground">
                        {item.name}
                      </span>

                                            <span className="font-bold text-foreground">
                        {item.count}
                      </span>
                                        </div>
                                    ))}
                            </div>
                        )}
                </div>
            </div>

            <div
                className={cn(
                    "mt-auto flex items-center pt-2",
                    changePct !== undefined
                        ? "justify-between"
                        : "justify-end"
                )}
            >
                {changePct !== undefined && (
                    <div
                        className={cn(
                            "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium shrink-0",
                            positive &&
                            "bg-emerald-500/10 text-emerald-500",
                            negative &&
                            "bg-red-500/10 text-red-500",
                            neutral &&
                            "bg-secondary text-muted-foreground"
                        )}
                    >
                        {positive && (
                            <TrendingUp className="h-3 w-3" />
                        )}

                        {negative && (
                            <TrendingDown className="h-3 w-3" />
                        )}

                        {neutral && (
                            <Minus className="h-3 w-3" />
                        )}

                        {Math.abs(changePct).toFixed(
                            1
                        )}
                        %
                    </div>
                )}

                {trend?.sparkline &&
                    trend.sparkline.length >
                    1 && (
                        <Sparkline
                            data={trend.sparkline}
                            className="ml-auto text-muted-foreground"
                        />
                    )}
            </div>
        </div>
    );
}