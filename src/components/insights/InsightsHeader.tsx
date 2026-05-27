"use client";

import { History, FileDown, X, ChevronRight } from "lucide-react";
import { CallReport, InsightReportData } from "@/components/insights/types";
import {
    formatDateInTimezone,
    parseTimestampAsUtc,
    DEFAULT_DISPLAY_TIMEZONE,
} from "@/lib/date/dateUtils";

type InsightCategory = "Reservation" | "Feedback";

type ViewingHistory = { start: string; end: string } | null;

type Props = {
    category: InsightCategory;
    onCategoryChange: (cat: InsightCategory) => void;
    allReports: CallReport[];
    historyOpen: boolean;
    onToggleHistory: () => void;
    viewingHistory: ViewingHistory;
    onSelectHistory: (report: InsightReportData, start: string, end: string) => void;
    onBackToLatest: () => void;
};

function fmtDate(value: string) {
    return formatDateInTimezone(
        parseTimestampAsUtc(value),
        { day: "numeric", month: "short", year: "numeric" },
        DEFAULT_DISPLAY_TIMEZONE
    );
}

export default function InsightsHeader({
    category,
    onCategoryChange,
    allReports,
    historyOpen,
    onToggleHistory,
    viewingHistory,
    onSelectHistory,
    onBackToLatest,
}: Props) {
    return (
        <>
            {/* ── Top bar ── */}
            <div className="sticky top-0 z-10 border-b border-[#121216] bg-[#070709] h-[52px] flex items-center justify-between px-6 flex-shrink-0 relative">
                <div className="flex items-center gap-5">
                    <h1 className="text-[15px] font-bold text-white select-none">
                        Insights
                    </h1>
                </div>

                {/* Category toggle matching dashboard pill switcher, centered */}
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-zinc-800/80 p-0.5 rounded-full flex gap-0.5"
                    style={{ backgroundColor: "#0b0b0d" }}
                >
                    {(["Reservation", "Feedback"] as InsightCategory[]).map((item) => (
                        <button
                            key={item}
                            onClick={() => onCategoryChange(item)}
                            className={`text-[10px] font-bold px-4 py-1 rounded-full transition-all border cursor-pointer ${
                                category === item
                                    ? "bg-[#18181b] border-zinc-800 text-white shadow-sm"
                                    : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/60 border-transparent"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Right Utilities */}
                <div className="flex items-center gap-2">
                    {/* History button */}
                    {allReports.length > 1 && (
                        <button
                            onClick={onToggleHistory}
                            title="View report history"
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                                historyOpen
                                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                    : "border-zinc-900 bg-[#0a0a0c] text-zinc-300 hover:text-white hover:border-zinc-800"
                            }`}
                        >
                            <History className="h-4 w-4" />
                        </button>
                    )}

                    {/* Export PDF */}
                    <button
                        onClick={() => window.print()}
                        className="border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-800 transition-colors bg-[#0a0a0c]"
                    >
                        <FileDown size={12} />
                        <span>Export PDF</span>
                    </button>
                </div>
            </div>

            {/* ── Viewing past report banner ── */}
            {viewingHistory && (
                <div className="flex items-center justify-between border-b border-blue-500/20 bg-blue-500/10 px-6 py-2">
                    <p className="text-xs sm:text-sm font-medium text-blue-400">
                        Viewing Past Report:{" "}
                        {fmtDate(viewingHistory.start)} — {fmtDate(viewingHistory.end)}
                    </p>
                    <button
                        onClick={onBackToLatest}
                        className="ml-3 shrink-0 text-xs text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors"
                    >
                        Back to latest
                    </button>
                </div>
            )}

            {/* ── History sidebar (below header, overlaid) ── */}
            {historyOpen && allReports.length > 1 && (
                <div className="absolute right-6 top-14 z-20 border border-zinc-900 rounded-xl bg-[#0b0b0d] shadow-xl w-72 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                            Report History
                        </span>
                        <button
                            onClick={onToggleHistory}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-1">
                        {allReports.map((report, i) => {
                            const isActive =
                                viewingHistory?.start === report.period_start &&
                                viewingHistory?.end === report.period_end;
                            return (
                                <li key={report.id}>
                                    <button
                                        onClick={() =>
                                            onSelectHistory(
                                                report.report_data,
                                                report.period_start,
                                                report.period_end
                                            )
                                        }
                                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left transition-colors ${
                                            isActive
                                                ? "bg-zinc-900/60 text-white"
                                                : "text-zinc-400 hover:bg-zinc-900/30 hover:text-white"
                                        }`}
                                    >
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">
                                                {fmtDate(report.period_start)} — {fmtDate(report.period_end)}
                                            </p>
                                            {i === 0 && (
                                                <span className="text-[9px] font-extrabold text-[#10b981] tracking-wider uppercase block mt-0.5">
                                                    Latest
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50 text-zinc-500" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </>
    );
}
