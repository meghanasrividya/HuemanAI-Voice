"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Ban, Layers, PhoneCall, Calendar, Activity, Award, Settings, LogOut, ChevronLeft, Menu, X } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";
import { useAuthStore, hasActionsOnlyRole } from "@/store/authStore";
import { callInsightsApi } from "@/lib/api/insights";
import InsightsHeader from "@/components/insights/InsightsHeader";
import InsightsDashboard from "@/components/insights/InsightsDashboard";
import { InsightsTab } from "@/components/insights/InsightsFilters";
import { CallReport, InsightReportData } from "@/components/insights/types";
import { cn } from "@/lib/utils";

type InsightCategory = "Reservation" | "Feedback";
type ViewingHistory = { start: string; end: string } | null;

const NetraStarIcon = () => (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#a855f7] text-[#a855f7]">
        <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
    </svg>
);

export default function InsightsPageClient() {
    const { settings, isLoading } = useOrganisationSettings();
    const { user, logout } = useAuthStore();
    const actionsOnly = hasActionsOnlyRole(user);
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = () => {
        logout();
        router.push("/login");
    };

    const [category, setCategory] = useState<InsightCategory>("Reservation");
    const [activeTab, setActiveTab] = useState<InsightsTab>("revenue");
    const [historyOpen, setHistoryOpen] = useState(false);
    const [viewingHistory, setViewingHistory] = useState<ViewingHistory>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [allReports, setAllReports] = useState<CallReport[]>([]);
    const [reportData, setReportData] = useState<InsightReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const requestIdRef = useRef(0);

    // Fallback feedback agent ID (used when not configured in org settings)
    const FEEDBACK_AGENT_ID = "agent_1501kc625atje1y8t9p8fr4xy8m9";

    const agentId =
        category === "Reservation"
            ? settings?.insight_agent_ids?.reservation
            : (settings?.insight_agent_ids?.feedback ?? FEEDBACK_AGENT_ID);

    // Always keep a fresh ref to category so loadLatestReport never reads a stale value
    const categoryRef = useRef<"Reservation" | "Feedback">(category);
    categoryRef.current = category; // update on every render, synchronously before effects

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    // Load latest report from API
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

                // API may not return status — treat any report with report_data as valid
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
        [] // categoryRef.current is always fresh — no stale closure
    );

    // Re-fetch when category/agentId changes
    useEffect(() => {
        if (!isLoading) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setActiveTab("revenue");
            setReportData(null);
            setViewingHistory(null);
            setError(null);
            setAllReports([]);
            loadLatestReport(true, agentId);
        }
    }, [category, agentId, loadLatestReport, isLoading]);

    // Poll for report in progress
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

    // Generate a new report
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

    // Select a historical report
    const handleSelectHistory = useCallback(
        (report: InsightReportData, start: string, end: string) => {
            setReportData(report);
            setViewingHistory({ start, end });
            setActiveTab("revenue");
            setHistoryOpen(false);
        },
        []
    );

    // Back to latest
    const handleBackToLatest = useCallback(() => {
        setViewingHistory(null);
        if (allReports[0]) setReportData(allReports[0].report_data);
    }, [allReports]);

    // ── Guard: actions-only role ──────────────────────────────────
    if (actionsOnly) {
        return (
            <PageContainer>
                <div className="flex h-full items-center justify-center text-muted-foreground p-6">
                    Insights Disabled
                </div>
            </PageContainer>
        );
    }

    // ── Guard: loading settings ───────────────────────────────────
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex h-full w-full items-center justify-center py-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </PageContainer>
        );
    }

    // ── Main page ─────────────────────────────────────────────────
    return (
        <PageContainer>
            <div
                className="flex flex-col h-screen text-white font-sans overflow-hidden select-none"
                style={{ backgroundColor: "#050505" }}
            >
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0c0c0e] border-b border-[#1e1e24] h-[52px] flex-shrink-0">
                    <span className="text-[21px] font-bold tracking-tight text-white select-none">
                        HuemanAI
                    </span>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <Menu size={22} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Backdrop overlay on mobile when sidebar is open */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* ================= LEFT SIDEBAR ================= */}
                    <aside
                        className={cn(
                            "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[#1e1e24] flex flex-col justify-between p-4 transition-transform duration-200 lg:static lg:translate-x-0 flex-shrink-0 h-full",
                            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                        style={{ backgroundColor: "#0c0c0e" }}
                    >
                        <div className="space-y-6">
                            {/* Logo */}
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-[21px] font-bold tracking-tight text-white select-none">
                                    HuemanAI
                                </span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="lg:hidden text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Navigation Options */}
                            <nav className="space-y-[6px]">
                                {[
                                    { name: "Dashboard", icon: <Layers size={17} />, href: "/dashboard" },
                                    { name: "Calls", icon: <PhoneCall size={17} />, href: "/calls" },
                                    { name: "Actions", icon: <Calendar size={17} />, href: "/actions" },
                                    { name: "Insights", icon: <Activity size={17} />, href: "/insights" },
                                    { name: "Outbound", icon: <PhoneCall size={17} />, href: "/outbound_campaign" },
                                    { name: "Reports", icon: <Award size={17} />, href: "/reports" },
                                ].map((item) => {
                                    const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                router.push(item.href);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-4.5 px-4.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all text-left ${
                                                active
                                                    ? "text-white font-bold"
                                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                            }`}
                                            style={active ? { backgroundColor: "#1d1d22" } : undefined}
                                        >
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </button>
                                    );
                                })}

                                {/* Special Netra AI item */}
                                <div className="px-4.5 py-3 flex flex-col gap-1">
                                    <div className="flex items-center gap-4.5 text-zinc-400">
                                        <NetraStarIcon />
                                        <span className="text-sm font-semibold tracking-wide">Netra AI</span>
                                    </div>
                                    <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase ml-[34px]">
                                        Coming Soon
                                    </span>
                                </div>

                                {/* Admin item */}
                                <button
                                    onClick={() => {
                                        router.push("/admin");
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4.5 px-4.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all text-left ${
                                        pathname === "/admin"
                                            ? "text-white font-bold"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                    }`}
                                    style={pathname === "/admin" ? { backgroundColor: "#1d1d22" } : undefined}
                                >
                                    <Settings size={17} />
                                    <span>Admin</span>
                                </button>
                            </nav>
                        </div>

                        {/* Profile and Logout */}
                        <div className="space-y-5 pt-5 border-t border-[#18181b]/60">
                            {/* User Details */}
                            <div className="flex items-center gap-3 px-2">
                                <div className="w-[38px] h-[38px] rounded-full bg-[#18181b] flex items-center justify-center text-sm font-extrabold text-zinc-300">
                                    {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[13px] font-bold text-white truncate">
                                        {user?.first_name || "User"}
                                    </p>
                                    <p className="text-[11px] text-zinc-500 truncate">
                                        {user?.email || ""}
                                    </p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>

                            {/* Sidebar Collapse */}
                            <div className="flex justify-start px-2 cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
                                <ChevronLeft size={18} />
                            </div>
                        </div>
                    </aside>

                    {/* ================= RIGHT WORKSPACE ================= */}
                    <div className="flex-grow flex flex-col overflow-hidden min-w-0">
                        {/* Header */}
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

                        {/* Dashboard content */}
                        <main className="flex-grow flex-1 min-w-0 overflow-auto">
                            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
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
                        </main>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
