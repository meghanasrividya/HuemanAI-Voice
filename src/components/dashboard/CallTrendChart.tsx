"use client";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

import AnalyticsCard from "./widgets/AnalyticsCard";

type DataPoint = {
    label: string;
    inbound?: number;
    outbound?: number;
    bookings?: number;
};

type Props = {
    title?: string;
    data: DataPoint[];
};

export default function CallTrendChart({
                                           title = "Call Trends",
                                           data,
                                       }: Props) {
    return (
        <AnalyticsCard
            title={title}
            className="h-full"
        >
            <div className="h-[340px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <LineChart data={data}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                        />

                        <XAxis
                            dataKey="label"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <Tooltip />

                        <Legend />

                        <Line
                            type="monotone"
                            dataKey="inbound"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                            name="Inbound"
                        />

                        <Line
                            type="monotone"
                            dataKey="outbound"
                            stroke="#10b981"
                            strokeWidth={2}
                            dot={false}
                            name="Outbound"
                        />

                        <Line
                            type="monotone"
                            dataKey="bookings"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                            name="Bookings"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}