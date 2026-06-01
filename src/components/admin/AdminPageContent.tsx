"use client";

export default function AdminPageContent() {
    return (
        <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage users, settings and configurations</p>
                </div>
                <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-border bg-card shadow-sm">
                    <p className="text-muted-foreground">Admin panel in development</p>
                </div>
            </div>
        </div>
    );
}
