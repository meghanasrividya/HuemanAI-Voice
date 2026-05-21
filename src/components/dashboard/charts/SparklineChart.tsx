"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type Props = {
    data: number[];
    width?: number;
    height?: number;
    strokeWidth?: number;
    className?: string;
    animated?: boolean;
};

export default function SparklineChart({
                                           data,
                                           width = 120,
                                           height = 36,
                                           strokeWidth = 2,
                                           className,
                                           animated = true,
                                       }: Props) {
    if (!data || data.length < 2) {
        return null;
    }

    const max = Math.max(...data);

    const min = Math.min(...data);

    const range = max - min || 1;

    const points = data
        .map((value, index) => {
            const x =
                (index / (data.length - 1)) *
                width;

            const y =
                height -
                ((value - min) / range) *
                height;

            return `${x},${y}`;
        })
        .join(" ");

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className={cn(
                "overflow-visible",
                className
            )}
        >
            <motion.polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={
                    animated
                        ? { pathLength: 0 }
                        : false
                }
                animate={
                    animated
                        ? { pathLength: 1 }
                        : undefined
                }
                transition={{
                    duration: 0.8,
                    ease: "easeOut",
                }}
            />

            {data.map((value, index) => {
                const x =
                    (index / (data.length - 1)) *
                    width;

                const y =
                    height -
                    ((value - min) / range) *
                    height;

                return (
                    <motion.circle
                        key={index}
                        cx={x}
                        cy={y}
                        r={2}
                        fill="currentColor"
                        initial={
                            animated
                                ? {
                                    opacity: 0,
                                    scale: 0,
                                }
                                : false
                        }
                        animate={
                            animated
                                ? {
                                    opacity: 1,
                                    scale: 1,
                                }
                                : undefined
                        }
                        transition={{
                            delay:
                                index * 0.04,
                            duration: 0.2,
                        }}
                    />
                );
            })}
        </svg>
    );
}