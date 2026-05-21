"use client";

import {
    PhoneIncoming,
    PhoneOutgoing,
} from "lucide-react";

import MetricWidget from "./widgets/MetricWidget";

type Props = {
    inboundCalls: number;
    outboundCalls: number;

    inboundTrend?: number;
    outboundTrend?: number;
};

export default function InboundOutboundAnalytics({
                                                     inboundCalls,
                                                     outboundCalls,
                                                     inboundTrend,
                                                     outboundTrend,
                                                 }: Props) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <MetricWidget
                label="Inbound Calls"
                value={inboundCalls.toLocaleString()}
                trend={inboundTrend}
                icon={
                    <PhoneIncoming className="h-5 w-5 text-emerald-500" />
                }
            />

            <MetricWidget
                label="Outbound Calls"
                value={outboundCalls.toLocaleString()}
                trend={outboundTrend}
                icon={
                    <PhoneOutgoing className="h-5 w-5 text-blue-500" />
                }
            />
        </div>
    );
}