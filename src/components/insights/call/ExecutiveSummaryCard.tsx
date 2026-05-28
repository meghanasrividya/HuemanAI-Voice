"use client";
 
import { ExecutiveSummary } from "@/components/insights/types";
import { motion } from "framer-motion";
import { AlertTriangle, Siren, Target, PoundSterling } from "lucide-react";
import {
    DEFAULT_DISPLAY_TIMEZONE,
    formatDateInTimezone,
    parseTimestampAsUtc,
} from "@/lib/date/dateUtils";

type Props = ExecutiveSummary & {
    periodStart: string;
    periodEnd: string;
};

export default function ExecutiveSummaryCard({
    criticalFinding,
    revenueImpact,
    immediateAction,
    periodStart,
    periodEnd,
}: Props) {
    const formatDate = (value: string) =>
        formatDateInTimezone(
            parseTimestampAsUtc(value),
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            },
            DEFAULT_DISPLAY_TIMEZONE
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden rounded-2xl border border-[#1e1e24] bg-[#0b0b0d] p-6 sm:p-8"
        >
            <div className="relative flex flex-col gap-5">
                
                {/* Executive Summary Header */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-1">
                    <span className="inline-flex items-center rounded-full bg-[#072421] border border-[#0d3d37] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#2dd4bf]">
                        <AlertTriangle className="mr-1.5 h-3.5 w-3.5 text-[#eab308] fill-[#eab308]/10" />
                        Executive Summary
                    </span>

                    <span className="text-xs font-semibold text-zinc-400">
                        {formatDate(periodStart)} — {formatDate(periodEnd)}
                    </span>
                </div>

                {/* Critical Finding Section */}
                <div className="space-y-2.5">
                    <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[#2dd4bf]">
                        <Siren className="mr-1.5 h-3.5 w-3.5 text-[#2dd4bf]" />
                        Critical Finding
                    </span>

                    <h2 className="text-lg sm:text-xl font-bold leading-relaxed text-white select-text">
                        {criticalFinding}
                    </h2>
                </div>

                {/* Sub-cards Grid */}
                <div className="grid gap-5 sm:grid-cols-2 pt-2">
                    {/* Revenue Impact */}
                    <div className="rounded-xl border border-[#18181b] bg-[#08080a] p-5 space-y-3 transition-all hover:border-zinc-800/80">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eab308]/10 border border-[#eab308]/20">
                                <PoundSterling className="h-3.5 w-3.5 text-[#eab308]" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                                Revenue Impact
                            </h4>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 select-text">
                            {revenueImpact}
                        </p>
                    </div>

                    {/* Immediate Action */}
                    <div className="rounded-xl border border-[#1e1e24] bg-[#161618] p-5 space-y-3 transition-all hover:border-zinc-700/80">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#18181b] border border-zinc-800/80">
                                <Target className="h-3.5 w-3.5 text-zinc-300" />
                            </div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2dd4bf]">
                                Immediate Action
                            </h4>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-zinc-400 select-text">
                            {immediateAction}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}