"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Bot,
    Users,
    Wrench,
    AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BotPerformanceIssue, UrgencyLevel } from "@/components/insights/types";

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
    issues: BotPerformanceIssue[];
};

function BotCard({
    issue,
    defaultOpen,
}: {
    issue: BotPerformanceIssue;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [badgeHovered, setBadgeHovered] = useState(false);
    const sev = normalizeSeverity(issue.priority ?? issue.urgency);
    const style = SEVERITY[sev];
    const displayTitle = issue.headline ?? issue.title ?? "Bot Issue";

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
                            "text-[10px] font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer",
                            badgeHovered ? style.badgeHover : style.badge
                        )}
                    >
                        {style.label}
                    </Badge>
                    <span className="text-xs font-bold text-zinc-400">
                        #{issue.issueNumber}
                    </span>
                </div>

                <span className="flex-1 text-xs sm:text-sm font-medium text-zinc-100 leading-snug line-clamp-2 sm:line-clamp-1">
                    {displayTitle}
                </span>

                {issue.callerImpact?.frustratedCallers !== undefined && (
                    <span className="inline-flex shrink-0 items-center rounded-full bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-red-500">
                        {issue.callerImpact.frustratedCallers} affected
                    </span>
                )}

                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 self-end sm:self-auto",
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
                        <div className="border-t border-[#1e1e24] px-3 sm:px-4 pb-4 sm:pb-5 space-y-4 sm:space-y-5 pt-3 sm:pt-4">

                            {/* Quick metrics */}
                            <div className="flex flex-wrap gap-2">
                                {issue.callerImpact?.frustratedCallers !== undefined && (
                                    <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5">
                                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                        <span className="text-xs font-semibold text-red-500">
                                            {issue.callerImpact.frustratedCallers} callers affected
                                        </span>
                                    </div>
                                )}
                                {issue.callerImpact?.lostBookings !== undefined && (
                                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                                        <Users className="h-3.5 w-3.5 text-amber-500" />
                                        <span className="text-xs font-semibold text-amber-500">
                                            {issue.callerImpact.lostBookings} lost bookings
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Problem */}
                            {issue.problem?.description && (
                                <div>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <Bot className="h-4 w-4 text-blue-500" />
                                        <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                                            What&apos;s Happening
                                        </h4>
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                        {issue.problem.description}
                                    </p>
                                    {issue.problem.frequency && (
                                        <p className="mt-1 text-[10px] sm:text-xs text-zinc-400 italic">
                                            Frequency: {issue.problem.frequency}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Caller Impact */}
                            {issue.callerImpact?.description && (
                                <div>
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-amber-500" />
                                        <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                                            Caller Impact
                                        </h4>
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                        {issue.callerImpact.description}
                                    </p>
                                </div>
                            )}

                            {/* Training Recommendation */}
                            {issue.trainingRecommendation && (
                                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Wrench className="h-4 w-4 text-primary" />
                                        <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                                            Training Recommendation
                                        </h4>
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-2">
                                        {issue.trainingRecommendation.description}
                                    </p>
                                    <div className="rounded-lg border border-[#1e1e24] bg-zinc-950/70 p-2 sm:p-3 text-xs sm:text-sm text-zinc-100 leading-relaxed">
                                        {issue.trainingRecommendation.specificFix}
                                    </div>
                                    {issue.trainingRecommendation.estimatedEffort && (
                                        <p className="mt-2 text-[10px] sm:text-xs text-zinc-400">
                                            Effort: {issue.trainingRecommendation.estimatedEffort}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function BotIssueInsights({ issues }: Props) {
    if (!issues?.length) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                No bot performance issues found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {issues.map((issue, i) => (
                <BotCard key={issue.id} issue={issue} defaultOpen={false} />
            ))}
        </div>
    );
}
