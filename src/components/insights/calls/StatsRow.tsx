"use client";

import {motion} from "framer-motion";
import {
    Phone,
    CalendarCheck,
    TrendingUp,
    ArrowRightLeft,
    MessageSquare,
    Users,
} from "lucide-react";

type Stats = {
    totalCalls?: number;
    successfulBookings?: number;
    conversionRate?: number;
    transferRate?: number;
    voicemailRate?: number;
    totalCoversBooked?: number;
};

type Props = {
    stats: Stats;
    botName?: string;
    mode?: string;
};

const cards = [
    {
        key: "totalCalls",
        label: "Total Calls",
        icon: Phone,
        format: (v: number = 0) => v.toString(),
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        key: "successfulBookings",
        label: "Bookings Made",
        icon: CalendarCheck,
        format: (v: number = 0) => v.toString(),
        color: "text-green-500",
        bg: "bg-green-500/10",
    },
    {
        key: "conversionRate",
        label: "Conversion Rate",
        icon: TrendingUp,
        format: (v: number = 0) => `${v.toFixed(1)}%`,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    },
    {
        key: "transferRate",
        label: "Transfer Rate",
        icon: ArrowRightLeft,
        format: (v: number = 0) => `${v.toFixed(1)}%`,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
    {
        key: "voicemailRate",
        label: "Voicemail Rate",
        icon: MessageSquare,
        format: (v: number = 0) => `${v.toFixed(1)}%`,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
    {
        key: "totalCoversBooked",
        label: "Covers Booked",
        icon: Users,
        format: (v: number = 0) => v.toString(),
        color: "text-purple-500",
        bg: "bg-purple-500/10",
    },
];

export default function StatsRow({stats, botName, mode}: Props) {
    const feedbackMode =
        mode === "feedback" ||
        (mode !== "reservation" &&
            botName?.toLowerCase().includes("feedback")) ||
        (typeof stats.voicemailRate === "number" &&
            stats.voicemailRate > 0);

    const reservationMode = !feedbackMode;

    const filtered = cards.filter((card) => {
        if (card.key === "transferRate") return reservationMode;
        if (card.key === "voicemailRate") return feedbackMode;
        return true;
    });

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {filtered.map((card, index) => {
                const Icon = card.icon;

                return (
                    <motion.div
                        key={card.key}
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        transition={{duration: 0.4, delay: index * 0.08}}
                        className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:border-border/80 hover:shadow-sm"
                    >
                        <div
                            className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-primary/3 blur-2xl transition-colors group-hover:bg-primary/5"/>

                        <div className="relative">
                            <div className="mb-3 flex items-center gap-2">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}
                                >
                                    <Icon className={`h-4 w-4 ${card.color}`}/>
                                </div>
                            </div>

                            <p className="text-2xl font-bold tracking-tight text-foreground">
                                {card.format(stats[card.key as keyof Stats] as number)}
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                                {card.label}
                            </p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}