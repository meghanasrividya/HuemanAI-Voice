"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
    ChevronRight,
    Printer,
    Download,
    Check,
    Search,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Ticket,
} from "lucide-react";
import {
    fetchCouponsMetadata,
    generateCouponsReport,
    ReportMetadata,
    CouponsReportDataResponse as ReportDataResponse,
    CouponResponseItem as BookingReservation,
    fetchCouponsSuggestions,
} from "../../../../lib/api/reports";
import DateRangeFilter from "../components/DateRangeFilter";

export default function CouponsReportPage() {
    const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
    const [reportData, setReportData] = useState<ReportDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and Pagination States
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [dateField, setDateField] = useState<string>("valid_from");
    const [dateRangeType, setDateRangeType] = useState<"7days" | "30days" | "month" | "custom" | null>(null);

    // Default custom date range: past 30 days
    const [customStartDate, setCustomStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split("T")[0];
    });
    const [customEndDate, setCustomEndDate] = useState<string>(() => {
        return new Date().toISOString().split("T")[0];
    });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"columns" | "filters">("columns");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Filter tab states
    const [pendingFilterColumn, setPendingFilterColumn] = useState<string>("");
    const [pendingFilterOperator, setPendingFilterOperator] = useState<string>("equals");
    const [pendingFilterValue, setPendingFilterValue] = useState<string>("");
    const [activeFilters, setActiveFilters] = useState<Array<{ column: string; operator: string; value: string }>>([]);
    const [columnDropdownOpen, setColumnDropdownOpen] = useState(false);
    const [operatorDropdownOpen, setOperatorDropdownOpen] = useState(false);
    const [valueDropdownOpen, setValueDropdownOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);

    // Refs for click-outside on custom dropdowns
    const columnDropdownRef = useRef<HTMLDivElement>(null);
    const columnBtnRef = useRef<HTMLButtonElement>(null);
    const operatorDropdownRef = useRef<HTMLDivElement>(null);
    const valueDropdownRef = useRef<HTMLDivElement>(null);
    const valueInputRef = useRef<HTMLInputElement>(null);
    const lastSelectedSuggestionRef = useRef<string>("");
    const [colDropPos, setColDropPos] = useState({ bottom: 0, left: 0, width: 0 });

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            const inColDropdown = columnDropdownRef.current?.contains(target);
            const inColBtn = columnBtnRef.current?.contains(target);
            if (!inColDropdown && !inColBtn) setColumnDropdownOpen(false);
            if (operatorDropdownRef.current && !operatorDropdownRef.current.contains(target)) {
                setOperatorDropdownOpen(false);
            }
            const inValueInput = valueInputRef.current?.contains(target);
            if (valueDropdownRef.current && !valueDropdownRef.current.contains(target) && !inValueInput) {
                setValueDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Helper to get columns metadata
    const getColInfo = (colKey: string) => {
        return metadata?.columns[colKey] || { label: colKey, type: "UNKNOWN" };
    };

    // Debounce and fetch filter suggestions from backend API
    useEffect(() => {
        if (!pendingFilterColumn || !String(pendingFilterValue || "").trim()) {
            setSuggestions([]);
            return;
        }

        const isDateCol = getColInfo(pendingFilterColumn).type === "date";
        if (isDateCol) {
            setSuggestions([]);
            return;
        }

        if (String(pendingFilterValue || "") === lastSelectedSuggestionRef.current) {
            return;
        }

        const timer = setTimeout(async () => {
            setSuggestionsLoading(true);
            try {
                const res = await fetchCouponsSuggestions(pendingFilterColumn, String(pendingFilterValue || ""));
                if (res && res.values) {
                    setSuggestions(res.values.map(v => v === null || v === undefined ? "" : String(v)));
                } else {
                    setSuggestions([]);
                }
            } catch (err) {
                console.error("Failed to fetch suggestions:", err);
                setSuggestions([]);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [pendingFilterColumn, pendingFilterValue]);

    // 1. Fetch Metadata on Mount
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                setLoading(true);
                const data = await fetchCouponsMetadata();
                setMetadata(data);
                setSelectedColumns(data.defaultColumns || []);
                if (data.dateColumns && data.dateColumns.length > 0) {
                    setDateField(data.dateColumns[0]);
                }
            } catch (err: any) {
                console.error("Failed to load metadata:", err);
                setError("Failed to load report configuration.");
            } finally {
                setLoading(false);
            }
        };
        loadMetadata();
    }, []);

    // 2. Fetch Report Data on Filter / Pagination change
    useEffect(() => {
        if (!metadata) return;

        let active = true;
        const loadReportData = async () => {
            setLoading(true);
            setError(null);
            try {
                const now = new Date();

                const createUTCDate = (
                    year: number,
                    month: number,
                    day: number,
                    endOfDay = false
                ) => {
                    return new Date(
                        Date.UTC(
                            year,
                            month,
                            day,
                            endOfDay ? 23 : 0,
                            endOfDay ? 59 : 0,
                            endOfDay ? 59 : 0,
                            endOfDay ? 999 : 0
                        )
                    ).toISOString();
                };

                let start = "";
                let end = "";

                if (dateRangeType === "7days") {
                    const startDate = new Date();
                    startDate.setUTCDate(startDate.getUTCDate() - 7);

                    start = createUTCDate(
                        startDate.getUTCFullYear(),
                        startDate.getUTCMonth(),
                        startDate.getUTCDate()
                    );

                    end = createUTCDate(
                        now.getUTCFullYear(),
                        now.getUTCMonth(),
                        now.getUTCDate(),
                        true
                    );
                }

                else if (dateRangeType === "30days") {
                    const startDate = new Date();
                    startDate.setUTCDate(startDate.getUTCDate() - 30);

                    start = createUTCDate(
                        startDate.getUTCFullYear(),
                        startDate.getUTCMonth(),
                        startDate.getUTCDate()
                    );

                    end = createUTCDate(
                        now.getUTCFullYear(),
                        now.getUTCMonth(),
                        now.getUTCDate(),
                        true
                    );
                }

                else if (dateRangeType === "month") {
                    start = createUTCDate(
                        now.getUTCFullYear(),
                        now.getUTCMonth(),
                        1
                    );

                    end = createUTCDate(
                        now.getUTCFullYear(),
                        now.getUTCMonth(),
                        now.getUTCDate(),
                        true
                    );
                }

                else if (dateRangeType === "custom") {
                    if (customStartDate) {
                        const [y, m, d] = customStartDate.split("-").map(Number);
                        start = createUTCDate(y, m - 1, d);
                    }

                    if (customEndDate) {
                        const [y, m, d] = customEndDate.split("-").map(Number);
                        end = createUTCDate(y, m - 1, d, true);
                    }
                }

                const res = await generateCouponsReport({
                    columns: selectedColumns,
                    dateField,
                    startDate: start,
                    endDate: end,
                    search: debouncedSearch,
                    page,
                    pageSize,
                    filters: activeFilters,
                });

                if (active) {
                    setReportData(res);
                }
            } catch (err: any) {
                console.error("Error generating report:", err);
                if (active) {
                    setError("Failed to load report data. Please try again.");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        loadReportData();

        return () => {
            active = false;
        };
    }, [metadata, selectedColumns, dateField, dateRangeType, customStartDate, customEndDate, debouncedSearch, page, pageSize, activeFilters]);

    // Handle column selection toggle
    const toggleColumn = (colKey: string) => {
        setSelectedColumns((prev) => {
            if (prev.includes(colKey)) {
                if (prev.length <= 1) return prev; // Keep at least one column
                return prev.filter((k) => k !== colKey);
            } else {
                if (metadata?.columns) {
                    const allPossible = Object.keys(metadata.columns);
                    return allPossible.filter(
                        (k) => k === colKey || prev.includes(k)
                    );
                }
                return [...prev, colKey];
            }
        });
    };

    // Calculate avatar gradient and initials
    const getInitials = (name?: string | null) => {
        if (!name || name === "—") return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getAvatarStyle = (name?: string | null) => {
        if (!name || name === "—") return "bg-zinc-800 text-zinc-400 border border-zinc-700/50";
        const colors = [
            "bg-gradient-to-br from-[#10b981] to-[#059669] text-white", // Emerald (matching Anne Jones AJ in image)
            "bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white", // Orange (matching Jayne Lewis JL, Howard Morgan HM in image)
            "bg-gradient-to-br from-[#eab308] to-[#ca8a04] text-white", // Yellow
            "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white", // Blue (matching Amanda Jenkins AJ in image)
            "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white", // Purple
            "bg-gradient-to-br from-[#6b7280] to-[#4b5563] text-white", // Grey
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Date formatting helper: 31 Mar 2026
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            const day = date.getDate();
            const monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${day} ${month} ${year}`;
        } catch {
            return dateStr;
        }
    };

    // Export CSV Helper
    const handleExportCSV = () => {
        if (!reportData || !metadata) return;

        const headers = selectedColumns.map((colKey) => getColInfo(colKey).label);
        const rows = reportData.data.map((row) =>
            selectedColumns.map((colKey) => {
                let val = row[colKey];
                if (val === undefined || val === null) return "";
                if (typeof val === "boolean") {
                    val = val ? "Yes" : "No";
                } else if (metadata.dateColumns.includes(colKey)) {
                    val = formatDate(String(val));
                }
                const stringVal = String(val).replace(/"/g, '""');
                return `"${stringVal}"`;
            }).join(",")
        );

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `coupons_report_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Print helper
    const handlePrint = () => {
        window.print();
    };

    // Pagination numbers builder
    const totalPages = reportData ? Math.ceil(reportData.total / pageSize) : 0;
    const paginationRange = useMemo(() => {
        if (totalPages <= 0) return [];
        const pages: (number | string)[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 4) {
                pages.push(1, 2, 3, 4, 5, "...", totalPages);
            } else if (page >= totalPages - 3) {
                pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
            }
        }
        return pages;
    }, [page, totalPages]);

    // Client-side filtered data (applied on top of server-paginated reportData)
    const displayData = useMemo(() => {
        if (!reportData || activeFilters.length === 0) return reportData;
        const filtered = reportData.data.filter(row =>
            activeFilters.every(f => {
                const isDateCol = getColInfo(f.column).type === "date";
                let cellValRaw = row[f.column];
                if (typeof cellValRaw === "boolean") {
                    cellValRaw = cellValRaw ? "Yes" : "No";
                }
                let cellVal = String(cellValRaw ?? "").toLowerCase().trim();
                let filterVal = f.value.toLowerCase().trim();

                if (isDateCol) {
                    if (cellVal.includes("t")) {
                        cellVal = cellVal.split("t")[0];
                    } else if (cellVal.includes(" ")) {
                        cellVal = cellVal.split(" ")[0];
                    }
                    
                    try {
                        const d = new Date(row[f.column]);
                        if (!isNaN(d.getTime())) {
                            const y = d.getUTCFullYear();
                            const m = String(d.getUTCMonth() + 1).padStart(2, "0");
                            const day = String(d.getUTCDate()).padStart(2, "0");
                            cellVal = `${y}-${m}-${day}`;
                            
                            const ly = d.getFullYear();
                            const lm = String(d.getMonth() + 1).padStart(2, "0");
                            const lday = String(d.getDate()).padStart(2, "0");
                            const localDateStr = `${ly}-${lm}-${lday}`;
                            
                            if (f.operator === "equals") {
                                return cellVal === filterVal || localDateStr === filterVal;
                            }
                            if (f.operator === "contains") {
                                return cellVal.includes(filterVal) || localDateStr.includes(filterVal);
                            }
                            if (f.operator === "greater_than_or_equal") {
                                return cellVal >= filterVal || localDateStr >= filterVal;
                            }
                            if (f.operator === "less_than_or_equal") {
                                return cellVal <= filterVal || localDateStr <= filterVal;
                            }
                            if (f.operator === "in_list") {
                                const list = filterVal.split(",").map(v => v.trim());
                                return list.some(v => cellVal === v || localDateStr === v);
                            }
                        }
                    } catch (e) {
                        // fallback
                    }
                }

                if (f.operator === "greater_than_or_equal") {
                    const cellNum = Number(cellVal);
                    const filterNum = Number(filterVal);
                    if (!isNaN(cellNum) && !isNaN(filterNum)) {
                        return cellNum >= filterNum;
                    }
                    return cellVal >= filterVal;
                }
                if (f.operator === "less_than_or_equal") {
                    const cellNum = Number(cellVal);
                    const filterNum = Number(filterVal);
                    if (!isNaN(cellNum) && !isNaN(filterNum)) {
                        return cellNum <= filterNum;
                    }
                    return cellVal <= filterVal;
                }

                if (f.operator === "equals") return cellVal === filterVal;
                if (f.operator === "contains") return cellVal.includes(filterVal);
                if (f.operator === "in_list") return filterVal.split(",").map(v => v.trim()).some(v => cellVal === v);
                return true;
            })
        );
        return { ...reportData, data: filtered };
    }, [reportData, activeFilters]);

    return (
        <div className="h-full bg-[#0a0a0a] text-white flex overflow-hidden">
            <style jsx global>{`
                @media print {
                    html, body {
                        background: white !important;
                        color: black !important;
                        overflow: visible !important;
                        height: auto !important;
                    }
                    /* Reset parent layout containers so print layout expands naturally */
                    .h-screen:not(.no-print),
                    main:not(.no-print),
                    main > div:not(.no-print),
                    main > div > div:not(.no-print),
                    main > div > div > div:not(.no-print),
                    .overflow-auto:not(.no-print),
                    .overflow-y-auto:not(.no-print) {
                        height: auto !important;
                        min-height: 0 !important;
                        max-height: none !important;
                        overflow: visible !important;
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border: none !important;
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    /* Hide unnecessary elements with absolute priority */
                    aside,
                    .no-print,
                    header,
                    .actions-header,
                    .pagination-footer {
                        display: none !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        color: black !important;
                        table-layout: auto !important;
                        page-break-inside: auto !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    th {
                        background-color: #f3f4f6 !important;
                        color: black !important;
                        border-bottom: 2px solid #ddd !important;
                        padding: 12px 8px !important;
                    }
                    td {
                        border-bottom: 1px solid #ddd !important;
                        color: black !important;
                        padding: 12px 8px !important;
                    }
                }
            `}</style>

            {/* ── Main Content Area ── */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a] min-w-0 flex flex-col">
                {/* ── Top Nav Header with Back Action & Print/Export Buttons ── */}
                <div className="no-print w-full px-[32px] pt-[24px] pb-[16px] border-b border-[#161616] flex items-center justify-between actions-header shrink-0">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/reports"
                            className="w-8 h-8 rounded-full border border-[#232323] bg-[#111] flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#333] transition-all"
                        >
                            <ArrowLeft size={14} />
                        </Link>
                        <div className="flex items-center text-[13px] font-semibold text-zinc-400 gap-1.5">
                            <Link href="/reports" className="hover:text-zinc-200 transition-colors">Reports</Link>
                            <span className="text-zinc-600 font-normal">&gt;</span>
                            <span className="text-white font-bold">Coupons Reports</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="h-[36px] px-4 rounded-[8px] bg-[#161616] border border-[#2a2a2a] hover:bg-[#222] text-zinc-300 font-bold text-[11px] flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Printer size={13} />
                            Print
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="h-[36px] px-4 rounded-[8px] bg-[#9333ea] hover:bg-[#7c3aed] text-white font-bold text-[11px] flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Download size={13} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── Split Layout Container ── */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* ── Left Configuration Sidebar ── */}
                    <div className="no-print w-[300px] border-r border-[#161616] bg-[#0c0c0c] flex flex-col p-6 shrink-0 overflow-y-auto">
                        <h2 className="text-[14px] font-bold text-white mb-1">Configuration</h2>
                        <p className="text-zinc-500 text-[10px] mb-6">Customize columns, dates & filters</p>

                        {/* DATE RANGE FILTER BOX (Using Purple theme) */}
                        <DateRangeFilter
                            metadata={metadata}
                            dateField={dateField}
                            setDateField={setDateField}
                            dateRangeType={dateRangeType}
                            setDateRangeType={setDateRangeType}
                            customStartDate={customStartDate}
                            setCustomStartDate={setCustomStartDate}
                            customEndDate={customEndDate}
                            setCustomEndDate={setCustomEndDate}
                            setPage={setPage}
                            theme="purple"
                            showDropdown={true}
                        />

                        {/* COLUMN SELECTION TABS */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex border-b border-[#161616] mb-4 shrink-0">
                                <button
                                    onClick={() => setActiveTab("columns")}
                                    className={`pb-2.5 text-[11px] font-bold border-b-2 tracking-wide flex items-center gap-1.5 transition-all relative ${activeTab === "columns"
                                            ? "border-[#b158ff] text-[#b158ff]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Columns
                                    <span className="px-1.5 py-0.5 rounded-full bg-[#210d33] border border-[#b158ff]/20 text-[9px] text-[#b158ff] font-black">
                                        {selectedColumns.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("filters")}
                                    className={`ml-6 pb-2.5 text-[11px] font-bold border-b-2 tracking-wide transition-all ${activeTab === "filters"
                                            ? "border-[#b158ff] text-[#b158ff]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                        }`}
                                >
                                    Filters
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1">
                                {activeTab === "columns" ? (
                                    <div className="space-y-1">
                                        {metadata &&
                                            Object.keys(metadata.columns).map((colKey) => {
                                                const checked = selectedColumns.includes(colKey);
                                                const colInfo = getColInfo(colKey);
                                                return (
                                                    <div
                                                        key={colKey}
                                                        onClick={() => toggleColumn(colKey)}
                                                        className={`w-full flex items-center justify-between p-2.5 rounded-[8px] cursor-pointer transition-colors ${checked
                                                                ? "bg-[#111] hover:bg-[#151515]"
                                                                : "hover:bg-[#111]/50"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${checked
                                                                        ? "border-[#b158ff] bg-[#b158ff] text-black"
                                                                        : "border-zinc-700 bg-transparent text-transparent"
                                                                    }`}
                                                            >
                                                                {checked && <Check size={10} strokeWidth={4} />}
                                                            </div>

                                                            <span
                                                                className={`text-[11px] font-semibold transition-all ${checked ? "text-zinc-100" : "text-zinc-400"
                                                                    }`}
                                                            >
                                                                {colInfo.label}
                                                            </span>
                                                        </div>

                                                        <span className="text-[8px] font-black text-zinc-600 tracking-wider uppercase">
                                                            {colInfo.type}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* ADD FILTER Card */}
                                        <div className="rounded-[10px] border border-[#1e1e1e] bg-[#0f0f0f]">
                                            <div className="border-l-2 border-[#b158ff] p-3 rounded-r-[9px] rounded-l-[8px]">
                                                <p className="text-[9px] font-black tracking-widest text-[#b158ff] uppercase mb-3">Add Filter</p>

                                                {/* Column Selection */}
                                                <div className="relative mb-2">
                                                    <button
                                                        onClick={() => {
                                                            setColumnDropdownOpen(v => !v);
                                                            setOperatorDropdownOpen(false);
                                                            setValueDropdownOpen(false);
                                                        }}
                                                        className="w-full flex items-center justify-between bg-[#161616] border border-[#232323] rounded-[8px] px-3 py-2.5 text-[11px] hover:border-[#333] transition-colors"
                                                    >
                                                        <span className={pendingFilterColumn ? "text-white font-semibold" : "text-zinc-500"}>
                                                            {pendingFilterColumn ? getColInfo(pendingFilterColumn).label : "Select Column"}
                                                        </span>
                                                        <ChevronRight size={12} className={`text-zinc-500 transition-transform ${columnDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
                                                    </button>

                                                    {/* Column Dropdown */}
                                                    {columnDropdownOpen && metadata && (
                                                        <div
                                                            ref={columnDropdownRef}
                                                            className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-[#232323] rounded-[10px] overflow-hidden z-50 shadow-2xl max-h-[240px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100"
                                                        >
                                                            {Object.keys(metadata.columns).map((colKey) => (
                                                                <button
                                                                    key={colKey}
                                                                    onClick={() => {
                                                                        setPendingFilterColumn(colKey);
                                                                        setPendingFilterOperator("equals");
                                                                        setPendingFilterValue("");
                                                                        lastSelectedSuggestionRef.current = "";
                                                                        setColumnDropdownOpen(false);
                                                                    }}
                                                                    className={`w-full text-left px-4 py-2.5 text-[11px] hover:bg-[#1f1f1f] hover:text-white transition-colors font-medium ${pendingFilterColumn === colKey ? "text-[#b158ff]" : "text-zinc-300"
                                                                        }`}
                                                                >
                                                                    {getColInfo(colKey).label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Operator & Value Field */}
                                                <div className="flex gap-2 mb-3">
                                                    {/* Operator Selection */}
                                                    <div className="relative shrink-0">
                                                        {(() => {
                                                            const colType = getColInfo(pendingFilterColumn).type;
                                                            const opOptions = colType === "number"
                                                                ? [
                                                                    { id: "equals", label: "Equals" },
                                                                    { id: "greater_than_or_equal", label: "≥" },
                                                                    { id: "less_than_or_equal", label: "≤" },
                                                                    { id: "in_list", label: "In List" },
                                                                  ]
                                                                : colType === "date"
                                                                ? [
                                                                    { id: "equals", label: "Equals" },
                                                                    { id: "greater_than_or_equal", label: "≥" },
                                                                    { id: "less_than_or_equal", label: "≤" },
                                                                  ]
                                                                : [
                                                                    { id: "equals", label: "Equals" },
                                                                    { id: "contains", label: "Contains" },
                                                                    { id: "in_list", label: "In List" },
                                                                  ];

                                                            const activeOpLabel = opOptions.find(o => o.id === pendingFilterOperator)?.label || "Equals";

                                                            return (
                                                                <>
                                                                    <button
                                                                        onClick={() => {
                                                                            setOperatorDropdownOpen(v => !v);
                                                                            setColumnDropdownOpen(false);
                                                                            setValueDropdownOpen(false);
                                                                        }}
                                                                        className="flex items-center gap-1.5 bg-[#161616] border border-[#232323] rounded-[8px] px-3 py-2.5 text-[11px] text-zinc-300 font-semibold whitespace-nowrap hover:border-[#333] transition-colors"
                                                                    >
                                                                        {activeOpLabel}
                                                                        <ChevronRight size={11} className={`text-zinc-500 transition-transform ${operatorDropdownOpen ? "-rotate-90" : "rotate-90"}`} />
                                                                    </button>
                                                                    {operatorDropdownOpen && (
                                                                        <div
                                                                            ref={operatorDropdownRef}
                                                                            className="absolute top-full left-0 mt-1 bg-[#161616] border border-[#232323] rounded-[8px] overflow-hidden z-50 shadow-2xl min-w-[110px] animate-in fade-in slide-in-from-top-1 duration-100"
                                                                        >
                                                                            {opOptions.map(op => (
                                                                                <button
                                                                                    key={op.id}
                                                                                    onClick={() => {
                                                                                        setPendingFilterOperator(op.id);
                                                                                        setOperatorDropdownOpen(false);
                                                                                    }}
                                                                                    className="w-full text-left px-3 py-2.5 text-[11px] text-zinc-300 hover:bg-[#1f1f1f] hover:text-white transition-colors font-medium flex items-center gap-2"
                                                                                >
                                                                                    <span className={`text-[10px] ${pendingFilterOperator === op.id ? "text-[#b158ff]" : "text-transparent"}`}>✓</span>
                                                                                    {op.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Value Input and Autocomplete Suggestions */}
                                                    <div className="relative flex-1 min-w-0">
                                                        {(() => {
                                                            const isDateField = getColInfo(pendingFilterColumn).type === "date";
                                                            return (
                                                                <>
                                                                    <input
                                                                        ref={valueInputRef}
                                                                        type={isDateField ? "date" : "text"}
                                                                        placeholder={isDateField ? "Select Date..." : "Value..."}
                                                                        value={pendingFilterValue}
                                                                        onChange={e => {
                                                                            setPendingFilterValue(e.target.value);
                                                                            if (!isDateField) {
                                                                                setValueDropdownOpen(true);
                                                                            }
                                                                        }}
                                                                        onFocus={() => {
                                                                            if (!isDateField) {
                                                                                setValueDropdownOpen(true);
                                                                            }
                                                                        }}
                                                                        onKeyDown={e => {
                                                                            if (e.key === "Enter" && pendingFilterColumn && String(pendingFilterValue || "").trim()) {
                                                                                setActiveFilters(prev => [...prev, { column: pendingFilterColumn, operator: pendingFilterOperator, value: String(pendingFilterValue || "").trim() }]);
                                                                                setPage(1);
                                                                                setPendingFilterColumn("");
                                                                                setPendingFilterValue("");
                                                                                lastSelectedSuggestionRef.current = "";
                                                                                setPendingFilterOperator("equals");
                                                                                setValueDropdownOpen(false);
                                                                            }
                                                                        }}
                                                                        style={{ colorScheme: "dark" }}
                                                                        className="w-full bg-[#161616] border border-[#232323] rounded-[8px] px-3 py-2.5 text-[11px] text-white placeholder-zinc-600 font-medium focus:outline-none focus:border-[#b158ff]/50"
                                                                    />

                                                                    {valueDropdownOpen && !isDateField && (suggestions.length > 0 || suggestionsLoading) && (
                                                                        <div
                                                                            ref={valueDropdownRef}
                                                                            className="absolute top-full left-0 right-0 mt-1 bg-[#161616] border border-[#232323] rounded-[10px] overflow-hidden z-[9999] shadow-2xl max-h-[160px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100"
                                                                        >
                                                                            {suggestionsLoading ? (
                                                                                <div className="flex items-center justify-center py-3 text-[10px] text-zinc-500 gap-1.5">
                                                                                    <Loader2 className="animate-spin text-[#b158ff]" size={10} />
                                                                                    Loading...
                                                                                </div>
                                                                            ) : (
                                                                                suggestions.map((sug, idx) => (
                                                                                    <button
                                                                                        key={idx}
                                                                                        type="button"
                                                                                        onClick={() => {
                                                                                            lastSelectedSuggestionRef.current = sug;
                                                                                            setPendingFilterValue(String(sug ?? ""));
                                                                                            setValueDropdownOpen(false);
                                                                                        }}
                                                                                        className="w-full text-left px-4 py-2.5 text-[11px] text-zinc-300 hover:bg-[#1f1f1f] hover:text-white transition-colors font-medium border-b border-[#232323]/30 last:border-b-0"
                                                                                    >
                                                                                        {sug}
                                                                                    </button>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        if (!pendingFilterColumn || !String(pendingFilterValue || "").trim()) return;
                                                        setActiveFilters(prev => [...prev, {
                                                            column: pendingFilterColumn,
                                                            operator: pendingFilterOperator,
                                                            value: String(pendingFilterValue || "").trim(),
                                                        }]);
                                                        setPage(1);
                                                        setPendingFilterColumn("");
                                                        setPendingFilterValue("");
                                                        lastSelectedSuggestionRef.current = "";
                                                        setPendingFilterOperator("equals");
                                                        setValueDropdownOpen(false);
                                                    }}
                                                    disabled={!pendingFilterColumn || !String(pendingFilterValue || "").trim()}
                                                    className="w-full py-2.5 rounded-[8px] bg-gradient-to-r from-[#9333ea] to-[#7c3aed] hover:from-[#a855f7] hover:to-[#9333ea] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    + Add Filter
                                                </button>
                                                <p className="text-center text-[9px] text-zinc-600 mt-2">Example: redeemed = false</p>
                                            </div>
                                        </div>

                                        {/* Filter Chips */}
                                        {activeFilters.length > 0 && (
                                            <div className="space-y-1.5">
                                                {activeFilters.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-[#111] border border-[#1e1e1e] rounded-[8px] px-3 py-2">
                                                        <div className="flex flex-col min-w-0 text-[10px]">
                                                            <span className="text-white font-bold">{getColInfo(f.column).label}</span>
                                                            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black">
                                                                <span className="px-1.5 py-0.5 rounded bg-[#1a1a1a] text-zinc-400">
                                                                    {f.operator === "equals"
                                                                        ? "EQUALS"
                                                                        : f.operator === "contains"
                                                                        ? "LIKE"
                                                                        : f.operator === "greater_than_or_equal"
                                                                        ? "≥"
                                                                        : f.operator === "less_than_or_equal"
                                                                        ? "≤"
                                                                        : "IN"}
                                                                </span>
                                                                <span className="text-[#b158ff] truncate max-w-[180px]">{f.value}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setActiveFilters(prev => prev.filter((_, idx) => idx !== i));
                                                                setPage(1);
                                                            }}
                                                            className="text-zinc-600 hover:text-red-400 transition-colors text-[11px] font-black ml-2 shrink-0"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setActiveFilters([]);
                                                        setPage(1);
                                                    }}
                                                    className="w-full text-[9px] text-zinc-500 hover:text-red-400 transition-colors py-1 font-semibold"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Content Area: Table Preview ── */}
                    <div className="flex-1 flex flex-col p-[32px] overflow-y-auto min-h-0 bg-[#070707]">
                        {error && (
                            <div className="no-print p-4 bg-red-950/20 border border-red-800/30 rounded-[12px] mb-6 flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div className="text-[11px]">
                                    <p className="font-bold text-red-200">Error Encountered</p>
                                    <p className="text-red-400/90 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex-1 flex flex-col border border-[#161616] rounded-[12px] bg-[#0f0f0f] overflow-hidden min-h-0">
                            {/* Table Header toolbar */}
                            <div className="no-print p-6 border-b border-[#161616] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#9333ea]/10 border border-[#9333ea]/20 flex items-center justify-center text-[#b158ff]">
                                        <Ticket size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-bold text-white">Coupon Report Preview</h3>
                                        <p className="text-[#b158ff] text-[10px] font-bold mt-0.5">
                                            {loading && !reportData ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Loader2 className="animate-spin" size={10} />
                                                    Checking database...
                                                </span>
                                            ) : (
                                                `${reportData?.total || 0} coupons found`
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative w-[240px]">
                                    <input
                                        type="text"
                                        placeholder="Search results..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-[#161616] border border-[#232323] rounded-[8px] pl-9 pr-4 py-2.5 text-[11px] placeholder-zinc-500 text-white font-semibold focus:outline-none focus:border-[#b158ff]/50"
                                    />
                                    <Search size={12} className="absolute left-3 top-3.5 text-zinc-500" />
                                </div>
                            </div>

                            {/* Responsive Table Container */}
                            <div className="flex-1 overflow-auto min-h-0 relative">
                                {loading && (
                                    <div className="no-print absolute inset-0 bg-[#0f0f0f]/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-[#b158ff]" size={32} />
                                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Syncing records...</span>
                                        </div>
                                    </div>
                                )}

                                <table className="w-full border-collapse text-left">
                                    <thead className="bg-[#1c0d2b] border-b border-[#b158ff]/10 sticky top-0 z-1">
                                        <tr>
                                            {selectedColumns.map((colKey) => (
                                                <th
                                                    key={colKey}
                                                    className="px-6 py-4 text-[9px] font-black tracking-wider text-zinc-300 uppercase select-none border-b border-[#2d1245]"
                                                >
                                                    {getColInfo(colKey).label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]/60 text-[11px]">
                                        {displayData && displayData.data.length > 0 ? (
                                            displayData.data.map((row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className="hover:bg-[#161616]/40 transition-colors"
                                                >
                                                    {selectedColumns.map((colKey) => {
                                                        const val = row[colKey];
                                                        const isDate = metadata?.dateColumns?.includes(colKey);

                                                        // Customer name avatar formatting
                                                        if (colKey === "customer_name") {
                                                            const nameStr = val ? String(val) : "—";
                                                            return (
                                                                <td key={colKey} className="px-6 py-4 border-b border-[#161616]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${getAvatarStyle(
                                                                                val
                                                                            )}`}
                                                                        >
                                                                            {getInitials(val)}
                                                                        </div>
                                                                        <span className="font-semibold text-white">{nameStr}</span>
                                                                    </div>
                                                                </td>
                                                            );
                                                        }

                                                        // Bold codes
                                                        if (colKey === "coupon_code" || colKey === "reference_no") {
                                                            return (
                                                                <td key={colKey} className="px-6 py-4 border-b border-[#161616] text-white font-bold uppercase tracking-wider">
                                                                    {String(val || "—")}
                                                                </td>
                                                            );
                                                        }

                                                        // Boolean redeemed rendering
                                                        if (colKey === "redeemed") {
                                                            return (
                                                                <td key={colKey} className="px-6 py-4 border-b border-[#161616] text-zinc-300 font-semibold">
                                                                    {val === true ? "Yes" : "No"}
                                                                </td>
                                                            );
                                                        }

                                                        // Default Date and String rendering
                                                        return (
                                                            <td
                                                                key={colKey}
                                                                className="px-6 py-4 border-b border-[#161616] text-zinc-300 font-semibold"
                                                            >
                                                                {isDate ? formatDate(String(val)) : String(val === undefined || val === null || val === "" ? "—" : val)}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={selectedColumns.length || 1}
                                                    className="px-6 py-12 text-center text-zinc-500 font-medium italic"
                                                >
                                                    {!loading && "No matching coupons found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination and Rows Count Selector Footer */}
                            {reportData && (
                                <div className="no-print px-6 py-4 border-t border-[#161616] bg-[#0c0c0c] flex items-center justify-between shrink-0 pagination-footer text-[10px] text-zinc-400 font-bold select-none">
                                    <div>
                                        Showing{" "}
                                        <span className="text-white">
                                            {reportData.data.length > 0 ? (page - 1) * pageSize + 1 : 0}
                                        </span>{" "}
                                        –{" "}
                                        <span className="text-white">
                                            {(page - 1) * pageSize + reportData.data.length}
                                        </span>{" "}
                                        of <span className="text-[#b158ff] font-black">{reportData.total}</span> results
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-zinc-500 uppercase text-[9px]">Rows:</span>
                                            {[25, 50, 100].map((size) => (
                                                <button
                                                    key={size}
                                                    onClick={() => {
                                                        setPageSize(size);
                                                        setPage(1);
                                                    }}
                                                    className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${pageSize === size
                                                            ? "bg-[#b158ff] text-black"
                                                            : "bg-[#161616] text-zinc-400 hover:text-zinc-200 border border-[#232323]"
                                                        }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                disabled={page <= 1}
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                className="h-6 px-2 rounded bg-[#161616] border border-[#232323] text-zinc-500 hover:text-zinc-200 hover:border-[#333] transition-colors disabled:opacity-40 disabled:hover:text-zinc-500 disabled:hover:border-[#232323] cursor-pointer flex items-center gap-1"
                                            >
                                                &lt; Prev
                                            </button>

                                            {paginationRange.map((pNum, index) => {
                                                const active = page === pNum;
                                                const isDots = typeof pNum === "string";

                                                return (
                                                    <button
                                                        key={index}
                                                        disabled={isDots}
                                                        onClick={() => !isDots && setPage(Number(pNum))}
                                                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${active
                                                                ? "bg-[#b158ff] text-black font-extrabold"
                                                                : isDots
                                                                    ? "text-zinc-600 bg-transparent font-normal cursor-default"
                                                                    : "bg-[#161616] border border-[#232323] text-zinc-400 hover:text-zinc-200 hover:border-[#333]"
                                                            }`}
                                                    >
                                                        {pNum}
                                                    </button>
                                                );
                                            })}

                                            <button
                                                disabled={page >= totalPages}
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                                className="h-6 px-2 rounded bg-[#161616] border border-[#232323] text-zinc-500 hover:text-zinc-200 hover:border-[#333] transition-colors disabled:opacity-40 disabled:hover:text-zinc-500 disabled:hover:border-[#232323] cursor-pointer flex items-center gap-1"
                                            >
                                                Next &gt;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}