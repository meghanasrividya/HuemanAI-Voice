"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Layers, 
  PhoneCall, 
  Calendar, 
  Activity, 
  Award, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  Menu, 
  X 
} from "lucide-react";
import PageContainer from "@/components/layout/PageContainer";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";

const NetraStarIcon = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#a855f7] text-[#a855f7]">
        <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
    </svg>
);

export default function CallsLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSignOut = () => {
        logout();
        router.push("/login");
    };

    return (
        <PageContainer>
            <div
                className="flex flex-col h-screen text-white font-sans overflow-hidden select-none"
                style={{ backgroundColor: "#050505" }}
            >
                {/* Mobile Top Bar */}
                <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0c0c0e] border-b border-[#1e1e24] h-[52px] flex-shrink-0">
                    <span className="text-[17px] font-bold tracking-tight text-white select-none">
                        HuemanAI
                    </span>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <Menu size={20} />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Backdrop overlay on mobile when sidebar is open */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}

                    {/* ================= LEFT SIDEBAR ================= */}
                    <aside
                        className={cn(
                            "fixed inset-y-0 left-0 z-50 w-[230px] border-r border-[#1e1e24] flex flex-col justify-between p-4 transition-transform duration-200 lg:static lg:translate-x-0 flex-shrink-0 h-full",
                            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}
                        style={{ backgroundColor: "#0c0c0e" }}
                    >
                        <div className="space-y-6">
                            {/* Logo */}
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-[17px] font-bold tracking-tight text-white select-none">
                                    HuemanAI
                                </span>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="lg:hidden text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Navigation Options */}
                            <nav className="space-y-[3px]">
                                {[
                                    { name: "Dashboard", icon: <Layers size={15} />, href: "/dashboard" },
                                    { name: "Calls", icon: <PhoneCall size={15} />, href: "/calls" },
                                    { name: "Actions", icon: <Calendar size={15} />, href: "/actions" },
                                    { name: "Insights", icon: <Activity size={15} />, href: "/insights" },
                                    { name: "Outbound", icon: <PhoneCall size={15} />, href: "/outbound_campaign" },
                                    { name: "Reports", icon: <Award size={15} />, href: "/reports" },
                                ].map((item) => {
                                    const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                                    return (
                                        <button
                                            key={item.name}
                                            onClick={() => {
                                                router.push(item.href);
                                                setIsSidebarOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                                                active
                                                    ? "text-white font-bold"
                                                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                            }`}
                                            style={active ? { backgroundColor: "#1d1d22" } : undefined}
                                        >
                                            {item.icon}
                                            <span>{item.name}</span>
                                        </button>
                                    );
                                })}

                                {/* Special Netra AI item */}
                                <div className="px-3 py-2 flex flex-col gap-0.5">
                                    <div className="flex items-center gap-3 text-zinc-400">
                                        <NetraStarIcon />
                                        <span className="text-xs font-semibold tracking-wide">Netra AI</span>
                                    </div>
                                    <span className="text-[9px] text-purple-400 font-semibold tracking-wider uppercase ml-7">
                                        Coming Soon
                                    </span>
                                </div>

                                {/* Admin item */}
                                <button
                                    onClick={() => {
                                        router.push("/admin");
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all text-left ${
                                        pathname === "/admin"
                                            ? "text-white font-bold"
                                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                                    }`}
                                    style={pathname === "/admin" ? { backgroundColor: "#1d1d22" } : undefined}
                                >
                                    <Settings size={15} />
                                    <span>Admin</span>
                                </button>
                            </nav>
                        </div>

                        {/* Profile and Logout */}
                        <div className="space-y-4 pt-4 border-t border-[#18181b]/60">
                            {/* User Details */}
                            <div className="flex items-center gap-2.5 px-1.5">
                                <div className="w-[32px] h-[32px] rounded-full bg-[#18181b] border border-zinc-800 flex items-center justify-center text-xs font-extrabold text-zinc-300">
                                    {user?.first_name ? user.first_name[0].toUpperCase() : "U"}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[11px] font-bold text-white truncate">
                                        {user?.first_name || "User"}
                                    </p>
                                    <p className="text-[9px] text-zinc-500 truncate">
                                        {user?.email || ""}
                                    </p>
                                </div>
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[11px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
                            >
                                <LogOut size={14} />
                                <span>Logout</span>
                            </button>

                            {/* Sidebar Collapse */}
                            <div className="flex justify-start px-2 cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
                                <ChevronLeft size={16} />
                            </div>
                        </div>
                    </aside>

                    {/* ================= RIGHT WORKSPACE ================= */}
                    <div className="flex-grow flex flex-col overflow-hidden min-w-0">
                        {/* Main Page Area */}
                        <main className="flex-grow flex-1 min-w-0 overflow-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
