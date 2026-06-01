"use client";

import React, { useState } from "react";
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
    BedDouble,
    MessageSquare,
    ClipboardCheck,
    Ticket,
} from "lucide-react";

const reports = [
    {
        title: "Bookings Data",
        description:
            "Detailed logs of all reservations captured through the AI, complete with party sizes, dates, and locations.",
        color: "#f59e0b",
        iconBg: "bg-amber-500/10",
        border: "border-amber-500/20",
        icon: <BedDouble size={18} />,
        href: "/reports/bookings",
    },

    {
        title: "Feedback Logs",
        description:
            "A comprehensive dataset of customer feedback, ratings, and sentiments collected via post-visit SMS.",
        color: "#10b981",
        iconBg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        icon: <MessageSquare size={18} />,
        href: "/reports/feedback",
    },

    {
        title: "Action Center Logs",
        description:
            "Explore customer requests and inquiries captured from calls, track status, priority, and resolution info.",
        color: "#2563eb",
        iconBg: "bg-blue-500/10",
        border: "border-blue-500/20",
        icon: <ClipboardCheck size={18} />,
        href: "/reports/actions",
    },

    {
        title: "Coupons Report",
        description:
            "Track all issued feedback coupons, redemption status, validity periods, and customer details.",
        color: "#9333ea",
        iconBg: "bg-purple-500/10",
        border: "border-purple-500/20",
        icon: <Ticket size={18} />,
        href: "/reports/coupons",
    },
];

export default function ReportsPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
            {/* ── Sidebar ── */}
            <aside
                className={`shrink-0 bg-[#111111] border-r border-[#232323] flex flex-col justify-between transition-all duration-300 ${sidebarCollapsed ? "w-[64px]" : "w-[240px]"
                    }`}
            >
                {/* Logo */}
                <div>
                    <div
                        className={`h-[60px] flex items-center border-b border-[#232323] ${sidebarCollapsed ? "px-[18px]" : "px-[20px]"
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

                            const className = `w-full flex items-center gap-3 rounded-[8px] transition-colors text-left ${sidebarCollapsed ? "h-[40px] px-[12px] justify-center" : "h-[44px] px-[12px]"
                                } ${item.active
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
                        className={`flex items-center justify-center w-7 h-7 rounded-[6px] border border-[#2a2a2a] bg-[#1a1a1a] hover:bg-[#222] transition-colors text-zinc-500 hover:text-zinc-200 ${sidebarCollapsed ? "mx-auto" : "ml-auto"
                            }`}
                    >
                        {sidebarCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                    </button>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto bg-[#0a0a0a] min-w-0">
                <div className="w-full px-[32px] pt-[32px] pb-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-[28px] font-bold tracking-tight mb-1.5 text-white">
                            Reports
                        </h1>

                        <p className="text-zinc-400 text-[13px] tracking-wide">
                            Generate, view, and export detailed reports for your organization.
                        </p>
                    </div>

                    {/* Reports Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                        {reports.map((report) => {
                            const cardBody = (
                                <div
                                    className={`bg-[#0f0f0f] border ${report.border}
                                        rounded-[12px] p-5 h-full
                                        flex flex-col justify-between
                                        transition-all duration-300
                                        hover:border-white/20 hover:-translate-y-1`}
                                >
                                    <div>
                                        {/* Icon */}
                                        <div
                                            className={`w-[42px] h-[42px]
                                                rounded-[10px]
                                                flex items-center justify-center
                                                mb-6 ${report.iconBg}`}
                                            style={{
                                                color: report.color,
                                            }}
                                        >
                                            {report.icon}
                                        </div>

                                        {/* Title */}
                                        <h2 className="text-[16px] font-bold leading-tight mb-2 text-white">
                                            {report.title}
                                        </h2>

                                        {/* Description */}
                                        <p className="text-zinc-400 text-[11px] leading-[18px]">
                                            {report.description}
                                        </p>
                                    </div>

                                    {/* Button */}
                                    <div
                                        className="mt-6 text-[11px] font-bold
                                            flex items-center gap-1.5
                                            transition-opacity hover:opacity-80"
                                        style={{
                                            color: report.color,
                                        }}
                                    >
                                        Build Report
                                        <span>→</span>
                                    </div>
                                </div>
                            );

                            if (report.href) {
                                return (
                                    <Link key={report.title} href={report.href} className="block cursor-pointer">
                                        {cardBody}
                                    </Link>
                                );
                            }

                            return (
                                <div key={report.title}>
                                    {cardBody}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}