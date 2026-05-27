"use client";

import PageContainer from "@/components/layout/PageContainer";

export default function CallsPage() {
    return (
        <PageContainer>
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Calls</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Browse and search call recordings</p>
                    </div>
                    <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                        <p className="text-muted-foreground">Calls list in development</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
