"use client";

import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTION_STATUS_LABELS } from "@/lib/actions/constants";

export function ActionStatusBadge({ status, className, showChevron }: { status: string; className?: string; showChevron?: boolean }) {
    const colorMap: Record<string, string> = {
        open: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
        in_progress: "border-blue-500/50 text-blue-500 bg-blue-500/10",
        waiting_on_guest: "border-amber-500/50 text-amber-500 bg-amber-500/10",
        resolved: "border-slate-400/50 text-slate-400 bg-slate-400/10",
    };
    return (
        <Badge variant="outline" className={cn("text-xs gap-1", colorMap[status] || "border-border", className)}>
            {(ACTION_STATUS_LABELS as any)[status] || status}
            {showChevron && <ChevronDown className="h-3 w-3" />}
        </Badge>
    );
}

export function ActionPriorityBadge({ priority }: { priority: string }) {
    const colorMap: Record<string, string> = {
        high: "border-red-500/50 text-red-500 bg-red-500/10",
        medium: "border-amber-500/50 text-amber-500 bg-amber-500/10",
        low: "border-slate-400/50 text-slate-400 bg-slate-400/10",
    };
    return (
        <Badge variant="outline" className={cn("text-xs capitalize", colorMap[priority] || "border-border")}>
            {priority}
        </Badge>
    );
}
