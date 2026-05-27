"use client";

import { Ban } from "lucide-react";

export function DisabledPageMessage({ title }: { title: string }) {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-4">
                <Ban className="h-12 w-12" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
                <p>This feature has been disabled for your account.</p>
            </div>
        </div>
    );
}
