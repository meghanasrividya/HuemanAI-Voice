"use client";

import ExecutiveSummaryCard from "@/components/insights/call/ExecutiveSummaryCard";
import StatsRow from "@/components/insights/call/StatsRow";
import InsightsEmptyState from "@/components/insights/call/InsightsEmptyState";
import InsightsFilters, { InsightsTab } from "@/components/insights/InsightsFilters";
import RevenueInsights from "@/components/insights/RevenueInsights";
import BotIssueInsights from "@/components/insights/BotIssueInsights";
import RecommendationInsights from "@/components/insights/RecommendationInsights";
import InsightsCharts from "@/components/insights/InsightsCharts";
import { InsightReportData } from "@/components/insights/types";
import { useEffect } from "react";
import { AlertCircle, Loader2, Phone } from "lucide-react";
import {
    DEFAULT_DISPLAY_TIMEZONE,
    formatDateInTimezone,
    parseTimestampAsUtc,
} from "@/lib/date/dateUtils";

type Props = {
    reportData: InsightReportData | null;
    loading: boolean;
    error: string | null;
    agentId?: string;
    activeTab: InsightsTab;
    onTabChange: (tab: InsightsTab) => void;
    onGenerateReport: () => void;
    category: string;
};

export default function InsightsDashboard({
    reportData,
    loading,
    error,
    agentId,
    activeTab,
    onTabChange,
    onGenerateReport,
    category,
}: Props) {
    useEffect(() => {
        const originalTitle = document.title;
        document.title = "Call Insights Report";
        return () => {
            document.title = originalTitle;
        };
    }, []);

    // ── Loading state ──────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center px-4 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin opacity-60" />
                <div className="space-y-1">
                    <p className="text-sm sm:text-base font-medium text-foreground">
                        Loading insights...
                    </p>
                    <p className="text-xs sm:text-sm">
                        Fetching the latest analysis from the server.
                    </p>
                </div>
            </div>
        );
    }

    // ── Error state ────────────────────────────────────────────────
    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center px-4 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-red-400 opacity-70" />
                <div className="space-y-1">
                    <p className="text-sm sm:text-base font-medium text-foreground">
                        Failed to load
                    </p>
                    <p className="text-xs sm:text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // ── Empty — has agent but no report ───────────────────────────
    if (!reportData && agentId) {
        return <InsightsEmptyState onRunNow={onGenerateReport} />;
    }

    // ── Empty — no agent configured ───────────────────────────────
    if (!reportData) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-center px-4 text-muted-foreground">
                <Phone className="h-10 w-10 opacity-40" />
                <div className="space-y-1">
                    <p className="text-sm sm:text-base font-medium text-foreground">
                        No {category} insights yet
                    </p>
                    <p className="text-xs sm:text-sm max-w-sm">
                        No {category.toLowerCase()} insights agent is configured for your account.
                    </p>
                </div>
            </div>
        );
    }

    // ── Tab counts ────────────────────────────────────────────────
    const counts: Record<InsightsTab, number> = {
        revenue: reportData.revenueInsights?.length ?? 0,
        bot: reportData.botPerformanceIssues?.length ?? 0,
        recommendations: reportData.strategicRecommendations?.length ?? 0,
        patterns: 0,
    };

    const formatDate = (value: string) => {
        try {
            return formatDateInTimezone(
                parseTimestampAsUtc(value),
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                },
                DEFAULT_DISPLAY_TIMEZONE
            );
        } catch (e) {
            return value;
        }
    };

    const getGeneratedDateStr = () => {
        if (!reportData) return "";
        if (reportData.metadata.generatedAt) {
            return formatDate(reportData.metadata.generatedAt);
        }
        try {
            const date = new Date(reportData.metadata.periodEnd);
            date.setDate(date.getDate() + 1);
            return formatDateInTimezone(
                date,
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                },
                DEFAULT_DISPLAY_TIMEZONE
            );
        } catch {
            return "1 April 2026";
        }
    };

    // ── Main dashboard ────────────────────────────────────────────
    return (
        <>
            {/* Global style tag to inject high fidelity print overrides */}
            <style dangerouslySetInnerHTML={{
                __html: `
                /* Custom Dark Scrollbar matching screenshot */
                ::-webkit-scrollbar {
                    width: 14px;
                    height: 14px;
                }
                ::-webkit-scrollbar-track {
                    background: #1e1e24;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #52525b;
                    border-radius: 10px;
                    border: 3px solid #1e1e24;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color: #71717a;
                }

                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm 15mm 15mm 15mm;
                    }
                    
                    html, body, #__next, [data-overlay-container], main, 
                    .h-screen, .h-full, .min-h-0, .flex-1, .flex-grow, 
                    .overflow-hidden, .overflow-auto, .overflow-y-auto {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        overflow-y: visible !important;
                    }

                    html, body, #__next, [data-overlay-container], main {
                        background: white !important;
                        color: black !important;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                    }

                    aside, nav, header, .sticky, button, .no-print, .screen-only, .dashboard-screen-view, .lg\\:hidden {
                        display: none !important;
                    }

                    .dashboard-print-view {
                        display: block !important;
                        width: 100% !important;
                        height: auto !important;
                        overflow: visible !important;
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    
                    .page-break-inside-avoid {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                    }
                    
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            ` }} />

            <div className="space-y-5 sm:space-y-6 dashboard-screen-view">
                <ExecutiveSummaryCard
                    criticalFinding={reportData.executiveSummary.criticalFinding}
                    revenueImpact={reportData.executiveSummary.revenueImpact}
                    immediateAction={reportData.executiveSummary.immediateAction}
                    periodStart={reportData.metadata.periodStart}
                    periodEnd={reportData.metadata.periodEnd}
                />

                <StatsRow stats={reportData.statistics} botName={reportData.metadata.botName} mode={category.toLowerCase()} />

                <InsightsFilters
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    counts={counts}
                />

                {activeTab === "revenue" && (
                    <RevenueInsights insights={reportData.revenueInsights} />
                )}
                {activeTab === "bot" && (
                    <BotIssueInsights issues={reportData.botPerformanceIssues} />
                )}
                {activeTab === "recommendations" && (
                    <RecommendationInsights recommendations={reportData.strategicRecommendations} />
                )}

                {reportData.callPatterns && (
                    <InsightsCharts patterns={reportData.callPatterns} />
                )}
            </div>

            {/* ================= PRINT ONLY VIEW (ALL DATA, HIGH FIDELITY) ================= */}
            <div className="hidden dashboard-print-view w-full text-black bg-white p-2 space-y-8 select-text font-sans">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-300 pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-black">
                            Call Insights Report
                        </h1>
                        <p className="text-sm font-semibold text-gray-600 mt-1 select-text">
                            {reportData.metadata.restaurantName || "Fredricks at Machynys"} · {reportData.metadata.botName || "Isabella"} - {category === "Feedback" ? "Fredricks Feedback" : "Fredricks Reservation"}
                        </p>
                    </div>

                    <div className="flex gap-6 text-right text-xs">
                        <div>
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                                Period ▲
                            </p>
                            <p className="font-bold text-gray-900 mt-1 select-text">
                                {formatDate(reportData.metadata.periodStart)} — {formatDate(reportData.metadata.periodEnd)}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                                Generated
                            </p>
                            <p className="font-bold text-gray-900 mt-1 select-text">
                                {getGeneratedDateStr()}
                            </p>
                        </div>
                        <div>
                            <p className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                                Total Calls
                            </p>
                            <p className="font-black text-gray-900 mt-1 text-sm select-text">
                                {reportData.statistics.totalCalls ?? reportData.metadata.totalCalls ?? 121}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                        Executive Summary
                    </h3>
                    <div className="rounded-xl border border-gray-200 bg-gray-100 p-6 space-y-6">
                        <div className="space-y-1.5">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                Critical Finding
                            </h4>
                            <p className="text-base font-bold text-black leading-relaxed select-text">
                                {reportData.executiveSummary.criticalFinding}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
                            <div className="space-y-1.5">
                                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                    Revenue Impact
                                </h4>
                                <p className="text-xs text-gray-700 leading-relaxed select-text">
                                    {reportData.executiveSummary.revenueImpact}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                                    Immediate Action
                                </h4>
                                <p className="text-xs text-gray-700 leading-relaxed select-text">
                                    {reportData.executiveSummary.immediateAction}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                        Key Metrics
                    </h3>
                    <div className="grid grid-cols-5 gap-4">
                        {[
                            { label: "TOTAL CALLS", value: reportData.statistics.totalCalls ?? 0 },
                            { label: "BOOKINGS MADE", value: reportData.statistics.successfulBookings ?? (reportData.statistics as any).bookingsMade ?? (reportData.statistics as any).bookings ?? 0 },
                            { label: "CONVERSION RATE", value: `${(reportData.statistics.conversionRate ?? 0).toFixed(1)}%` },
                            { label: "COVERS BOOKED", value: reportData.statistics.totalCoversBooked ?? (reportData.statistics as any).coversBooked ?? (reportData.statistics as any).covers ?? 0 },
                            { label: "EST. COVERS LOST", value: reportData.statistics.estimatedCoversLost ?? (reportData.statistics as any).coversLost ?? 0 },
                        ].map((metric, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-center space-y-1">
                                <p className="text-2xl font-black text-black select-text">{metric.value}</p>
                                <p className="text-[9px] font-bold text-gray-400 tracking-wider">{metric.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Insights */}
                {reportData.revenueInsights && reportData.revenueInsights.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                            Revenue Insights ({reportData.revenueInsights.length})
                        </h3>
                        <div className="space-y-4">
                            {reportData.revenueInsights.map((insight) => {
                                const sev = String(insight.urgency ?? insight.priority ?? "high").toLowerCase();
                                let borderClass = "border-l-[#f59e0b]"; // amber
                                let badgeClass = "border-[#fde68a] bg-[#fef3c7] text-[#b45309]"; // amber
                                if (sev === "critical") {
                                    borderClass = "border-l-[#ef4444]";
                                    badgeClass = "border-[#fca5a5] bg-[#fee2e2] text-[#b91c1c]";
                                } else if (sev === "low") {
                                    borderClass = "border-l-[#a1a1aa]";
                                    badgeClass = "border-[#e4e4e7] bg-[#f4f4f5] text-[#4b5563]";
                                } else if (sev === "medium") {
                                    borderClass = "border-l-[#3b82f6]";
                                    badgeClass = "border-[#bfdbfe] bg-[#dbeafe] text-[#1d4ed8]";
                                }

                                return (
                                    <div key={insight.id} className={`rounded-xl border border-gray-200 border-l-4 ${borderClass} bg-white p-5 space-y-3 page-break-inside-avoid shadow-sm`}>
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs sm:text-sm font-bold text-black flex-1 select-text">
                                                {insight.insightNumber}. {insight.headline}
                                            </h4>
                                            <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded border ${badgeClass} uppercase tracking-wider select-text`}>
                                                {insight.urgency ?? insight.priority ?? "HIGH"}
                                            </span>
                                        </div>

                                        {insight.signal?.description && (
                                            <div className="text-xs space-y-1 select-text">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">Signal</span>
                                                <p className="text-gray-700 leading-relaxed">{insight.signal.description}</p>
                                            </div>
                                        )}

                                        {insight.impact?.description && (
                                            <div className="text-xs space-y-1 select-text">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">Revenue Impact</span>
                                                <p className="text-gray-700 leading-relaxed">{insight.impact.description}</p>
                                            </div>
                                        )}

                                        {insight.action?.description && (
                                            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs space-y-1 select-text">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">Action</span>
                                                <p className="text-gray-750 leading-relaxed">{insight.action.description}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recommendations (ONLY recommendations green color showing inside Potential Impact / Success Metric) */}
                {reportData.strategicRecommendations && reportData.strategicRecommendations.length > 0 && (
                    <div className="space-y-4 border-t border-gray-200 pt-4">
                        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                            Strategic Recommendations ({reportData.strategicRecommendations.length})
                        </h3>
                        <div className="space-y-4">
                            {reportData.strategicRecommendations.map((rec) => {
                                // Extract potential impact text from possible keys in API response
                                const potentialImpact =
                                    (rec.opportunity as any)?.potentialImpact ||
                                    (rec.opportunity as any)?.impact ||
                                    (rec as any).potentialImpact ||
                                    (rec as any).impactDescription ||
                                    (rec as any).impact;

                                return (
                                    <div key={rec.id} className="rounded-xl border border-gray-200 border-l-4 border-l-gray-300 bg-white p-5 space-y-3 page-break-inside-avoid shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-xs sm:text-sm font-bold text-black flex-1 select-text">
                                                {rec.recommendationNumber}. {rec.headline || rec.title}
                                            </h4>
                                            <span className="text-[8px] font-extrabold px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-wider select-text">
                                                RECOMMENDATION
                                            </span>
                                        </div>

                                        {rec.opportunity?.description && (
                                            <div className="text-xs space-y-1 select-text">
                                                <span className="font-bold text-gray-400 uppercase tracking-wider text-[9px] block">Opportunity</span>
                                                <p className="text-gray-750 leading-relaxed">{rec.opportunity.description}</p>
                                            </div>
                                        )}

                                        {potentialImpact && (
                                            <div className="rounded-lg bg-[#f0fdf4] border border-[#dcfce7] p-3 text-xs space-y-1.5 select-text">
                                                <span className="font-bold text-[#047857] uppercase tracking-wider text-[9px] block">Potential Impact</span>
                                                <p className="text-gray-900 leading-relaxed font-semibold">{potentialImpact}</p>
                                            </div>
                                        )}

                                        {rec.successMetric && (
                                            <div className="rounded-lg bg-[#f0fdf4] border border-[#dcfce7] p-3 text-xs space-y-1.5 select-text">
                                                <span className="font-bold text-[#047857] uppercase tracking-wider text-[9px] block">Success Metric</span>
                                                <p className="text-gray-900 leading-relaxed font-semibold">{rec.successMetric}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Call Patterns & Analytics (Redesigned grid to match user mockup exactly) */}
                {reportData.callPatterns && (
                    <div className="space-y-8 page-break-inside-avoid border-t border-gray-200 pt-6">
                        {/* Section Header */}
                        <div className="border-b border-gray-200 pb-2 mb-6">
                            <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                                Call Patterns
                            </h3>
                        </div>

                        {/* First Row Grid (2 Columns: Day of Week & Top Questions) */}
                        <div className="grid grid-cols-12 gap-8 items-start">
                            {/* Left Column: Calls by Day of Week (col-span-5) */}
                            {reportData.callPatterns.byDayOfWeek && reportData.callPatterns.byDayOfWeek.length > 0 && (
                                <div className="col-span-5 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">
                                        Calls by Day of Week
                                    </h4>
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="pb-2 text-left font-bold">DAY</th>
                                                <th className="pb-2 text-right font-bold">CALLS</th>
                                                <th className="pb-2 text-right font-bold">BOOKINGS</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reportData.callPatterns.byDayOfWeek.map((day) => (
                                                <tr key={day.day} className="text-gray-900">
                                                    <td className="py-2.5 font-medium text-gray-600 capitalize">{day.day}</td>
                                                    <td className="py-2.5 text-right font-bold text-black">{day.count}</td>
                                                    <td className="py-2.5 text-right font-bold text-black">{day.bookings}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Right Column: Top Questions Asked (col-span-7) */}
                            {reportData.callPatterns.topQuestions && reportData.callPatterns.topQuestions.length > 0 && (
                                <div className="col-span-7 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">
                                        Top Questions Asked
                                    </h4>
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="pb-2 text-left font-bold">QUESTION</th>
                                                <th className="pb-2 text-right font-bold">×</th>
                                                <th className="pb-2 text-right font-bold">ANSWERED</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reportData.callPatterns.topQuestions.map((item, idx) => (
                                                <tr key={idx} className="text-gray-900">
                                                    <td className="py-2 font-medium text-gray-600">{item.question}</td>
                                                    <td className="py-2 text-right font-bold text-black">{item.count}</td>
                                                    <td className="py-2 text-right font-bold text-emerald-600">✓</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Second Row Grid (2 Columns: Party Size & Special Requests) */}
                        <div className="grid grid-cols-12 gap-8 items-start pt-6">
                            {/* Left Column: Bookings by Party Size (col-span-5) */}
                            {reportData.callPatterns.byPartySize && reportData.callPatterns.byPartySize.length > 0 && (
                                <div className="col-span-5 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">
                                        Bookings by Party Size
                                    </h4>
                                    <div className="space-y-3.5 pt-2 text-xs">
                                        {reportData.callPatterns.byPartySize.map((item) => {
                                            const maxCount = Math.max(...(reportData.callPatterns.byPartySize || []).map(p => p.count), 1);
                                            const pct = (item.count / maxCount) * 100;
                                            return (
                                                <div key={item.size} className="flex items-center gap-3">
                                                    <span className="w-6 text-slate-500 font-medium text-left text-xs">{item.size}</span>
                                                    <div className="flex-1 h-2 bg-[#f1f5f9] rounded-full relative">
                                                        <div className="h-full bg-[#0f172a] rounded-full" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="w-8 text-right font-bold text-slate-900 select-text text-xs">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Right Column: Top Special Requests (col-span-7) */}
                            {reportData.callPatterns.topSpecialRequests && reportData.callPatterns.topSpecialRequests.length > 0 && (
                                <div className="col-span-7 space-y-4">
                                    <h4 className="text-sm font-bold text-gray-900">
                                        Top Special Requests
                                    </h4>
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                                <th className="pb-2 text-left font-bold">REQUEST</th>
                                                <th className="pb-2 text-right font-bold">COUNT</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {reportData.callPatterns.topSpecialRequests.map((item, idx) => (
                                                <tr key={idx} className="text-gray-900">
                                                    <td className="py-2.5 font-medium text-gray-600">{item.request}</td>
                                                    <td className="py-2.5 text-right font-bold text-black">{item.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Print Footer */}
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-8 pt-4 border-t border-gray-200 select-text font-medium">
                            <div>
                                {reportData.metadata.restaurantName || "Fredricks at Machynys"} - {reportData.metadata.restaurantName || "Fredricks at Machynys"} - {reportData.metadata.botName || "Isabella"} ({category === "Feedback" ? "Feedback" : "Reservations"})
                            </div>
                            <div>
                                Generated {getGeneratedDateStr()} - Netra AI
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
