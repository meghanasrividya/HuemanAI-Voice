"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

type CallRecord = {
    id: string;
    caller?: string;
    outcome?: string;
    duration?: number;
    createdAt?: string;
};

type Props = {
    open: boolean;

    onOpenChange: (
        open: boolean
    ) => void;

    title?: string;

    calls: CallRecord[];
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

export default function CallOutcomeDrilldown({
                                                 open,
                                                 onOpenChange,
                                                 title = "Calls",
                                                 calls,
                                             }: Props) {
    return (
        <Dialog
            open={open}
            onOpenChange={
                onOpenChange
            }
        >
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-3">
                        {calls.length === 0 && (
                            <div className="rounded-xl border border-border p-6 text-center text-sm text-muted-foreground">
                                No records found.
                            </div>
                        )}

                        {calls.map((call) => (
                            <div
                                key={call.id}
                                className="rounded-xl border border-border bg-card p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="font-medium">
                                            {call.caller ||
                                                "Unknown Caller"}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {call.createdAt}
                                        </p>
                                    </div>

                                    <Badge variant="secondary">
                                        {call.outcome ||
                                            "Unknown"}
                                    </Badge>
                                </div>

                                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Duration:{" "}
                      {formatDuration(
                          call.duration
                      )}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}