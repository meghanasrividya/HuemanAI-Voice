"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    TrendingUp,
    Lightbulb,
    BarChart3,
    Quote,
    SquareCheckBig,
    Clock,
    User,
    Phone,
    Users,
    PoundSterling,
    AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RevenueInsightItem, UrgencyLevel } from "@/components/insights/types";

const SEVERITY = {
    critical: {
        border: "border-l-red-500",
        badge: "bg-red-500/10 text-red-500 border-red-500/30",
        badgeHover: "bg-white text-red-500 border-white",
        label: "CRITICAL",
    },
    high: {
        border: "border-l-amber-500",
        badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        badgeHover: "bg-white text-amber-500 border-white",
        label: "HIGH",
    },
    medium: {
        border: "border-l-blue-500",
        badge: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        badgeHover: "bg-white text-blue-500 border-white",
        label: "MEDIUM",
    },
    low: {
        border: "border-l-zinc-400",
        badge: "bg-zinc-500/10 text-zinc-400 border-zinc-400/30",
        badgeHover: "bg-white text-zinc-500 border-white",
        label: "LOW",
    },
} as const;

type SeverityKey = keyof typeof SEVERITY;

function normalizeSeverity(v?: UrgencyLevel): SeverityKey {
    const lower = String(v ?? "medium").toLowerCase();
    return (["critical", "high", "medium", "low"].includes(lower)
        ? lower
        : "medium") as SeverityKey;
}

type Props = {
    insights: RevenueInsightItem[];
};

function RevenueCard({
    insight,
    defaultOpen,
}: {
    insight: RevenueInsightItem;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [badgeHovered, setBadgeHovered] = useState(false);
    const sev = normalizeSeverity(insight.urgency ?? insight.priority);
    const style = SEVERITY[sev];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "overflow-hidden rounded-xl border border-[#1e1e24] bg-[#161618] border-l-4 transition-all",
                style.border
            )}
        >
            {/* Header row */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "group flex w-full flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left transition-colors cursor-pointer",
                    !open && "hover:bg-[#1e1e24]"
                )}
            >
                <div className="flex items-center gap-2 shrink-0">
                    <Badge
                        variant="outline"
                        onMouseEnter={() => setBadgeHovered(true)}
                        onMouseLeave={() => setBadgeHovered(false)}
                        className={cn(
                            "text-xs font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                            badgeHovered ? style.badgeHover : style.badge
                        )}
                    >
                        {style.label}
                    </Badge>
                    <span className="text-sm font-bold text-zinc-400">
                        #{insight.insightNumber}
                    </span>
                </div>

                <span className="flex-1 text-sm sm:text-base font-medium text-zinc-100 leading-snug line-clamp-2 sm:line-clamp-1">
                    {insight.headline}
                </span>

                <ChevronDown
                    className={cn(
                        "h-4.5 w-4.5 shrink-0 text-zinc-400 transition-transform duration-200 self-end sm:self-auto",
                        open && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-[#1e1e24] px-4 sm:px-5 pb-5 sm:pb-6 space-y-6 pt-4 sm:pt-5">

                            {/* Signal Detected */}
                            {insight.signal?.description && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5 text-[#38bdf8]" />
                                        <h4 className="text-base font-bold text-[#38bdf8] tracking-wide">
                                            Signal Detected
                                        </h4>
                                    </div>

                                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed select-text">
                                        {insight.signal.description}
                                    </p>

                                    {/* Examples Bullet Points */}
                                    {insight.signal.examples && insight.signal.examples.length > 0 && (
                                        <ul className="space-y-2 pl-1.5 mt-3 select-text">
                                            {insight.signal.examples.map((ex, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-zinc-300 leading-relaxed">
                                                    <span className="text-zinc-500 shrink-0 font-bold">•</span>
                                                    <span>{ex}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Time Pattern */}
                                    {insight.signal.timePattern && (
                                        <div className="flex items-center gap-2 mt-3.5 text-xs text-zinc-400 font-semibold select-text">
                                            <Clock className="h-4 w-4 text-zinc-500 shrink-0" />
                                            <span>{insight.signal.timePattern}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Revenue Impact */}
                            {insight.impact?.description && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <PoundSterling className="h-5 w-5 text-[#eab308]" />
                                        <h4 className="text-base font-bold text-[#38bdf8] tracking-wide">
                                            Revenue Impact
                                        </h4>
                                    </div>

                                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed select-text">
                                        {insight.impact.description}
                                    </p>

                                    {/* Recurring Risk Warning Badge */}
                                    {insight.impact.recurringRisk && (
                                        <div className="flex items-center gap-2 mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 w-fit text-xs font-semibold text-rose-400 select-text">
                                            <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                                            <span>Recurring risk — pattern repeats weekly</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Why This Matters */}
                            {insight.reasoning && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-[#a855f7]" />
                                        <h4 className="text-base font-bold text-[#38bdf8] tracking-wide">
                                            Why This Matters
                                        </h4>
                                    </div>

                                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed select-text">
                                        {insight.reasoning}
                                    </p>
                                </div>
                            )}

                            {/* Action box */}
                            {insight.action?.description && (
                                <div className="rounded-xl border border-[#1e1e24] bg-[#0c0c0e] p-4 sm:p-5 space-y-3.5 select-text">
                                    <div className="flex items-center gap-2">
                                        <SquareCheckBig className="h-5 w-5 text-[#38bdf8]" />
                                        <h4 className="text-base font-bold text-[#38bdf8] tracking-wide">
                                            Action
                                        </h4>
                                    </div>

                                    <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                                        {insight.action.description}
                                    </p>

                                    {(insight.action.owner || insight.action.timeline) && (
                                        <div className="mt-4 flex flex-wrap gap-2.5 pt-1">
                                            {insight.action.owner && (
                                                <div className="flex items-center gap-2 rounded-full bg-[#161618] border border-[#1e1e24] px-4 py-1.5 text-xs text-zinc-300 font-semibold">
                                                    <User className="h-4 w-4 text-zinc-400 shrink-0" />
                                                    <span>{insight.action.owner}</span>
                                                </div>
                                            )}
                                            {insight.action.timeline && (
                                                <div className="flex items-center gap-2 rounded-full bg-[#161618] border border-[#1e1e24] px-4 py-1.5 text-xs text-zinc-300 font-semibold">
                                                    <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
                                                    <span>{insight.action.timeline}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Caller Quotes */}
                            {insight.evidence?.quotes && insight.evidence.quotes.length > 0 && (
                                <div className="space-y-2.5 pt-2 select-text">
                                    <div className="flex items-center gap-2">
                                        <Quote className="h-5 w-5 text-[#38bdf8]" />
                                        <h4 className="text-base font-bold text-[#38bdf8] tracking-wide">
                                            Caller Quotes
                                        </h4>
                                    </div>
                                    <div className="space-y-3.5 pl-0.5">
                                        {insight.evidence.quotes.map((q, idx) => (
                                            <blockquote
                                                key={idx}
                                                className="border-l border-zinc-700 pl-3.5 text-sm sm:text-base italic text-zinc-400 leading-relaxed"
                                            >
                                                {q}
                                            </blockquote>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function RevenueInsights({ insights }: Props) {
    if (!insights?.length) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                No revenue insights found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {insights.map((item, i) => (
                <RevenueCard key={item.id} insight={item} defaultOpen={i === 0} />
            ))}
        </div>
    );
}
