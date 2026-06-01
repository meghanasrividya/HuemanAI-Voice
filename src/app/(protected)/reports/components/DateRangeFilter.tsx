import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { ReportMetadata } from "@/lib/api/reports";

type DateRangeFilterProps = {
    metadata: ReportMetadata | null;
    dateField: string;
    setDateField: (val: string) => void;
    dateRangeType: "7days" | "30days" | "month" | "custom" | null;
    setDateRangeType: (val: "7days" | "30days" | "month" | "custom" | null) => void;
    customStartDate: string;
    setCustomStartDate: (val: string) => void;
    customEndDate: string;
    setCustomEndDate: (val: string) => void;
    setPage: (val: number) => void;
    theme: "amber" | "emerald" | "blue" | "purple";
    showDropdown: boolean;
};

export default function DateRangeFilter({
    metadata,
    dateField,
    setDateField,
    dateRangeType,
    setDateRangeType,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    setPage,
    theme,
    showDropdown,
}: DateRangeFilterProps) {
    const isAmber = theme === "amber";
    const isBlue = theme === "blue";
    const isPurple = theme === "purple";

    const labelColor = isAmber
        ? "text-[#f59e0b]"
        : isBlue
            ? "text-[#2563eb]"
            : isPurple
                ? "text-[#b158ff]"
                : "text-[#10b981]";
    const activeButtonClass = isAmber
        ? "bg-[#251b14] border border-[#f59e0b]/50 text-white font-extrabold"
        : isBlue
            ? "bg-[#0f1b35] border border-[#2563eb]/50 text-white font-extrabold"
            : isPurple
                ? "bg-[#210d33] border border-[#b158ff]/50 text-white font-extrabold"
                : "bg-[#0c2c1e] border border-[#10b981]/50 text-white font-extrabold";
    const selectFocusClass = isAmber
        ? "focus:border-amber-500/50"
        : isBlue
            ? "focus:border-blue-500/50"
            : isPurple
                ? "focus:border-[#b158ff]/50"
                : "focus:border-emerald-500/50";
    const inputFocusClass = isAmber
        ? "focus:border-amber-500/50"
        : isBlue
            ? "focus:border-blue-500/50"
            : isPurple
                ? "focus:border-[#b158ff]/50"
                : "focus:border-emerald-500/50";

    return (
        <div className="mb-6 pb-6 border-b border-[#161616]">
            <div className={`flex items-center gap-1.5 text-[9px] font-bold ${labelColor} tracking-wider uppercase mb-3`}>
                <Calendar size={11} />
                <span>Date Range</span>
            </div>

            {/* Date field picker dropdown (only shown if configured) */}
            {showDropdown && metadata?.dateColumns && (
                <div className="mb-3 relative">
                    <select
                        value={dateField}
                        onChange={(e) => {
                            setDateField(e.target.value);
                            setPage(1);
                        }}
                        className={`w-full bg-[#161616] border border-[#232323] rounded-[8px] text-[11px] p-2.5 text-zinc-300 font-semibold focus:outline-none ${selectFocusClass} appearance-none cursor-pointer`}
                    >
                        {metadata.dateColumns.map((colKey: string) => (
                            <option key={colKey} value={colKey}>
                                {metadata.columns[colKey]?.label || colKey}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-3.5 text-zinc-500">
                        <ChevronRight size={12} className="rotate-90" />
                    </div>
                </div>
            )}

            {/* Preset Buttons Grid */}
            <div className="grid grid-cols-2 gap-2">
                {[
                    { id: "7days", label: "Last 7 days" },
                    { id: "30days", label: "Last 30 days" },
                    { id: "month", label: "This Month" },
                    { id: "custom", label: "Custom" },
                ].map((btn) => {
                    const active = dateRangeType === btn.id;
                    return (
                        <button
                            key={btn.id}
                            onClick={() => {
                                setDateRangeType(btn.id as any);
                                setPage(1);
                            }}
                            className={`py-2 px-3 text-[10px] font-bold rounded-[8px] text-center transition-all ${active
                                    ? activeButtonClass
                                    : "bg-[#111111] border border-[#232323] text-zinc-400 hover:text-zinc-200 hover:border-[#333]"
                                }`}
                        >
                            {btn.label}
                        </button>
                    );
                })}
            </div>

            {/* Custom date range inputs */}
            {dateRangeType === "custom" && (
                <>
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#1a1a1a]/50">
                        <div>
                            <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">FROM</label>
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => {
                                    setCustomStartDate(e.target.value);
                                    setPage(1);
                                }}
                                className={`w-full bg-[#161616] border border-[#232323] rounded-full text-[10px] px-4 py-2 text-white focus:outline-none ${inputFocusClass} cursor-pointer`}
                            />
                        </div>
                        <div>
                            <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">TO</label>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => {
                                    setCustomEndDate(e.target.value);
                                    setPage(1);
                                }}
                                className={`w-full bg-[#161616] border border-[#232323] rounded-full text-[10px] px-4 py-2 text-white focus:outline-none ${inputFocusClass} cursor-pointer`}
                            />
                        </div>
                    </div>

                    <style>{`
                        input[type="date"]::-webkit-calendar-picker-indicator {
                            filter: invert(1);
                            opacity: 0.7;
                            cursor: pointer;
                            transition: opacity 0.2s;
                        }
                        input[type="date"]::-webkit-calendar-picker-indicator:hover {
                            opacity: 1;
                        }
                    `}</style>
                </>
            )}

            {/* Clear date filter button */}
            {dateRangeType !== null && (
                <div className="mt-3 text-center">
                    <button
                        onClick={() => {
                            setDateRangeType(null);
                            setPage(1);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors font-semibold"
                    >
                        Clear date filter
                    </button>
                </div>
            )}
        </div>
    );
}