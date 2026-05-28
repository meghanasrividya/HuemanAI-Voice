"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, Target, CheckCircle2, SquareCheckBig } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StrategicRecommendation, UrgencyLevel } from "@/components/insights/types";

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
    recommendations: StrategicRecommendation[];
};

function RecommendationCard({
    item,
    defaultOpen,
}: {
    item: StrategicRecommendation;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const [badgeHovered, setBadgeHovered] = useState(false);
    // Force all recommendations to render as "medium" severity to match the production design exactly
    const sev = "medium";
    const style = SEVERITY[sev];
    const displayTitle = item.headline ?? item.title ?? "Recommendation";

    // Extract potential impact text from possible keys in API response
    const potentialImpact =
        (item.opportunity as any)?.potentialImpact ||
        (item.opportunity as any)?.impact ||
        (item as any).potentialImpact ||
        (item as any).impactDescription ||
        (item as any).impact;

    // Extract implementation steps from possible keys in API response
    const plan = (item as any).implementationPlan || (item as any).implementation || (item as any).plan || (item as any).action;
    let steps: { stage: string; text: string; color: string }[] = [];

    if (plan) {
        if (Array.isArray(plan)) {
            steps = plan.map((step: any) => {
                const stage = (step.stage || step.timeframe || step.title || "").toUpperCase();
                const text = step.description || step.action || step.text || "";
                let color = "text-blue-400";
                if (stage.includes("IMMEDIATE") || stage.includes("WEEK")) color = "text-red-400";
                else if (stage.includes("SHORT") || stage.includes("MONTH")) color = "text-amber-400";
                return { stage, text, color };
            });
        } else if (typeof plan === "object") {
            const immediate = plan.immediate || plan.immediateAction || plan.thisWeek || plan.short;
            const shortTerm = plan.shortTerm || plan.thisMonth || plan.medium;
            const ongoing = plan.ongoing || plan.longTerm || plan.long;

            if (immediate) {
                steps.push({
                    stage: "IMMEDIATE (THIS WEEK)",
                    text: immediate,
                    color: "text-red-400",
                });
            }
            if (shortTerm) {
                steps.push({
                    stage: "SHORT TERM (THIS MONTH)",
                    text: shortTerm,
                    color: "text-amber-400",
                });
            }
            if (ongoing) {
                steps.push({
                    stage: "ONGOING",
                    text: ongoing,
                    color: "text-blue-400",
                });
            }
        } else if (typeof plan === "string") {
            steps.push({
                stage: "ACTION PLAN",
                text: plan,
                color: "text-blue-400",
            });
        }
    }

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
                        #{item.recommendationNumber}
                    </span>
                </div>

                <span className="flex-1 text-xs sm:text-sm font-medium text-zinc-100 leading-snug line-clamp-2 sm:line-clamp-1">
                    {displayTitle}
                </span>

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
                        <div className="border-t border-[#1e1e24] px-4 pb-5 space-y-5 pt-4">
                            {/* Based On */}
                            {item.basedOn && item.basedOn.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                    <span className="text-zinc-400">Based on insights:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {item.basedOn.map((ref) => (
                                            <span
                                                key={ref}
                                                className="rounded-md border border-[#1e1e24] bg-[#121214] px-2 py-0.5 text-[10px] font-bold text-zinc-300 tracking-wide"
                                            >
                                                {ref}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Opportunity */}
                            {item.opportunity?.description && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Lightbulb className="h-4 w-4 text-emerald-500" />
                                        <h4 className="text-xs sm:text-sm font-semibold text-[#2dd4bf]">
                                            Opportunity
                                        </h4>
                                    </div>
                                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                                        {item.opportunity.description}
                                    </p>
                                    {potentialImpact && (
                                        <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs sm:text-sm text-emerald-400 leading-relaxed">
                                            <span className="font-bold">Potential impact:</span> {potentialImpact}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Implementation Plan */}
                            {steps.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <SquareCheckBig className="h-4 w-4 text-zinc-300" />
                                        <h4 className="text-xs sm:text-sm font-semibold text-[#2dd4bf]">
                                            Implementation Plan
                                        </h4>
                                    </div>
                                    <div className="space-y-3">
                                        {steps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className="rounded-xl border border-[#1e1e24] bg-[#121214]/40 p-3 px-4"
                                            >
                                                <span className={cn("text-[10px] sm:text-xs font-bold uppercase tracking-wider", step.color)}>
                                                    {step.stage}
                                                </span>
                                                <div className="flex items-start gap-2 text-xs sm:text-sm text-zinc-300 mt-1.5">
                                                    <span className="text-zinc-500 select-none">•</span>
                                                    <p className="leading-relaxed">{step.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Success Metric */}
                            {item.successMetric && (
                                <div className="rounded-xl border border-[#1e1e24] bg-[#121214]/30 p-3.5 px-4 space-y-1">
                                    <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
                                        Success Metric
                                    </h4>
                                    <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                                        {item.successMetric}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function RecommendationInsights({ recommendations }: Props) {
    if (!recommendations?.length) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                No recommendations found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recommendations.map((item, i) => (
                <RecommendationCard key={item.id} item={item} defaultOpen={i === 0} />
            ))}
        </div>
    );
}
