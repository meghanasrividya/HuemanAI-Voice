"use client";

import { TrendingUp, Lightbulb, Bot, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type InsightsTab = "revenue" | "bot" | "recommendations" | "patterns";

type TabDef = {
    id: InsightsTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    activeColor: string;
    activeBg: string;
    countKey: InsightsTab;
};

const TABS: TabDef[] = [
    {
        id: "revenue",
        label: "Revenue Insights",
        shortLabel: "Revenue",
        icon: TrendingUp,
        activeColor: "text-[#2dd4bf]",
        activeBg: "bg-[#072421]",
        countKey: "revenue",
    },
    {
        id: "recommendations",
        label: "Recommendations",
        shortLabel: "Suggest",
        icon: Lightbulb,
        activeColor: "text-[#eab308]",
        activeBg: "bg-[#eab308]/10",
        countKey: "recommendations",
    },
];

type Props = {
    activeTab: InsightsTab;
    onTabChange: (tab: InsightsTab) => void;
    counts: Record<InsightsTab, number>;
};

export default function InsightsFilters({ activeTab, onTabChange, counts }: Props) {
    return (
        <div className="flex w-full flex-wrap gap-1 rounded-xl border border-zinc-900 bg-[#0b0b0d] p-1.5">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex flex-1 sm:flex-none items-center justify-center sm:justify-start gap-3 rounded-lg px-5 py-3 text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer border border-transparent",
                            active
                                ? "bg-[#1d1d22] border-zinc-800/40 shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-zinc-900/30"
                        )}
                    >
                        <Icon
                            className={cn(
                                "h-5 w-5 shrink-0",
                                active ? tab.activeColor : "text-zinc-500"
                            )}
                        />
                        <span className={cn("hidden sm:inline", active ? tab.activeColor : "")}>
                            {tab.label}
                        </span>
                        <span className={cn("sm:hidden", active ? tab.activeColor : "")}>
                            {tab.shortLabel}
                        </span>
                        {counts[tab.id] > 0 && (
                            <span
                                className={cn(
                                    "inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                    active
                                        ? cn(tab.activeBg, tab.activeColor)
                                        : "bg-zinc-900 text-zinc-500"
                                )}
                            >
                                {counts[tab.id]}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
