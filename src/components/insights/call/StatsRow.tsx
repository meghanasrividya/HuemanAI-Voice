"use client";

import { CallStatistics } from "@/components/insights/types";
import { motion } from "framer-motion";
import {
    Phone,
    CalendarCheck,
    TrendingUp,
    ArrowRightLeft,
    Users,
    VoicemailIcon,
} from "lucide-react";

type Props = {
    stats: CallStatistics;
    botName?: string;
    mode?: string;
};

type StatCard = {
    key: keyof CallStatistics;
    label: string;
    icon: React.ElementType;
    format: (v: number | string | undefined) => string;
    iconColor: string;
    iconBg: string;
};

const RESERVATION_CARDS: StatCard[] = [
    {
        key: "totalCalls",
        label: "Total Calls",
        icon: Phone,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#3b82f6]",
        iconBg: "bg-[#3b82f6]/10 border border-[#3b82f6]/15",
    },
    {
        key: "successfulBookings",
        label: "Bookings Made",
        icon: CalendarCheck,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#10b981]",
        iconBg: "bg-[#10b981]/10 border border-[#10b981]/15",
    },
    {
        key: "conversionRate",
        label: "Conversion Rate",
        icon: TrendingUp,
        format: (v) => `${(v as number ?? 0).toFixed(1)}%`,
        iconColor: "text-[#0d9488]",
        iconBg: "bg-[#0d9488]/10 border border-[#0d9488]/15",
    },
    {
        key: "transferRate",
        label: "Transfer Rate",
        icon: ArrowRightLeft,
        format: (v) => `${(v as number ?? 0).toFixed(1)}%`,
        iconColor: "text-[#f97316]",
        iconBg: "bg-[#f97316]/10 border border-[#f97316]/15",
    },
    {
        key: "totalCoversBooked",
        label: "Covers Booked",
        icon: Users,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#a855f7]",
        iconBg: "bg-[#a855f7]/10 border border-[#a855f7]/15",
    },
];

const FEEDBACK_CARDS: StatCard[] = [
    {
        key: "totalCalls",
        label: "Total Calls",
        icon: Phone,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#3b82f6]",
        iconBg: "bg-[#3b82f6]/10 border border-[#3b82f6]/15",
    },
    {
        key: "successfulBookings",
        label: "Re-Bookings",
        icon: CalendarCheck,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#10b981]",
        iconBg: "bg-[#10b981]/10 border border-[#10b981]/15",
    },
    {
        key: "conversionRate",
        label: "Conversion Rate",
        icon: TrendingUp,
        format: (v) => `${(v as number ?? 0).toFixed(1)}%`,
        iconColor: "text-[#0d9488]",
        iconBg: "bg-[#0d9488]/10 border border-[#0d9488]/15",
    },
    {
        key: "voicemailRate",
        label: "Voicemail Rate",
        icon: VoicemailIcon,
        format: (v) => `${(v as number ?? 0).toFixed(1)}%`,
        iconColor: "text-[#f97316]",
        iconBg: "bg-[#f97316]/10 border border-[#f97316]/15",
    },
    {
        key: "totalCoversBooked",
        label: "Covers Booked",
        icon: Users,
        format: (v) => String(v ?? 0),
        iconColor: "text-[#a855f7]",
        iconBg: "bg-[#a855f7]/10 border border-[#a855f7]/15",
    },
];

export default function StatsRow({ stats, botName, mode }: Props) {
    const isFeedback =
        mode === "feedback" ||
        (mode !== "reservation" &&
            botName?.toLowerCase().includes("feedback"));

    const cards = isFeedback ? FEEDBACK_CARDS : RESERVATION_CARDS;

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cards.map((card, index) => {
                const Icon = card.icon;
                
                // Read value with robust fallback for different potential API names (e.g. successfulBookings, covers)
                let rawValue = stats[card.key];
                if (rawValue === undefined || rawValue === null) {
                    if (card.key === "successfulBookings") {
                        rawValue = (stats as any).bookingsMade || (stats as any).bookings;
                    } else if (card.key === "totalCoversBooked") {
                        rawValue = (stats as any).coversBooked || (stats as any).covers;
                    }
                }

                return (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="relative overflow-hidden rounded-xl border border-[#1e1e24] bg-[#161618] p-5 transition-all duration-300 hover:border-zinc-700/80"
                    >
                        <div className="relative flex flex-col items-start gap-4">
                            {/* Premium circular colored badge for icon */}
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${card.iconBg}`}
                            >
                                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
                            </div>

                            <div className="space-y-0.5">
                                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                                    {card.format(rawValue as any)}
                                </h3>

                                <p className="text-sm font-semibold text-[#71717a] tracking-wide">
                                    {card.label}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}