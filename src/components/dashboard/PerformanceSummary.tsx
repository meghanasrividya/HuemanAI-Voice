"use client";

import {
    CheckCircle2,
    Clock3,
    AlertTriangle,
    TrendingUp,
} from "lucide-react";

import AnalyticsCard from "./widgets/AnalyticsCard";

type Props = {
    answeredRate: number;
    avgResponseTime: number;
    escalationRate: number;
    satisfactionScore: number;
};

function formatDuration(
    seconds: number
) {
    if (!seconds) return "0s";

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const mins = Math.floor(
        seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}m ${secs}s`;
}

const items = [
    {
        key: "answeredRate",
        label: "Answered Rate",
        icon: CheckCircle2,
        color: "text-emerald-500",
        suffix: "%",
    },

    {
        key: "avgResponseTime",
        label: "Avg Response Time",
        icon: Clock3,
        color: "text-blue-500",
    },

    {
        key: "escalationRate",
        label: "Escalation Rate",
        icon: AlertTriangle,
        color: "text-amber-500",
        suffix: "%",
    },

    {
        key: "satisfactionScore",
        label: "Satisfaction",
        icon: TrendingUp,
        color: "text-purple-500",
    },
] as const;

export default function PerformanceSummary({
                                               answeredRate,
                                               avgResponseTime,
                                               escalationRate,
                                               satisfactionScore,
                                           }: Props) {
    const values = {
        answeredRate,
        avgResponseTime,
        escalationRate,
        satisfactionScore,
    };

    return (
        <AnalyticsCard
            title="Performance Summary"
            className="h-full"
        >
            <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => {
                    const Icon = item.icon;

                    const raw =
                        values[item.key];

                    let display: string;

                    if (
                        item.key ===
                        "avgResponseTime"
                    ) {
                        display =
                            formatDuration(raw);
                    } else if (
                        (item as any).suffix
                    ) {
                        display = `${raw.toFixed(
                            1
                        )}${(item as any).suffix}`;
                    } else {
                        display =
                            raw.toFixed(2);
                    }

                    return (
                        <div
                            key={item.key}
                            className="rounded-xl border border-border bg-secondary/30 p-4"
                        >
                            <div className="flex items-center gap-2">
                                <Icon
                                    className={`h-4 w-4 ${item.color}`}
                                />

                                <p className="text-xs font-medium text-muted-foreground">
                                    {item.label}
                                </p>
                            </div>

                            <p className="mt-3 text-2xl font-semibold tracking-tight">
                                {display}
                            </p>
                        </div>
                    );
                })}
            </div>
        </AnalyticsCard>
    );
}