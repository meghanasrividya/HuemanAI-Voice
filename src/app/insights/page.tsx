"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import PageContainer from "@/components/layout/PageContainer";

import {
    Loader2,
    AlertCircle,
    Ban,
    Phone,
} from "lucide-react";

import {
    useOrganisationSettings,
} from "@/hooks/useOrganisationSettings";

import {
    useAuthStore,
    hasActionsOnlyRole,
} from "@/store/authStore";

import {
    callInsightsApi,
} from "@/lib/api/insights";

import ExecutiveSummaryCard from "@/components/insights/calls/ExecutiveSummaryCard";

import StatsRow from "@/components/insights/calls/StatsRow";

import InsightsTabNavigation from "@/components/insights/calls/InsightsTabNavigation";

import InsightsList from "@/components/insights/calls/InsightsList";

import CallPatternsSection from "@/components/insights/calls/CallPatternsSection";

import InsightsEmptyState from "@/components/insights/calls/InsightsEmptyState";

import {
    formatDateInTimezone,
    parseTimestampAsUtc,
    DEFAULT_DISPLAY_TIMEZONE,
} from "@/lib/date/dateUtils";

type InsightCategory =
    | "Reservation"
    | "Feedback";

export default function InsightsPage() {
    const {
        settings,
        isLoading,
    } =
        useOrganisationSettings();

    const { user } =
        useAuthStore();

    const actionsOnly =
        hasActionsOnlyRole(user);

    const [category, setCategory] =
        useState<InsightCategory>(
            "Reservation"
        );

    const pollingRef =
        useRef<NodeJS.Timeout | null>(
            null
        );

    const requestIdRef =
        useRef(0);

    const [reportData, setReportData] =
        useState<any>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [activeTab, setActiveTab] =
        useState("revenue");

    const [
        historyOpen,
        setHistoryOpen,
    ] = useState(false);

    const [
        viewingHistory,
        setViewingHistory,
    ] = useState<any>(null);

    const agentId =
        category === "Reservation"
            ? settings?.insight_agent_ids
                ?.reservation
            : settings?.insight_agent_ids
                ?.feedback;

    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(
                    pollingRef.current
                );
            }
        };
    }, []);

    const loadLatestReport =
        useCallback(
            async (
                showLoading = true,
                targetAgentId?: string
            ) => {
                const requestId =
                    ++requestIdRef.current;

                if (!targetAgentId) {
                    setReportData(null);
                    setViewingHistory(null);
                    setError(null);

                    if (showLoading) {
                        setLoading(false);
                    }

                    return false;
                }

                if (showLoading) {
                    setLoading(true);
                }

                setError(null);

                try {
                    const response =
                        await callInsightsApi.getReports(
                            targetAgentId,
                            50
                        );

                    if (
                        requestId !==
                        requestIdRef.current
                    ) {
                        return false;
                    }

                    const reports =
                        response.reports.filter(
                            (r: any) =>
                                r.status ===
                                "completed" &&
                                r.report_data
                        );

                    if (
                        reports.length > 0
                    ) {
                        const latest =
                            reports.sort(
                                (
                                    a: any,
                                    b: any
                                ) =>
                                    new Date(
                                        b.period_end
                                    ).getTime() -
                                    new Date(
                                        a.period_end
                                    ).getTime()
                            )[0];

                        setReportData(
                            latest.report_data
                        );

                        setViewingHistory(
                            null
                        );

                        return true;
                    }

                    setReportData(null);
                    setViewingHistory(null);

                    return false;
                } catch (err) {
                    console.error(
                        "Failed to fetch call reports:",
                        err
                    );

                    setError(
                        "Failed to load call insights."
                    );

                    setReportData(null);

                    return false;
                } finally {
                    if (
                        showLoading &&
                        requestId ===
                        requestIdRef.current
                    ) {
                        setLoading(false);
                    }
                }
            },
            []
        );

    useEffect(() => {
        if (
            !isLoading &&
            settings?.enable_ai_insights
        ) {
            if (pollingRef.current) {
                clearInterval(
                    pollingRef.current
                );
            }

            setActiveTab(
                "revenue"
            );

            setReportData(null);
            setViewingHistory(null);
            setError(null);

            loadLatestReport(
                true,
                agentId
            );
        }
    }, [
        category,
        agentId,
        loadLatestReport,
        isLoading,
        settings?.enable_ai_insights,
    ]);

    const startPolling =
        useCallback(
            (reportId: string) => {
                if (
                    pollingRef.current
                ) {
                    clearInterval(
                        pollingRef.current
                    );
                }

                let attempts = 0;

                pollingRef.current =
                    setInterval(
                        async () => {
                            attempts++;

                            try {
                                const response =
                                    await callInsightsApi.getReport(
                                        reportId
                                    );

                                if (
                                    response.status ===
                                    "completed" &&
                                    response.report
                                ) {
                                    if (
                                        pollingRef.current
                                    ) {
                                        clearInterval(
                                            pollingRef.current
                                        );
                                    }

                                    setReportData(
                                        response.report
                                            .report_data
                                    );

                                    setViewingHistory(
                                        null
                                    );

                                    setLoading(
                                        false
                                    );
                                } else if (
                                    response.status ===
                                    "failed"
                                ) {
                                    if (
                                        pollingRef.current
                                    ) {
                                        clearInterval(
                                            pollingRef.current
                                        );
                                    }

                                    setError(
                                        response.error ||
                                        "Report generation failed."
                                    );

                                    setLoading(
                                        false
                                    );
                                }
                            } catch {}

                            if (
                                attempts >= 60
                            ) {
                                if (
                                    pollingRef.current
                                ) {
                                    clearInterval(
                                        pollingRef.current
                                    );
                                }

                                setError(
                                    "Report generation timed out."
                                );

                                setLoading(
                                    false
                                );
                            }
                        },
                        3000
                    );
            },
            []
        );

    const generateReport =
        useCallback(
            async () => {
                setLoading(true);

                setError(null);

                try {
                    const response =
                        await callInsightsApi.generateReport(
                            {
                                agentId,
                                periodDays: 7,
                                forceRegenerate: true,
                            }
                        );

                    if (
                        response.status ===
                        "completed"
                    ) {
                        await loadLatestReport(
                            false,
                            agentId
                        );

                        return;
                    }

                    if (
                        response.status ===
                        "no_agents"
                    ) {
                        setError(
                            "No voice agents are assigned to your account."
                        );

                        setLoading(
                            false
                        );

                        return;
                    }

                    startPolling(
                        response.reportId
                    );
                } catch (err) {
                    console.error(
                        "Failed to generate report:",
                        err
                    );

                    setError(
                        "Failed to generate insights."
                    );

                    setLoading(false);
                }
            },
            [
                agentId,
                loadLatestReport,
                startPolling,
            ]
        );

    const handleSelectHistory =
        useCallback(
            (
                report: any,
                start: string,
                end: string
            ) => {
                setReportData(report);

                setViewingHistory({
                    start,
                    end,
                });

                setActiveTab(
                    "revenue"
                );
            },
            []
        );

    if (actionsOnly) {
        return (
            <PageContainer>
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    Insights Disabled
                </div>
            </PageContainer>
        );
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        );
    }

    if (
        !settings?.enable_ai_insights
    ) {
        return (
            <PageContainer>
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
                    <div className="rounded-full bg-muted p-4">
                        <Ban className="h-12 w-12" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                            AI Insights Disabled
                        </h2>

                        <p>
                            This feature has
                            been disabled from
                            the Admin Panel.
                        </p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="flex flex-col min-h-full">
                <div className="sticky top-0 z-10 border-b border-border bg-background">
                    <div className="flex h-16 items-center justify-between gap-4 px-6">
                        <h1 className="text-xl font-semibold tracking-tight">
                            Insights
                        </h1>

                        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1">
                            {[
                                "Reservation",
                                "Feedback",
                            ].map((item) => (
                                <button
                                    key={item}
                                    onClick={() =>
                                        setCategory(
                                            item as InsightCategory
                                        )
                                    }
                                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
                                        category === item
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 p-6 max-w-[1600px] mx-auto w-full lg:px-10 py-8">
                    {viewingHistory &&
                        !loading &&
                        reportData && (
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg flex items-center justify-between mb-6">
                                <div className="text-sm font-medium">
                                    Viewing Past
                                    Report:{" "}
                                    {formatDateInTimezone(
                                        parseTimestampAsUtc(
                                            viewingHistory.start
                                        ),
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                        DEFAULT_DISPLAY_TIMEZONE
                                    )}{" "}
                                    -{" "}
                                    {formatDateInTimezone(
                                        parseTimestampAsUtc(
                                            viewingHistory.end
                                        ),
                                        {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        },
                                        DEFAULT_DISPLAY_TIMEZONE
                                    )}
                                </div>
                            </div>
                        )}

                    {loading ? (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-3 animate-pulse">
                            <Phone className="h-10 w-10 opacity-50" />

                            <p className="text-lg font-medium">
                                Loading insights...
                            </p>

                            <p className="text-sm">
                                Fetching the latest
                                analysis from the
                                server.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-3">
                            <AlertCircle className="h-10 w-10 opacity-50 text-red-400" />

                            <p className="text-lg font-medium">
                                Error
                            </p>

                            <p className="text-sm">
                                {error}
                            </p>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            <ExecutiveSummaryCard
                                criticalFinding={
                                    reportData
                                        .executiveSummary
                                        .criticalFinding
                                }
                                revenueImpact={
                                    reportData
                                        .executiveSummary
                                        .revenueImpact
                                }
                                immediateAction={
                                    reportData
                                        .executiveSummary
                                        .immediateAction
                                }
                                periodStart={
                                    reportData
                                        .metadata
                                        .periodStart
                                }
                                periodEnd={
                                    reportData
                                        .metadata
                                        .periodEnd
                                }
                            />

                            <StatsRow
                                stats={
                                    reportData.statistics
                                }
                                botName={
                                    reportData.metadata
                                        .botName
                                }
                            />

                            <InsightsTabNavigation
                                activeTab={
                                    activeTab
                                }
                                onTabChange={
                                    setActiveTab
                                }
                                revenueCount={
                                    reportData
                                        .revenueInsights
                                        .length
                                }
                                recommendationCount={
                                    reportData.strategicRecommendations.filter(
                                        (
                                            item: any
                                        ) =>
                                            !item.basedOn?.some(
                                                (
                                                    x: string
                                                ) =>
                                                    x.startsWith(
                                                        "BP-"
                                                    )
                                            )
                                    ).length
                                }
                            />

                            <InsightsList
                                type={activeTab}
                                revenueInsights={
                                    reportData.revenueInsights
                                }
                                botIssues={
                                    reportData.botPerformanceIssues
                                }
                                recommendations={
                                    reportData.strategicRecommendations
                                }
                            />

                            <CallPatternsSection
                                patterns={
                                    reportData.callPatterns
                                }
                            />
                        </div>
                    ) : agentId ? (
                        <InsightsEmptyState
                            onRunNow={
                                generateReport
                            }
                        />
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center text-muted-foreground gap-3">
                            <p className="text-lg font-medium">
                                No {category} insights
                                for now
                            </p>

                            <p className="text-sm text-center max-w-md">
                                We couldn't find a
                                mapped{" "}
                                {category.toLowerCase()}{" "}
                                insights agent for
                                your account yet.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
}