"use client";

import PageContainer from "@/components/layout/PageContainer";

export default function ActionDetailPage({ params }: { params: { actionId: string } }) {
    return (
        <PageContainer>
            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Action Detail</h1>
                        <p className="mt-1 text-sm text-muted-foreground">Action ID: {params.actionId}</p>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
