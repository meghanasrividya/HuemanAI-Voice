"use client";

import { ReactNode } from "react";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = {
    title?: string;
    subtitle?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    noPadding?: boolean;
};

export default function AnalyticsCard({
                                          title,
                                          subtitle,
                                          action,
                                          children,
                                          className,
                                          contentClassName,
                                          noPadding = false,
                                      }: Props) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 10,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className={cn(
                "overflow-hidden rounded-2xl border border-border bg-card shadow-premium-sm",
                className
            )}
        >
            {(title || subtitle || action) && (
                <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                    <div className="min-w-0">
                        {title && (
                            <h3 className="text-sm font-semibold tracking-tight text-foreground">
                                {title}
                            </h3>
                        )}

                        {subtitle && (
                            <p className="mt-1 text-xs text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {action && (
                        <div className="shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}

            <div
                className={cn(
                    !noPadding && "p-5",
                    contentClassName
                )}
            >
                {children}
            </div>
        </motion.div>
    );
}