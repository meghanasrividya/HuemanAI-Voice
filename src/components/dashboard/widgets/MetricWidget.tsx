"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";

import TrendIndicator from "./TrendIndicator";

import { cn } from "@/lib/utils";

type Props = {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: number;
    footer?: ReactNode;
    className?: string;
    valueClassName?: string;
    onClick?: () => void;
};

export default function MetricWidget({
                                         label,
                                         value,
                                         icon,
                                         trend,
                                         footer,
                                         className,
                                         valueClassName,
                                         onClick,
                                     }: Props) {
    return (
        <motion.div
            whileHover={{
                y: -2,
            }}
            transition={{
                duration: 0.2,
            }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-premium-sm",
                onClick &&
                "cursor-pointer hover:border-border/80",
                className
            )}
        >
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-transparent" />

            <div className="relative flex h-full flex-col">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">
                            {label}
                        </p>

                        <div
                            className={cn(
                                "mt-3 text-3xl font-semibold tracking-tight text-foreground tabular-nums",
                                valueClassName
                            )}
                        >
                            {value}
                        </div>
                    </div>

                    {icon && (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/60">
                            {icon}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-auto pt-5 flex items-center justify-between gap-3">
                    {trend !== undefined ? (
                        <TrendIndicator
                            value={trend}
                        />
                    ) : (
                        <div />
                    )}

                    {footer && (
                        <div className="text-xs text-muted-foreground">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}