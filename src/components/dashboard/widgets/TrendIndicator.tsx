"use client";

import {
    TrendingUp,
    TrendingDown,
    Minus,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
    value?: number;
    size?: "sm" | "md";
    showIcon?: boolean;
    invert?: boolean;
};

export default function TrendIndicator({
                                           value = 0,
                                           size = "sm",
                                           showIcon = true,
                                           invert = false,
                                       }: Props) {
    const normalized = invert
        ? value * -1
        : value;

    const positive = normalized > 0;
    const negative = normalized < 0;
    const neutral = normalized === 0;

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-lg font-medium",
                size === "sm"
                    ? "gap-1 px-2 py-1 text-xs"
                    : "gap-1.5 px-2.5 py-1.5 text-sm",

                positive &&
                "bg-emerald-500/10 text-emerald-500",

                negative &&
                "bg-red-500/10 text-red-500",

                neutral &&
                "bg-secondary text-muted-foreground"
            )}
        >
            {showIcon && (
                <>
                    {positive && (
                        <TrendingUp
                            className={cn(
                                size === "sm"
                                    ? "h-3 w-3"
                                    : "h-4 w-4"
                            )}
                        />
                    )}

                    {negative && (
                        <TrendingDown
                            className={cn(
                                size === "sm"
                                    ? "h-3 w-3"
                                    : "h-4 w-4"
                            )}
                        />
                    )}

                    {neutral && (
                        <Minus
                            className={cn(
                                size === "sm"
                                    ? "h-3 w-3"
                                    : "h-4 w-4"
                            )}
                        />
                    )}
                </>
            )}

            <span>
        {Math.abs(value).toFixed(1)}%
      </span>
        </div>
    );
}