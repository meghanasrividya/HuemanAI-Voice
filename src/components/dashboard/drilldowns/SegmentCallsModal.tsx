"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    ScrollArea,
} from "@/components/ui/scroll-area";

import { Badge } from "@/components/ui/badge";

type CallItem = {
    id: string;
    caller?: string;
    segment?: string;
    hotel?: string;
    createdAt?: string;
    duration?: number;
};

type Props = {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    segment?: string;

    calls: CallItem[];
};

function formatDuration(
    seconds?: number
) {
    if (!seconds) return "0s";

    const mins = Math.floor(
        seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}m ${secs}s`;
}

export default function SegmentCallsModal({
                                              open,
                                              onOpenChange,
                                              segment,
                                              calls,
                                          }: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {segment ||
                            "Segment"}{" "}
                        Calls
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="max-h-[70vh] pr-3">
                    <div className="space-y-3">
                        {calls.length === 0 && (
                            <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                                No calls found.
                            </div>
                        )}

                        {calls.map((call) => (
                            <div
                                key={call.id}
                                className="rounded-xl border border-border bg-card p-4"
                            >
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            {call.caller ||
                                                "Unknown Caller"}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {call.createdAt}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {call.segment && (
                                                <Badge variant="secondary">
                                                    {
                                                        call.segment
                                                    }
                                                </Badge>
                                            )}

                                            {call.hotel && (
                                                <Badge variant="outline">
                                                    {call.hotel}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-sm text-muted-foreground">
                                        Duration:{" "}
                                        {formatDuration(
                                            call.duration
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}