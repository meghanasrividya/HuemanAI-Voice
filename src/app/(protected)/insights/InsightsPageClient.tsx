"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Ban } from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";
import { useAuthStore, hasActionsOnlyRole } from "@/store/authStore";
import { callInsightsApi } from "@/lib/api/insights";
import InsightsHeader from "@/components/insights/InsightsHeader";
import InsightsDashboard from "@/components/insights/InsightsDashboard";
import { InsightsTab } from "@/components/insights/InsightsFilters";
import { CallReport, InsightReportData } from "@/components/insights/types";

type InsightCategory = "Reservation" | "Feedback";
type ViewingHistory = { start: string; end: string } | null;

export default function InsightsPageClient() {
    const { settings, isLoading } = useOrganisationSettings();
    const { user } = useAuthStore();
    const actionsOnly = hasActionsOnlyRole(user);

    const [category, setCategory] = useState<InsightCategory>("Reservation");
    const [activeTab, setActiveTab] = useState<InsightsTab>("revenue");
    const [historyOpen, setHistoryOpen] = useState(false);
    const [viewingHistory, setViewingHistory] = useState<ViewingHistory>(null);

    const [allReports, setAllReports] = useState<CallReport[]>([]);
    const [reportData, setReportData] = useState<InsightReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const requestIdRef = useRef(0);

    const FEEDBACK_AGENT_ID = "agent_1501kc625atje1y8t9p8fr4xy8m9";

    const agentId =
        category === "Reservation"
            ? settings?.insight_agent_ids?.reservation
            : (settings?.insight_agent_ids?.feedback ?? FEEDBACK_AGENT_ID);

    const categoryRef = useRef<"Reservation" | "Feedback">(category);
    categoryRef.current = category;

    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const loadLatestReport = useCallback(
        async (showLoading = true, targetAgentId?: string) => {
            const id = ++requestIdRef.current;

            if (!targetAgentId) {
                setReportData(null);
                setViewingHistory(null);
                setError(null);
                setAllReports([]);
                if (showLoading) setLoading(false);
                return false;
            }

            if (showLoading) setLoading(true);
            setError(null);

            try {
                const response = await callInsightsApi.getReports(targetAgentId, 50, categoryRef.current);
                if (id !== requestIdRef.current) return false;

                const valid = response.reports.filter((r) => r.report_data);

                if (valid.length > 0) {
                    const sorted = [...valid].sort(
                        (a, b) =>
                            new Date(b.period_end).getTime() -
                            new Date(a.period_end).getTime()
                    );
                    setAllReports(sorted);
                    setReportData(sorted[0].report_data);
                    setViewingHistory(null);
                    return true;
                }

                setReportData(null);
                setViewingHistory(null);
                setAllReports([]);
                return false;
            } catch (err) {
                console.error("Failed to load call insights:", err);
                setError("Failed to load call insights. Please try again.");
                setReportData(null);
                return false;
            } finally {
                if (showLoading && id === requestIdRef.current) setLoading(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useEffect(() => {
        if (!isLoading && settings?.enable_ai_insights !== false) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setActiveTab("revenue");
            setReportData(null);
            setViewingHistory(null);
            setError(null);
            setAllReports([]);
            loadLatestReport(true, agentId);
        }
    }, [category, agentId, loadLatestReport, isLoading, settings?.enable_ai_insights]);

    const startPolling = useCallback((reportId: string) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        let attempts = 0;
        pollingRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await callInsightsApi.getReport(reportId);
                if (res.status === "completed" && res.report) {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setReportData(res.report.report_data);
                    setViewingHistory(null);
                    setLoading(false);
                } else if (res.status === "failed") {
                    if (pollingRef.current) clearInterval(pollingRef.current);
                    setError(res.error ?? "Report generation failed.");
                    setLoading(false);
                }
            } catch { /* ignore */ }
            if (attempts >= 60) {
                if (pollingRef.current) clearInterval(pollingRef.current);
                setError("Report generation timed out.");
                setLoading(false);
            }
        }, 3000);
    }, []);

    const generateReport = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await callInsightsApi.generateReport({
                agentId,
                periodDays: 7,
                forceRegenerate: true,
            });
            if (res.status === "completed") {
                await loadLatestReport(false, agentId);
                return;
            }
            if (res.status === "no_agents") {
                setError("No voice agents are assigned to your account.");
                setLoading(false);
                return;
            }
            if (res.reportId) startPolling(res.reportId);
        } catch (err) {
            console.error("Failed to generate report:", err);
            setError("Failed to generate insights.");
            setLoading(false);
        }
    }, [agentId, loadLatestReport, startPolling]);

    const handleSelectHistory = useCallback(
        (report: InsightReportData, start: string, end: string) => {
            setReportData(report);
            setViewingHistory({ start, end });
            setActiveTab("revenue");
            setHistoryOpen(false);
        },
        []
    );

    const handleBackToLatest = useCallback(() => {
        setViewingHistory(null);
        if (allReports[0]) setReportData(allReports[0].report_data);
    }, [allReports]);

    if (actionsOnly) {
        return (
            <PageContainer>
                <div className="flex h-full items-center justify-center text-muted-foreground p-6">
                    Insights Disabled
                </div>
            </PageContainer>
        );
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-full w-full items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        );
    }

    if (settings?.enable_ai_insights === false) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center gap-4 text-center py-24">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 border border-zinc-700/40">
                        <Ban size={32} className="text-zinc-500" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">AI Insights Disabled</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            This feature has been disabled from the Admin Panel.
                        </p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <InsightsHeader
                category={category}
                onCategoryChange={(cat) => setCategory(cat)}
                allReports={allReports}
                historyOpen={historyOpen}
                onToggleHistory={() => setHistoryOpen((v) => !v)}
                viewingHistory={viewingHistory}
                onSelectHistory={handleSelectHistory}
                onBackToLatest={handleBackToLatest}
            />
            <div className="mt-6">
                <InsightsDashboard
                    reportData={reportData}
                    loading={loading}
                    error={error}
                    agentId={agentId}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    onGenerateReport={generateReport}
                    category={category}
                />
            </div>
        </PageContainer>
    );
}
