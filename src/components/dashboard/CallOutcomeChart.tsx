"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
} from "recharts";

import AnalyticsCard from "./widgets/AnalyticsCard";

type Outcome = {
    name: string;
    value: number;
    color?: string;
};

type Props = {
    title?: string;
    data: Outcome[];
};

const defaultColors = [
    "#10b981",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#14b8a6",
];

export default function CallOutcomeChart({
                                             title = "Call Outcomes",
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
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                        >
                            {data.map(
                                (entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            entry.color ||
                                            defaultColors[
                                            index %
                                            defaultColors.length
                                                ]
                                        }
                                    />
                                )
                            )}
                        </Pie>

                        <Tooltip />

                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}