"use client";

import { ReactNode, useCallback } from "react";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    BarChart3,
    MessageCircle,
    Brain,
    ShieldCheck,
    ClipboardList,
    CalendarDays,
} from "lucide-react";

import Link from "next/link";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
};

const navigation = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Actions",
        href: "/actions",
        icon: CalendarDays,
    },
    {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
    },
    {
        label: "Insights",
        href: "/insights",
        icon: Brain,
    },
    {
        label: "WhatsApp",
        href: "/whatsapp",
        icon: MessageCircle,
    },
    {
        label: "Tasks",
        href: "/tasks",
        icon: ClipboardList,
    },
    {
        label: "Admin",
        href: "/admin",
        icon: ShieldCheck,
    },
];

export default function ProtectedLayout({
                                            children,
                                        }: Props) {
    const pathname = usePathname();

    const handleActionsClick = useCallback(() => {
        void fetch("/api/actions/hotels", { cache: "no-store" }).catch(() => {
            // ignore errors; navigation should still happen
        });
    }, []);

    const { user } = useAuthStore();

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden w-72 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
                    <div className="border-b border-border px-6 py-5">
                        <h1 className="text-xl font-bold tracking-tight">
                            Voice Analytics
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            AI Operations Console
                        </p>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            const active =
                                pathname === item.href ||
                                pathname.startsWith(
                                    `${item.href}/`
                                );

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={item.href === "/actions" ? handleActionsClick : undefined}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                        active
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />

                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-border p-4">
                        <div className="rounded-xl bg-muted/40 p-4">
                            <p className="text-sm font-medium">
                                {user?.first_name || "User"}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Topbar */}
                    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
                        <div>
                            <h2 className="text-sm font-medium text-muted-foreground">
                                AI Call Intelligence Platform
                            </h2>
                        </div>
                    </header>

                    {/* Content */}
                    <main className="flex-1 overflow-auto">
                        <div className="min-h-full p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}