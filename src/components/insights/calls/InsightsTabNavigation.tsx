
"use client";

import { TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "revenue" | "recommendations";

type Props = {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  revenueCount: number;
  recommendationCount: number;
};

const tabs = [
  {
    id: "revenue",
    label: "Revenue Insights",
    icon: TrendingUp,
  },
  {
    id: "recommendations",
    label: "Recommendations",
    icon: Lightbulb,
  },
] as const;

export default function InsightsTabNavigation({
  activeTab,
  onTabChange,
  revenueCount,
  recommendationCount,
}: Props) {
  const counts = {
    revenue: revenueCount,
    recommendations: recommendationCount,
  };

  return (
    <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-1.5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                active
                  ? tab.id === "recommendations"
                    ? "text-amber-500"
                    : "text-teal-600 dark:text-teal-400"
                  : ""
              )}
            />

            <span
              className={cn(
                "hidden sm:inline",
                active
                  ? tab.id === "recommendations"
                    ? "font-semibold text-amber-700 dark:text-amber-400"
                    : "section-heading-gradient font-semibold"
                  : ""
              )}
            >
              {tab.label}
            </span>

            <span
              className={cn(
                "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                active
                  ? tab.id === "recommendations"
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-teal-500/10 text-teal-700 dark:text-teal-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {counts[tab.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
