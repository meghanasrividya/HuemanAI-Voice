"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
} from "recharts";

import AnalyticsCard from "./widgets/AnalyticsCard";

type DataPoint = {
    label: string;
    calls: number;
    bookings?: number;
};

type Props = {
    title?: string;
    subtitle?: string;
    data: DataPoint[];
};

export default function CallVolumeChart({
                                            title = "Call Volume",
                                            subtitle,
                                            data,
                                        }: Props) {
    return (
        <AnalyticsCard
            title={title}
            subtitle={subtitle}
            className="h-full"
        >
            <div className="h-[340px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id="callsGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#3b82f6"
                                    stopOpacity={0}
                                />
                            </linearGradient>

                            <linearGradient
                                id="bookingGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#10b981"
                                    stopOpacity={0.35}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#10b981"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                        />

                        <XAxis
                            dataKey="label"
                            tick={{
                                fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <YAxis
                            tick={{
                                fontSize: 12,
                            }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip />

                        <Area
                            type="monotone"
                            dataKey="calls"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="url(#callsGradient)"
                        />

                        {data.some(
                            (d) =>
                                d.bookings !== undefined
                        ) && (
                            <Area
                                type="monotone"
                                dataKey="bookings"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#bookingGradient)"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}