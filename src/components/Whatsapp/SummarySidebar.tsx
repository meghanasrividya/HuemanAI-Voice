"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import { Sparkles } from "lucide-react";
import { RefreshCw } from "lucide-react";
import { Bot } from "lucide-react";

import { cn } from "@/lib/utils";

const outcomeColors: Record<string, string> = {
    "Booking Made":
        "bg-green-500/10 border-green-500/30 text-green-400",

    "Booking Amended":
        "bg-blue-500/10 border-blue-500/30 text-blue-400",

    "Booking Cancelled":
        "bg-red-500/10 border-red-500/30 text-red-400",

    "Enquiry Resolved":
        "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
};

export default function SummarySidebar({
                                           summary,
                                           isLoading,
                                           isError,
                                           onRefresh,
                                       }: any) {
    return (
        <aside className="w-full flex flex-col bg-card lg:border-l border-border overflow-y-auto">
            <div className="sticky top-0 z-10 px-6 py-5 bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center border border-border">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>

                    <h2 className="text-[15px] font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Summary
                    </h2>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRefresh}
                    className="h-9 w-9 rounded-full"
                >
                    <RefreshCw
                        className={cn(
                            "w-4 h-4",
                            isLoading && "animate-spin"
                        )}
                    />
                </Button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-6">
                {isLoading && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center gap-2 py-4 text-xs font-medium text-primary bg-primary/5 rounded-2xl border border-primary/10">
                            <Bot className="w-4 h-4 animate-bounce" />

                            <span>
                Analyzing conversation...
              </span>
                        </div>

                        <Skeleton className="h-24 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                )}

                {!isLoading && isError && (
                    <div className="text-sm text-red-400">
                        Failed to load analysis.
                    </div>
                )}

                {!isLoading && summary && (
                    <div className="space-y-6">
                        {summary.call_outcome && (
                            <div className="bg-secondary/50 p-4 rounded-2xl border border-border">
                                <p className="text-xs uppercase tracking-wider text-indigo-400 mb-2">
                                    Outcome
                                </p>

                                <div
                                    className={cn(
                                        "p-3 rounded-xl border text-center text-sm font-semibold",
                                        outcomeColors[
                                            summary.call_outcome
                                            ]
                                    )}
                                >
                                    {summary.call_outcome}
                                </div>
                            </div>
                        )}

                        {summary.sentiment_meter !==
                            undefined && (
                                <div className="bg-secondary/50 p-4 rounded-2xl border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs uppercase tracking-wider text-orange-400">
                                            Sentiment
                                        </p>

                                        <span className="text-xs font-bold">
                    {Math.round(
                        summary.sentiment_meter *
                        100
                    )}
                                            %
                  </span>
                                    </div>

                                    <Progress
                                        value={
                                            summary.sentiment_meter *
                                            100
                                        }
                                    />
                                </div>
                            )}

                        {summary.summary?.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs uppercase tracking-wider text-amber-500">
                                    Key Takeaways
                                </p>

                                <ul className="space-y-2">
                                    {summary.summary.map(
                                        (
                                            item: string,
                                            index: number
                                        ) => (
                                            <li
                                                key={index}
                                                className="text-sm text-foreground"
                                            >
                                                • {item}
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                        {summary.key_entities?.length >
                            0 && (
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-wider text-purple-400">
                                        Detected Entities
                                    </p>

                                    <div className="flex flex-wrap gap-2">
                                        {summary.key_entities.map(
                                            (
                                                entity: any,
                                                index: number
                                            ) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                >
                                                    {entity.value}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </aside>
    );
}