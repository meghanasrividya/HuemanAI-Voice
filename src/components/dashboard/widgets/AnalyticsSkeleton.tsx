"use client";

import {
    Skeleton,
} from "@/components/ui/skeleton";

export default function AnalyticsSkeleton() {
    return (
        <div className="rounded-2xl border border-border bg-card p-5">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />

                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                <Skeleton className="h-10 w-40" />

                <Skeleton className="h-[220px] w-full rounded-xl" />
            </div>
        </div>
    );
}