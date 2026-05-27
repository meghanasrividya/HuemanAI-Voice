"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    TrendingUp,
    Lightbulb,
    BarChart3,
    Bot,
    Users,
    Quote,
    SquareCheckBig,
    Wrench,
    AlertCircle,
    Clock,
    User,
    Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    RevenueInsightItem,
    BotPerformanceIssue,
    StrategicRecommendation,
} from "@/components/insights/types";

// ─── Severity ────────────────────────────────────────────────────────────────

const severityStyles = {
    critical: {
        border: "border-l-red-500",
        badge: "bg-red-500/10 text-red-500 border-red-500/30",
        label: "CRITICAL",
    },
    high: {
        border: "border-l-amber-500",
        badge: "bg-amber-500/10 text-amber-500 border-amber-500/30",
        label: "HIGH",
    },
    medium: {
        border: "border-l-blue-500",
        badge: "bg-blue-500/10 text-blue-500 border-blue-500/30",
        label: "MEDIUM",
    },
    low: {
        border: "border-l-zinc-400",
        badge: "bg-zinc-500/10 text-zinc-400 border-zinc-400/30",
        label: "LOW",
    },
} as const;

// ─── Section helper ───────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    color,
    children,
}: {
    icon: React.ElementType;
    title: string;
    color: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", color)} />
                <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                    {title}
                </h4>
            </div>
            {children}
        </div>
    );
}

// ─── Revenue Insight expanded body ────────────────────────────────────────────

function RevenueInsight({ insight }: { insight: RevenueInsightItem }) {
    return (
        <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4">
            {/* Signal stats row */}
            <div className="flex flex-wrap gap-3">
                {insight.signal?.callCount !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 px-3 py-1.5">
                        <Phone className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-500">
                            {insight.signal.callCount} calls
                        </span>
                    </div>
                )}
                {insight.impact?.revenueEstimate && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500">
                            {insight.impact.revenueEstimate}
                        </span>
                    </div>
                )}
                {insight.impact?.coversAffected !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 px-3 py-1.5">
                        <Users className="h-3.5 w-3.5 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-500">
                            ~{insight.impact.coversAffected} covers
                        </span>
                    </div>
                )}
            </div>

            <Section icon={BarChart3} title="Signal Detected" color="text-blue-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.signal?.description}
                </p>
            </Section>

            <Section icon={TrendingUp} title="Revenue Impact" color="text-amber-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.impact?.description}
                </p>
            </Section>

            <Section icon={Lightbulb} title="Why This Matters" color="text-purple-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.reasoning}
                </p>
            </Section>

            {/* Action box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4">
                <div className="mb-2 flex items-center gap-2">
                    <SquareCheckBig className="h-4 w-4 text-primary" />
                    <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                        Recommended Action
                    </h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.action?.description}
                </p>
                {(insight.action?.owner || insight.action?.timeline) && (
                    <div className="mt-2.5 flex flex-wrap gap-3">
                        {insight.action.owner && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{insight.action.owner}</span>
                            </div>
                        )}
                        {insight.action.timeline && (
                            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{insight.action.timeline}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Caller quotes */}
            {insight.evidence?.quotes && insight.evidence.quotes.length > 0 && (
                <Section icon={Quote} title="Caller Evidence" color="text-muted-foreground">
                    <div className="space-y-2">
                        {insight.evidence.quotes.map((quote, index) => (
                            <blockquote
                                key={index}
                                className="border-l-2 border-muted-foreground/20 pl-3 text-xs sm:text-sm italic text-muted-foreground"
                            >
                                {quote}
                            </blockquote>
                        ))}
                    </div>
                </Section>
            )}
        </div>
    );
}

// ─── Bot Issue expanded body ───────────────────────────────────────────────────

function BotIssue({ insight }: { insight: BotPerformanceIssue }) {
    return (
        <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4">
            {/* Impact stats */}
            <div className="flex flex-wrap gap-3">
                {insight.callerImpact?.frustratedCallers !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs font-semibold text-red-500">
                            {insight.callerImpact.frustratedCallers} callers affected
                        </span>
                    </div>
                )}
                {insight.callerImpact?.lostBookings !== undefined && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                        <span className="text-xs font-semibold text-amber-500">
                            {insight.callerImpact.lostBookings} lost bookings
                        </span>
                    </div>
                )}
            </div>

            <Section icon={Bot} title="What&apos;s Happening" color="text-blue-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.problem?.description}
                </p>
            </Section>

            <Section icon={Users} title="Caller Impact" color="text-amber-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.callerImpact?.description}
                </p>
            </Section>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 sm:p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />
                    <h4 className="text-xs sm:text-sm font-semibold section-heading-gradient">
                        Training Recommendation
                    </h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-2">
                    {insight.trainingRecommendation?.description}
                </p>
                <div className="rounded-lg border border-border bg-background/70 p-2 sm:p-3 text-xs sm:text-sm text-foreground leading-relaxed">
                    {insight.trainingRecommendation?.specificFix}
                </div>
                {insight.trainingRecommendation?.estimatedEffort && (
                    <p className="mt-2 text-[10px] sm:text-xs text-muted-foreground">
                        Effort: {insight.trainingRecommendation.estimatedEffort}
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Recommendation expanded body ─────────────────────────────────────────────

function Recommendation({ insight }: { insight: StrategicRecommendation }) {
    return (
        <div className="space-y-4 sm:space-y-5 pt-3 sm:pt-4">
            <Section icon={Lightbulb} title="Opportunity" color="text-emerald-500">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {insight.opportunity?.description}
                </p>
            </Section>

            <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
                <h4 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider section-heading-gradient mb-1">
                    Success Metric
                </h4>
                <p className="text-xs sm:text-sm text-foreground">
                    {insight.successMetric}
                </p>
            </div>
        </div>
    );
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

type InsightCardType = "revenue" | "bot" | "recommendation";

type InsightCardProps = {
    insight: RevenueInsightItem | BotPerformanceIssue | StrategicRecommendation;
    type: InsightCardType;
    defaultExpanded?: boolean;
};

function InsightCard({ insight, type, defaultExpanded = false }: InsightCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    // Normalize urgency — API sends "Critical", "High" etc. (title case)
    const rawPriority =
        ("urgency" in insight && insight.urgency
            ? String(insight.urgency)
            : "") ||
        ("priority" in insight && insight.priority
            ? String(insight.priority)
            : "") ||
        "medium";

    const normalized = (["critical", "high", "medium", "low"].includes(
        rawPriority.toLowerCase()
    )
        ? rawPriority.toLowerCase()
        : "medium") as keyof typeof severityStyles;

    const style = severityStyles[normalized];

    const number =
        ("insightNumber" in insight ? insight.insightNumber : undefined) ??
        ("issueNumber" in insight ? insight.issueNumber : undefined) ??
        ("recommendationNumber" in insight
            ? insight.recommendationNumber
            : undefined) ??
        0;

    const title =
        ("headline" in insight && insight.headline ? insight.headline : "") ||
        ("title" in insight && insight.title ? insight.title : "") ||
        "Insight";

    // Preview badge — show revenue estimate for revenue insights
    const revenueEstimate =
        "impact" in insight &&
        (insight as RevenueInsightItem).impact?.revenueEstimate;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 border-l-4",
                style.border
            )}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
            >
                {/* Left: badge + number */}
                <div className="flex items-center gap-2 shrink-0">
                    <Badge
                        className={cn(
                            "text-[10px] font-bold uppercase tracking-wider",
                            style.badge
                        )}
                    >
                        {style.label}
                    </Badge>
                    <span className="text-xs sm:text-sm font-bold text-muted-foreground">
                        #{number}
                    </span>
                </div>

                {/* Middle: title */}
                <span className="flex-1 text-xs sm:text-sm font-medium text-foreground leading-snug line-clamp-2 sm:line-clamp-1">
                    {title}
                </span>

                {/* Revenue estimate preview (desktop only) */}
                {revenueEstimate && (
                    <span className="hidden sm:inline-flex shrink-0 items-center rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
                        {revenueEstimate}
                    </span>
                )}

                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 self-end sm:self-auto text-muted-foreground transition-transform duration-200",
                        expanded && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border px-3 sm:px-4 pb-4 sm:pb-5">
                            {type === "revenue" && (
                                <RevenueInsight insight={insight as RevenueInsightItem} />
                            )}
                            {type === "bot" && (
                                <BotIssue insight={insight as BotPerformanceIssue} />
                            )}
                            {type === "recommendation" && (
                                <Recommendation insight={insight as StrategicRecommendation} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Main list ────────────────────────────────────────────────────────────────

type Props = {
    type: "revenue" | "recommendations" | string;
    revenueInsights: RevenueInsightItem[];
    botIssues: BotPerformanceIssue[];
    recommendations: StrategicRecommendation[];
};

export default function InsightsList({
    type,
    revenueInsights,
    recommendations,
}: Props) {
    const items =
        type === "revenue"
            ? revenueInsights
            : recommendations.filter(
                (item) =>
                    !item.basedOn?.some((v) => v.startsWith("BP-"))
            );

    const insightType: InsightCardType =
        type === "revenue" ? "revenue" : "recommendation";

    if (items.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-xs sm:text-sm text-muted-foreground">
                No {type === "revenue" ? "revenue insights" : "recommendations"} found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <InsightCard
                    key={item.id}
                    insight={item}
                    type={insightType}
                    defaultExpanded={index === 0}
                />
            ))}
        </div>
    );
}