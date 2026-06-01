"use client";

import React from "react";
import Link from "next/link";

import {
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
    return (
        <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
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
                                        style={{ color: report.color }}
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
                                    style={{ color: report.color }}
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

                        return <div key={report.title}>{cardBody}</div>;
                    })}
                </div>
            </div>
        </div>
    );
}
