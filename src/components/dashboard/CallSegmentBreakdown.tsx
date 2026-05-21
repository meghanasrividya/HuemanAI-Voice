"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
} from "recharts";

import AnalyticsCard from "./widgets/AnalyticsCard";

type Segment = {
    label: string;
    value: number;
    color?: string;
};

type Props = {
    title?: string;
    data: Segment[];
};

const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
    "#ec4899",
];

export default function CallSegmentBreakdown({
                                                 title = "Call Segments",
                                                 data,
                                             }: Props) {
    return (
        <AnalyticsCard
            title={title}
            className="h-full"
        >
            <div className="h-[320px]">
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{
                            left: 10,
                            right: 10,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="hsl(var(--border))"
                        />

                        <XAxis
                            type="number"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <YAxis
                            dataKey="label"
                            type="category"
                            width={120}
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                            }}
                        />

                        <Tooltip />

                        <Bar
                            dataKey="value"
                            radius={[0, 8, 8, 0]}
                        >
                            {data.map(
                                (entry, index) => (
                                    <Cell
                                        key={index}
                                        fill={
                                            entry.color ||
                                            colors[
                                            index %
                                            colors.length
                                                ]
                                        }
                                    />
                                )
                            )}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}