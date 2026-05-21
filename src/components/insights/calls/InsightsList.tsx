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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type InsightCardProps = {
    insight: any;
    type: "revenue" | "bot" | "recommendation";
    defaultExpanded?: boolean;
};

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
};

function Section({
                     icon: Icon,
                     title,
                     color,
                     children,
                 }: any) {
    return (
        <div>
            <div className="mb-2 flex items-center gap-2">
                <Icon className={cn("h-4 w-4", color)} />

                <h4 className="text-sm font-semibold section-heading-gradient">
                    {title}
                </h4>
            </div>

            {children}
        </div>
    );
}

function RevenueInsight({ insight }: any) {
    return (
        <div className="space-y-5 pt-4">
            <Section
                icon={BarChart3}
                title="Signal Detected"
                color="text-blue-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.signal?.description}
                </p>
            </Section>

            <Section
                icon={TrendingUp}
                title="Revenue Impact"
                color="text-amber-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.impact?.description}
                </p>
            </Section>

            <Section
                icon={Lightbulb}
                title="Why This Matters"
                color="text-purple-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.reasoning}
                </p>
            </Section>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <SquareCheckBig className="h-4 w-4 text-primary" />

                    <h4 className="text-sm font-semibold section-heading-gradient">
                        Action
                    </h4>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.action?.description}
                </p>
            </div>

            {insight.evidence?.quotes?.length > 0 && (
                <Section
                    icon={Quote}
                    title="Caller Quotes"
                    color="text-muted-foreground"
                >
                    <div className="space-y-2">
                        {insight.evidence.quotes.map(
                            (quote: string, index: number) => (
                                <blockquote
                                    key={index}
                                    className="border-l-2 border-muted-foreground/20 pl-3 text-sm italic text-muted-foreground"
                                >
                                    {quote}
                                </blockquote>
                            )
                        )}
                    </div>
                </Section>
            )}
        </div>
    );
}

function BotIssue({ insight }: any) {
    return (
        <div className="space-y-5 pt-4">
            <Section
                icon={Bot}
                title="What's Happening"
                color="text-blue-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.problem?.description}
                </p>
            </Section>

            <Section
                icon={Users}
                title="Caller Impact"
                color="text-amber-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.callerImpact?.description}
                </p>
            </Section>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="mb-2 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-primary" />

                    <h4 className="text-sm font-semibold section-heading-gradient">
                        Training Recommendation
                    </h4>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                    {insight.trainingRecommendation?.description}
                </p>

                <div className="rounded-lg border border-border bg-background/70 p-3 text-sm text-foreground leading-relaxed">
                    {insight.trainingRecommendation?.specificFix}
                </div>
            </div>
        </div>
    );
}

function Recommendation({ insight }: any) {
    return (
        <div className="space-y-5 pt-4">
            <Section
                icon={Lightbulb}
                title="Opportunity"
                color="text-emerald-500"
            >
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.opportunity?.description}
                </p>
            </Section>

            <div className="rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider section-heading-gradient mb-1">
                    Success Metric
                </h4>

                <p className="text-sm text-foreground">
                    {insight.successMetric}
                </p>
            </div>
        </div>
    );
}

function InsightCard({
                         insight,
                         type,
                         defaultExpanded = false,
                     }: InsightCardProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    let priority = "medium";

    if ("urgency" in insight) {
        priority = insight.urgency;
    }

    if ("priority" in insight) {
        priority = insight.priority;
    }

    const normalized = ["critical", "high", "medium"].includes(
        priority.toLowerCase()
    )
        ? priority.toLowerCase()
        : "medium";

    const style =
        severityStyles[
            normalized as keyof typeof severityStyles
            ];

    const number =
        insight.insightNumber ||
        insight.issueNumber ||
        insight.recommendationNumber ||
        0;

    const title =
        insight.headline ||
        insight.title ||
        "Insight";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "overflow-hidden rounded-xl border border-border bg-card transition-all duration-200",
                "border-l-4",
                style.border
            )}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
            >
                <Badge
                    className={cn(
                        "shrink-0 text-[10px] font-bold uppercase tracking-wider",
                        style.badge
                    )}
                >
                    {style.label}
                </Badge>

                <span className="shrink-0 text-sm font-bold text-muted-foreground">
          #{number}
        </span>

                <span className="flex-1 text-sm font-medium text-foreground leading-snug line-clamp-1">
          {title}
        </span>

                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
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
                        transition={{
                            duration: 0.25,
                            ease: "easeInOut",
                        }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border px-4 pb-5">
                            {type === "revenue" && (
                                <RevenueInsight insight={insight} />
                            )}

                            {type === "bot" && (
                                <BotIssue insight={insight} />
                            )}

                            {type === "recommendation" && (
                                <Recommendation insight={insight} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

type Props = {
    type: "revenue" | "recommendation";
    revenueInsights: any[];
    botIssues: any[];
    recommendations: any[];
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
                    !item.basedOn?.some((v: string) =>
                        v.startsWith("BP-")
                    )
            );

    const insightType =
        type === "revenue"
            ? "revenue"
            : "recommendation";

    if (items.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                No{" "}
                {type === "revenue"
                    ? "revenue insights"
                    : "recommendations"}{" "}
                found.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <InsightCard
                    key={item.id}
                    insight={item}
                    type={insightType as any}
                    defaultExpanded={index === 0}
                />
            ))}
        </div>
    );
}