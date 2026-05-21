"use client";

import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Tooltip,
} from "recharts";

import AnalyticsCard from "../widgets/AnalyticsCard";

type DataItem = {
    label: string;
    value: number;
};

type Props = {
    title?: string;
    data: DataItem[];
};

export default function OutcomeDistributionChart({
                                                     title = "Outcome Distribution",
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
                    <RadarChart
                        outerRadius="72%"
                        data={data}
                    >
                        <PolarGrid />

                        <PolarAngleAxis
                            dataKey="label"
                        />

                        <PolarRadiusAxis />

                        <Tooltip />

                        <Radar
                            dataKey="value"
                            stroke="#8b5cf6"
                            fill="#8b5cf6"
                            fillOpacity={0.35}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </AnalyticsCard>
    );
}