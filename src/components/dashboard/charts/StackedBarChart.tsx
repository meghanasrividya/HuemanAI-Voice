"use client";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

import AnalyticsCard from "../widgets/AnalyticsCard";

type Props = {
    title?: string;

    data: Record<
        string,
        string | number
    >[];

    keys: {
        key: string;
        color: string;
        label?: string;
    }[];

    xKey?: string;
};

export default function StackedBarChart({
                                            title = "Analytics",
                                            data,
                                            keys,
                                            xKey = "label",
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
                    <BarChart data={data}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                        />

                        <XAxis
                            dataKey={xKey}
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

                        {keys.map((item) => (
                            <Bar
                                key={item.key}
                                dataKey={item.key}
                                stackId="a"
                                fill={item.color}
                                radius={[4, 4, 0, 0]}
                                name={
                                    item.label ||
                                    item.key
                                }
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}