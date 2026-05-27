"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    Phone,
    ClipboardList,
    TrendingUp,
    PhoneCall,
    FileBarChart2,
    Sparkles,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Calendar,
    Printer,
    Download,
    Check,
    Search,
    ArrowLeft,
    AlertCircle,
    Loader2,
    BedDouble,
} from "lucide-react";
import {
    fetchBookingsMetadata,
    generateBookingsReport,
    ReportMetadata,
    ReportDataResponse,
    BookingReservation,
} from "../../../lib/api/reports";

export default function BookingsReportPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [metadata, setMetadata] = useState<ReportMetadata | null>(null);
    const [reportData, setReportData] = useState<ReportDataResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and Pagination States
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
    const [dateField, setDateField] = useState<string>("visit_date");
    const [dateRangeType, setDateRangeType] = useState<"7days" | "30days" | "month" | "custom">("30days");
    
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

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // 1. Fetch Metadata on Mount
    useEffect(() => {
        const loadMetadata = async () => {
            try {
                setLoading(true);
                const data = await fetchBookingsMetadata();
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
                const today = new Date();
                let start = "";
                let end = "";

                if (dateRangeType === "7days") {
                    const s = new Date();
                    s.setDate(today.getDate() - 7);
                    start = s.toISOString();
                    end = today.toISOString();
                } else if (dateRangeType === "30days") {
                    const s = new Date();
                    s.setDate(today.getDate() - 30);
                    start = s.toISOString();
                    end = today.toISOString();
                } else if (dateRangeType === "month") {
                    const s = new Date(today.getFullYear(), today.getMonth(), 1);
                    start = s.toISOString();
                    end = today.toISOString();
                } else if (dateRangeType === "custom") {
                    const sStart = customStartDate ? new Date(customStartDate + "T00:00:00.000Z") : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    const sEnd = customEndDate ? new Date(customEndDate + "T23:59:59.999Z") : today;
                    start = sStart.toISOString();
                    end = sEnd.toISOString();
                }

                const res = await generateBookingsReport({
                    columns: selectedColumns,
                    dateField,
                    startDate: start,
                    endDate: end,
                    search: debouncedSearch,
                    page,
                    pageSize,
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
    }, [metadata, selectedColumns, dateField, dateRangeType, customStartDate, customEndDate, debouncedSearch, page, pageSize]);

    // Handle column selection toggle
    const toggleColumn = (colKey: string) => {
        setSelectedColumns((prev) => {
            if (prev.includes(colKey)) {
                if (prev.length <= 1) return prev; // Keep at least one column
                return prev.filter((k) => k !== colKey);
            } else {
                // Keep the order matching metadata columns if possible
                if (metadata?.columns) {
                    return Object.keys(metadata.columns).filter(
                        (k) => k === colKey || prev.includes(k)
                    );
                }
                return [...prev, colKey];
            }
        });
    };

    // Calculate avatar gradient and initials
    const getInitials = (name?: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const getAvatarStyle = (name?: string) => {
        if (!name) return "bg-amber-600/20 text-amber-500";
        const colors = [
            "bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white", // Amber
            "bg-gradient-to-br from-[#10b981] to-[#059669] text-white", // Emerald
            "bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white", // Blue
            "bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] text-white", // Purple
            "bg-gradient-to-br from-[#ec4899] to-[#db2777] text-white", // Pink
            "bg-gradient-to-br from-[#06b6d4] to-[#0891b2] text-white", // Cyan
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Date formatting helper: 22 Mar 2026
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
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

        // Header Row
        const headers = selectedColumns.map((colKey) => metadata.columns[colKey]?.label || colKey);
        
        // Data Rows
        const rows = reportData.data.map((row) =>
            selectedColumns.map((colKey) => {
                let val = row[colKey];
                if (val === undefined || val === null) return "";
                // If it is a date column, format it
                if (metadata.dateColumns.includes(colKey)) {
                    val = formatDate(String(val));
                }
                // Escape commas and double quotes
                const stringVal = String(val).replace(/"/g, '""');
                return `"${stringVal}"`;
            }).join(",")
        );

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `bookings_report_${new Date().toISOString().split("T")[0]}.csv`);
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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden relative">
            {/* Print Specific CSS */}
            <style jsx global>{`
                @media print {
                    aside,
                    .no-print,
                    header,
                    .actions-header,
                    .pagination-footer {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    main {
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        color: black !important;
                    }
                    th {
                        background-color: #f3f4f6 !important;
                        color: black !important;
                        border-bottom: 2px solid #ddd !important;
                    }
                    td {
                        border-bottom: 1px solid #ddd !important;
                        color: black !important;
                    }
                }
            `}</style>

            {/* ── Sidebar ── */}
            <aside
                className={`no-print shrink-0 bg-[#111111] border-r border-[#232323] flex flex-col justify-between transition-all duration-300 ${
                    sidebarCollapsed ? "w-[64px]" : "w-[240px]"
                }`}
            >
                {/* Logo */}
                <div>
                    <div
                        className={`h-[60px] flex items-center border-b border-[#232323] ${
                            sidebarCollapsed ? "px-[18px]" : "px-[20px]"
                        }`}
                    >
                        {sidebarCollapsed ? (
                            <span className="text-[13px] font-black tracking-tight text-white">H</span>
                        ) : (
                            <h1 className="text-[14px] font-black tracking-tight text-white">HuemanAI</h1>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="px-3 pt-4 space-y-1">
                        {[
                            { icon: <LayoutDashboard size={16} />, label: "Dashboard", href: "/dashboard" },
                            { icon: <Phone size={16} />, label: "Calls", href: "/calls" },
                            { icon: <ClipboardList size={16} />, label: "Actions", href: "/actions" },
                            { icon: <TrendingUp size={16} />, label: "Insights", href: "/insights" },
                            { icon: <PhoneCall size={16} />, label: "Outbound", href: "/outbound" },
                            { icon: <FileBarChart2 size={16} />, label: "Reports", href: "/reports", active: true },
                            { icon: <Sparkles size={16} />, label: "Netra AI", subLabel: "Coming Soon", purple: true },
                            { icon: <Settings size={16} />, label: "Admin", href: "/admin" },
                        ].map((item) => {
                            const content = (
                                <>
                                    <span className={`shrink-0 ${item.purple ? "text-[#b158ff]" : ""}`}>
                                        {item.icon}
                                    </span>
                                    {!sidebarCollapsed && (
                                        <span className="leading-tight min-w-0">
                                            <span className="block text-[11px] font-semibold truncate">{item.label}</span>
                                            {item.subLabel && (
                                                <span className="block text-[9px] font-medium text-zinc-500 mt-0.5">
                                                    {item.subLabel}
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </>
                            );

                            const className = `w-full flex items-center gap-3 rounded-[8px] transition-colors text-left ${
                                sidebarCollapsed ? "h-[40px] px-[12px] justify-center" : "h-[44px] px-[12px]"
                            } ${
                                item.active
                                    ? "bg-[#2a2a2a] text-white"
                                    : "text-zinc-400 hover:bg-[#1a1a1a] hover:text-zinc-200"
                            }`;

                            if (item.href) {
                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        title={sidebarCollapsed ? item.label : undefined}
                                        className={className}
                                    >
                                        {content}
                                    </Link>
                                );
                            }

                            return (
                                <button
                                    key={item.label}
                                    title={sidebarCollapsed ? item.label : undefined}
                                    className={className}
                                    disabled={item.label === "Netra AI"}
                                >
                                    {content}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom */}
                <div className={`pb-5 ${sidebarCollapsed ? "px-3" : "px-4"}`}>
                    {!sidebarCollapsed && (
                        <>
                            <div className="flex items-center gap-3 mb-4 px-1">
                                <div className="w-7 h-7 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[10px] font-black shrink-0">
                                    F
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-[11px] leading-tight truncate">Fredrick</p>
                                    <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-[10px] transition-colors px-1 mb-5">
                                <LogOut size={13} />
                                Logout
                            </button>
                        </>
                    )}

                    {/* Collapse toggle */}
                    <button
                        onClick={() => setSidebarCollapsed((v) => !v)}
                        className={`flex items-center justify-center w-7 h-7 rounded-[6px] border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222] transition-colors text-zinc-500 hover:text-zinc-200 ${
                            sidebarCollapsed ? "mx-auto" : "ml-auto"
                        }`}
                    >
                        {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>
                </div>
            </aside>

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
                            <span className="text-white font-bold">Bookings Reports</span>
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
                            className="h-[36px] px-4 rounded-[8px] bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold text-[11px] flex items-center gap-2 transition-all cursor-pointer"
                        >
                            <Download size={13} />
                            Export CSV
                        </button>
                    </div>
                </div>

                {/* ── Split Layout Container ── */}
                <div className="flex-1 flex overflow-hidden min-h-0">
                    {/* ── Left Configuration Sidebar (Filter and Column Customizer) ── */}
                    <div className="no-print w-[300px] border-r border-[#161616] bg-[#0c0c0c] flex flex-col p-6 shrink-0 overflow-y-auto">
                        <h2 className="text-[14px] font-bold text-white mb-1">Configuration</h2>
                        <p className="text-zinc-500 text-[10px] mb-6">Customize columns, dates & filters</p>

                        {/* DATE RANGE FILTER BOX */}
                        <div className="mb-6 pb-6 border-b border-[#161616]">
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-[#f59e0b] tracking-wider uppercase mb-3">
                                <Calendar size={11} />
                                <span>Date Range</span>
                            </div>

                            {/* Date field picker dropdown */}
                            {metadata?.dateColumns && (
                                <div className="mb-3 relative">
                                    <select
                                        value={dateField}
                                        onChange={(e) => {
                                            setDateField(e.target.value);
                                            setPage(1);
                                        }}
                                        className="w-full bg-[#161616] border border-[#232323] rounded-[8px] text-[11px] p-2.5 text-zinc-300 font-semibold focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                                    >
                                        {metadata.dateColumns.map((colKey) => (
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
                                            className={`py-2 px-3 text-[10px] font-bold rounded-[8px] text-center transition-all ${
                                                active
                                                    ? "bg-[#251b14] border border-[#f59e0b]/50 text-white font-extrabold"
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
                                <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-[#1a1a1a]/50">
                                    <div>
                                        <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => {
                                                setCustomStartDate(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-full bg-[#161616] border border-[#232323] rounded-[6px] text-[10px] p-2 text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => {
                                                setCustomEndDate(e.target.value);
                                                setPage(1);
                                            }}
                                            className="w-full bg-[#161616] border border-[#232323] rounded-[6px] text-[10px] p-2 text-white focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COLUMN SELECTION TABS */}
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Tab Switcher Headers */}
                            <div className="flex border-b border-[#161616] mb-4 shrink-0">
                                <button
                                    onClick={() => setActiveTab("columns")}
                                    className={`pb-2.5 text-[11px] font-bold border-b-2 tracking-wide flex items-center gap-1.5 transition-all relative ${
                                        activeTab === "columns"
                                            ? "border-[#f59e0b] text-[#f59e0b]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Columns
                                    <span className="px-1.5 py-0.5 rounded-full bg-[#251b14] border border-[#f59e0b]/20 text-[9px] text-[#f59e0b] font-black">
                                        {selectedColumns.length}
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab("filters")}
                                    className={`ml-6 pb-2.5 text-[11px] font-bold border-b-2 tracking-wide transition-all ${
                                        activeTab === "filters"
                                            ? "border-[#f59e0b] text-[#f59e0b]"
                                            : "border-transparent text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    Filters
                                </button>
                            </div>

                            {/* Active Tab View */}
                            <div className="flex-1 overflow-y-auto pr-1">
                                {activeTab === "columns" ? (
                                    <div className="space-y-1">
                                        {metadata &&
                                            Object.entries(metadata.columns).map(([colKey, colInfo]) => {
                                                const checked = selectedColumns.includes(colKey);
                                                return (
                                                    <div
                                                        key={colKey}
                                                        onClick={() => toggleColumn(colKey)}
                                                        className={`w-full flex items-center justify-between p-2.5 rounded-[8px] cursor-pointer transition-colors ${
                                                            checked
                                                                ? "bg-[#111] hover:bg-[#151515]"
                                                                : "hover:bg-[#111]/50"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Custom Circle Checkbox */}
                                                            <div
                                                                className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                                                                    checked
                                                                        ? "border-[#f59e0b] bg-[#f59e0b] text-black"
                                                                        : "border-zinc-700 bg-transparent text-transparent"
                                                                }`}
                                                            >
                                                                {checked && <Check size={10} strokeWidth={4} />}
                                                            </div>

                                                            <span
                                                                className={`text-[11px] font-semibold transition-all ${
                                                                    checked ? "text-zinc-100" : "text-zinc-400"
                                                                }`}
                                                            >
                                                                {colInfo.label}
                                                            </span>
                                                        </div>

                                                        {/* Data Type Indicator Badge */}
                                                        <span className="text-[8px] font-black text-zinc-600 tracking-wider uppercase">
                                                            {colInfo.type}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-[11px] text-zinc-500 italic">No custom filters active.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Content Area: Main Booking Report Preview Table ── */}
                    <div className="flex-1 flex flex-col p-[32px] overflow-y-auto min-h-0 bg-[#070707]">
                        {/* Error Alert Box */}
                        {error && (
                            <div className="no-print p-4 bg-red-950/20 border border-red-800/30 rounded-[12px] mb-6 flex items-start gap-3">
                                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                                <div className="text-[11px]">
                                    <p className="font-bold text-red-200">Error Encountered</p>
                                    <p className="text-red-400/90 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Report Container Box */}
                        <div className="flex-1 flex flex-col border border-[#161616] rounded-[12px] bg-[#0f0f0f] overflow-hidden min-h-0">
                            {/* Table Header Filter / Title / Search Controls */}
                            <div className="no-print p-6 border-b border-[#161616] flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-[42px] h-[42px] rounded-[10px] bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                                        <Calendar size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-[14px] font-bold text-white">Booking Report Preview</h3>
                                        <p className="text-[#f59e0b] text-[10px] font-bold mt-0.5">
                                            {loading && !reportData ? (
                                                <span className="flex items-center gap-1.5">
                                                    <Loader2 className="animate-spin" size={10} />
                                                    Checking database...
                                                </span>
                                            ) : (
                                                `${reportData?.total || 0} reservations found`
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
                                        className="w-full bg-[#161616] border border-[#232323] rounded-[8px] pl-9 pr-4 py-2.5 text-[11px] placeholder-zinc-500 text-white font-semibold focus:outline-none focus:border-amber-500/50"
                                    />
                                    <Search size={12} className="absolute left-3 top-3.5 text-zinc-500" />
                                </div>
                            </div>

                            {/* Responsive Table Scroll Container */}
                            <div className="flex-1 overflow-auto min-h-0 relative">
                                {loading && (
                                    <div className="no-print absolute inset-0 bg-[#0f0f0f]/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 className="animate-spin text-[#f59e0b]" size={32} />
                                            <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">Syncing records...</span>
                                        </div>
                                    </div>
                                )}

                                <table className="w-full border-collapse text-left">
                                    {/* Warm Deep Bronze Header matching custom preview design */}
                                    <thead className="bg-[#20150e] border-b border-[#f59e0b]/10 sticky top-0 z-1">
                                        <tr>
                                            {selectedColumns.map((colKey) => (
                                                <th
                                                    key={colKey}
                                                    className="px-6 py-4 text-[9px] font-black tracking-wider text-zinc-300 uppercase select-none border-b border-[#281c12]"
                                                >
                                                    {metadata?.columns[colKey]?.label || colKey}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#181818]/60 text-[11px]">
                                        {reportData && reportData.data.length > 0 ? (
                                            reportData.data.map((row, rowIndex) => (
                                                <tr
                                                    key={rowIndex}
                                                    className="hover:bg-[#161616]/40 transition-colors"
                                                >
                                                    {selectedColumns.map((colKey) => {
                                                        const val = row[colKey];
                                                        const isDate = metadata?.dateColumns?.includes(colKey);

                                                        // Customer name column gets initials avatar bubble
                                                        if (colKey === "customer_name") {
                                                            const nameStr = String(val || "-");
                                                            return (
                                                                <td key={colKey} className="px-6 py-4 border-b border-[#161616]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div
                                                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${getAvatarStyle(
                                                                                nameStr
                                                                            )}`}
                                                                        >
                                                                            {getInitials(nameStr)}
                                                                        </div>
                                                                        <span className="font-bold text-white">{nameStr}</span>
                                                                    </div>
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td
                                                                key={colKey}
                                                                className={`px-6 py-4 border-b border-[#161616] ${
                                                                    colKey === "covers" ? "font-bold text-[#f59e0b]" : "text-zinc-300 font-semibold"
                                                                }`}
                                                            >
                                                                {isDate ? formatDate(String(val)) : String(val === undefined || val === null ? "-" : val)}
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
                                                    {!loading && "No matching reservations found."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination and Rows Count Footer */}
                            {reportData && (
                                <div className="no-print px-6 py-4 border-t border-[#161616] bg-[#0c0c0c] flex items-center justify-between shrink-0 pagination-footer text-[10px] text-zinc-400 font-bold select-none">
                                    <div>
                                        Showing{" "}
                                        <span className="text-white">
                                            {Math.min((page - 1) * pageSize + 1, reportData.total)}
                                        </span>{" "}
                                        –{" "}
                                        <span className="text-white">
                                            {Math.min(page * pageSize, reportData.total)}
                                        </span>{" "}
                                        of <span className="text-[#f59e0b] font-black">{reportData.total}</span> results
                                    </div>

                                    {/* Rows Count Page Selector */}
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
                                                    className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${
                                                        pageSize === size
                                                            ? "bg-[#f59e0b] text-black"
                                                            : "bg-[#161616] text-zinc-400 hover:text-zinc-200 border border-[#232323]"
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Pagination Button Navigation */}
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
                                                        className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                                                            active
                                                                ? "bg-[#f59e0b] text-black font-extrabold"
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
