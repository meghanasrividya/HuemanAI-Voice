"use client";

import { ReactNode, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
    LayoutDashboard,
    BarChart3,
    Brain,
    ShieldCheck,
    CalendarDays,
    Phone,
    PhoneOutgoing,
    LogOut,
} from "lucide-react";

import Link from "next/link";

import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

type Props = { children: ReactNode };

const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Calls",     href: "/calls",     icon: Phone },
    { label: "Actions",   href: "/actions",   icon: CalendarDays },
    { label: "Insights",  href: "/insights",  icon: Brain },
    { label: "Outbound",  href: "/outbound_campaign", icon: PhoneOutgoing },
    { label: "Reports",   href: "/reports",   icon: BarChart3 },
    { label: "Admin",     href: "/admin",     icon: ShieldCheck },
];

export default function ProtectedLayout({ children }: Props) {
    const pathname = usePathname();
    const router = useRouter();

    const handleActionsClick = useCallback(() => {
        void fetch("/api/actions/hotels", { cache: "no-store" }).catch(() => {});
    }, []);

    const { user, logout } = useAuthStore();

    const handleLogout = useCallback(() => {
        logout();
        router.push("/login");
    }, [logout, router]);

    const initial = (user?.first_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase();
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "User";

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex h-screen overflow-hidden">
                {/* ── Sidebar ── */}
                <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:flex lg:flex-col">
                    {/* Brand */}
                    <div className="px-5 py-5">
                        <span className="text-4xl font-bold tracking-tight">HuemanAI</span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active =
                                pathname === item.href ||
                                pathname.startsWith(`${item.href}/`);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={item.href === "/actions" ? handleActionsClick : undefined}
                                    className={cn(
                                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                                        active
                                            ? "bg-primary/10 text-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "h-4 w-4",
                                            active ? "text-primary" : "text-muted-foreground"
                                        )}
                                    />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Netra AI — coming soon */}
                        {/* <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground/60 cursor-default select-none">
                            <Sparkles className="h-4 w-4 text-violet-500" />
                            <div className="flex flex-col leading-none">
                                <span className="font-semibold text-foreground/70">Netra AI</span>
                                <span className="mt-0.5 text-[11px] text-muted-foreground">Coming Soon</span>
                            </div>
                        </div> */}
                    </nav>

                    {/* User + logout */}
                    <div className="border-t border-border p-3 space-y-0.5">
                        <Link
                            href="/profile"
                            className={cn(
                                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150",
                                pathname === "/profile"
                                    ? "bg-primary/10"
                                    : "hover:bg-muted"
                            )}
                        >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                                {initial}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{fullName}</p>
                                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-150 hover:bg-muted hover:text-foreground"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </aside>

                {/* ── Main area ── */}
                <div className="flex min-w-0 flex-1 flex-col">
                    <main className="flex min-h-0 flex-1 flex-col overflow-auto">
                        <div className="flex-1">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
