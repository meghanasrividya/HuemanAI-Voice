"use client";

import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle } from "lucide-react";
import { CallPatternData } from "@/components/insights/types";
import { cn } from "@/lib/utils";

// Custom premium tooltip matching the screenshot exactly
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#18181b] border border-zinc-800 rounded-lg p-2.5 shadow-xl text-xs space-y-1">
                <p className="font-semibold text-zinc-100 mb-1">{label}</p>
                {payload.map((p: any) => (
                    <div key={p.name} className="flex items-center justify-between gap-4">
                        <span className="text-zinc-400">{p.name} :</span>
                        <span className={cn("font-bold", p.name === "Bookings" ? "text-emerald-400" : "text-zinc-200")}>
                            {p.value}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const AXIS_STYLE = {
    fontSize: 10,
    fill: "#a1a1aa", // text-zinc-400
};

function shortHour(h: number | string): string {
    if (typeof h === "number") {
        const ampm = h < 12 ? "am" : "pm";
        return `${h === 0 ? 12 : h > 12 ? h - 12 : h}${ampm}`;
    }
    const start = String(h).split("-")[0].split(":")[0];
    const num = parseInt(start, 10);
    if (isNaN(num)) return String(h);
    const ampm = num < 12 ? "am" : "pm";
    return `${num === 0 ? 12 : num > 12 ? num - 12 : num}${ampm}`;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-[#1e1e24] bg-[#121214]/30 p-4 sm:p-5">
            <h3 className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
                {title}
            </h3>
            {children}
        </div>
    );
}

type Props = {
    patterns: CallPatternData;
};

export default function InsightsCharts({ patterns }: Props) {
    const [open, setOpen] = useState(false);

    // Compute max party size count for scaling the horizontal bars
    const maxPartySizeCount = Math.max(...(patterns.byPartySize || []).map((p) => p.count), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-xl border border-[#1e1e24] bg-[#161618] transition-all"
        >
            {/* Header Button row (Collapsible Panel) */}
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "group flex w-full items-center justify-between p-4 sm:p-5 text-left transition-colors cursor-pointer",
                    !open && "hover:bg-[#1e1e24]"
                )}
            >
                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#2dd4bf]">
                    Call Patterns & Analytics
                </span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-[#1e1e24] p-4 sm:p-5 space-y-6 sm:space-y-8">
                            {/* Row 1: Charts */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
                                {/* Day of Week */}
                                <ChartCard title="Calls by Day of Week">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={patterns.byDayOfWeek}
                                            barGap={3}
                                            barSize={8}
                                            margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
                                        >
                                            <XAxis 
                                                dataKey="day" 
                                                tickFormatter={(v) => v.slice(0, 3)} 
                                                tick={AXIS_STYLE} 
                                                axisLine={false} 
                                                tickLine={false} 
                                            />
                                            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e1e24", opacity: 0.3 }} />
                                            <Bar dataKey="count" name="Total Calls" fill="#d1d5db" radius={[2, 2, 0, 0]} />
                                            <Bar dataKey="bookings" name="Bookings" fill="#10b981" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>

                                {/* Hour of Day */}
                                <ChartCard title="Calls by Hour of Day">
                                    <ResponsiveContainer width="100%" height={180}>
                                        <BarChart
                                            data={patterns.byHourOfDay.map((p) => ({
                                                ...p,
                                                label: shortHour(p.hour),
                                            }))}
                                            barGap={3}
                                            barSize={6}
                                            margin={{ top: 10, right: 4, left: -24, bottom: 0 }}
                                        >
                                            <XAxis dataKey="label" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                                            <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e1e24", opacity: 0.3 }} />
                                            <Bar dataKey="count" name="Total Calls" fill="#d1d5db" radius={[2, 2, 0, 0]} />
                                            <Bar dataKey="bookings" name="Bookings" fill="#10b981" radius={[2, 2, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartCard>
                            </div>

                            {/* Row 2: Top Questions Asked */}
                            {patterns.topQuestions && patterns.topQuestions.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
                                        Top Questions Asked
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {patterns.topQuestions.map((item) => (
                                            <div 
                                                key={item.question}
                                                className="flex items-center gap-3 rounded-lg border border-[#1e1e24] bg-[#111113] p-3 px-4"
                                            >
                                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-sm font-medium text-zinc-100 truncate">
                                                        {item.question}
                                                    </h4>
                                                    <p className="text-xs text-zinc-400 mt-0.5">
                                                        {item.count}x · Answered
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Row 3: Bookings by Party Size & Special Requests */}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Bookings by Party Size */}
                                {patterns.byPartySize && patterns.byPartySize.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
                                            Bookings by Party Size
                                        </h3>
                                        <div className="space-y-2">
                                            {patterns.byPartySize.map((item) => (
                                                <div key={item.size} className="flex items-center gap-3 text-xs sm:text-sm">
                                                    <span className="w-6 font-medium text-zinc-300 shrink-0">
                                                        {item.size}
                                                    </span>
                                                    <div className="h-3 flex-1 rounded-full bg-zinc-950/40 border border-[#1e1e24] overflow-hidden relative">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(item.count / maxPartySizeCount) * 100}%` }}
                                                            transition={{ duration: 0.6, ease: "easeOut" }}
                                                            className="h-full rounded-full bg-blue-500"
                                                        />
                                                    </div>
                                                    <span className="w-6 text-right font-semibold text-zinc-400 shrink-0">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Top Special Requests */}
                                {patterns.topSpecialRequests && patterns.topSpecialRequests.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">
                                            Top Special Requests
                                        </h3>
                                        <div className="divide-y divide-[#1e1e24]/40">
                                            {patterns.topSpecialRequests.map((item) => (
                                                <div 
                                                    key={item.request} 
                                                    className="flex items-center justify-between text-xs sm:text-sm py-2.5 first:pt-0 last:pb-0"
                                                >
                                                    <span className="font-medium text-zinc-200">
                                                        {item.request}
                                                    </span>
                                                    <span className="font-bold text-zinc-400">
                                                        {item.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
