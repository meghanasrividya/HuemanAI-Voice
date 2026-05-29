"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/store/authStore";
import {
  Download,
  ChevronDown,
  Bell,
  LogOut,
  ChevronLeft,
  Calendar,
  Layers,
  PhoneCall,
  Activity,
  Award,
  Settings,
  AudioLines,
  User2,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

// Netra AI Star Custom Icon
const NetraStarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-[#a855f7] text-[#a855f7]">
    <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
  </svg>
);

// ================= TYPES =================

interface DashboardData {
  totalCalls: number;
  totalBookingsCaptured: number;
  confirmedPercentage: number;
  avgTime: number;
  totalCovers: number;
  outcomeBarData: any[];
  kpiTrends: any;
  afterHoursStats: any;
  reservationSeparation: any;
  dailyBookings: any;
  volumeTrend: any[];
  upsellStats: any;
  conversionFunnel: any[];
  trendingTopics: any[];
  topQueriesToday: any[];
}

// ================= DEFAULT DATA =================

const DEFAULT_DATA: DashboardData = {
  totalCalls: 0,
  totalBookingsCaptured: 0,
  confirmedPercentage: 0,
  avgTime: 0,
  totalCovers: 0,
  outcomeBarData: [],
  kpiTrends: {
    totalBookingsCaptured: {
      changePct: 0,
    },
    avgTime: {
      changePct: 0,
    },
  },
  afterHoursStats: {
    callsAfterHours: 0,
    bookingsDoneAfterHours: 0,
    coversGeneratedAfterHours: 0,
    breakdown: {
      secured: {
        count: 0,
        covers: 0,
      },
    },
  },
  reservationSeparation: {
    securedBookings: {
      count: 0,
      covers: 0,
    },
    largeGroup: {
      count: 0,
      covers: 0,
    },
    promotions: {
      count: 0,
      covers: 0,
    },
  },
  dailyBookings: {
    byDateBooked: [],
    byVisitDate: [],
  },
  volumeTrend: [],
  upsellStats: {
    totalRevenue: 0,
    totalUpsells: 0,
  },
  conversionFunnel: [],
  trendingTopics: [],
  topQueriesToday: [],
};

// ================= COMPONENT =================

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reservationTab, setReservationTab] = useState("Reservation");
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});

  const { user, logout } = useAuthStore();
  const userName = user?.first_name || userData?.first_name || "User";
  const userEmail = user?.email || userData?.email || "";
  const avatarLetter = userName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    logout();
    localStorage.clear();
    router.push("/login");
  };

  // ================= FETCH USER & DASHBOARD =================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("user_data");
      if (u) {
        setUserData(JSON.parse(u));
      }
    }
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      // 1. First, try a direct call to the live voice server with credentials enabled.
      // This is key for local development as the browser will send session/CSRF cookies of voice.huemanai.co.uk directly.
      console.log("Attempting direct live API POST to voice.huemanai.co.uk...");
      const token = useAuthStore.getState().token || (typeof window !== "undefined" ? localStorage.getItem("access_token")?.replace("Bearer ", "") : "") || "";
      const response = await axios.post(
        "https://voice.huemanai.co.uk/api/dashboard/reservation",
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        }
      );
      if (response.data) {
        console.log("Direct live API call successful!", response.data);
        setData(response.data);
        return;
      }
    } catch (err: any) {
      console.warn(
        "Direct live API call failed/blocked. Error details:",
        err.response?.data || err.message
      );
    }

    // 2. Fallback: call the Next.js API proxy /api/dashboard/reservation
    try {
      const rawToken = typeof window !== "undefined" ? localStorage.getItem("access_token") || "" : "";
      const token = useAuthStore.getState().token || rawToken.replace("Bearer ", "");
      const csrf = typeof window !== "undefined" ? localStorage.getItem("csrf_token") || "" : "";

      console.log("Fallback API Proxy - TOKEN =>", token);

      const response = await axios.post(
        "/api/dashboard/reservation",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf,
          },
        }
      );

      console.log("Fallback API Proxy - SUCCESS =>", response.data);

      if (response?.data) {
        setData(response.data);
      }
    } catch (error: any) {
      console.error(
        "Dashboard Error =>",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= HELPERS =================

  const formatAvgTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getOutcomePct = (count: number) => {
    if (data.totalCalls === 0) return "0%";

    return ((count / data.totalCalls) * 100).toFixed(1) + "%";
  };

  const selectedBookingsData = data.dailyBookings.byDateBooked || [];

  const maxVolume = Math.max(
    ...(data.volumeTrend?.map((v: any) => v.value) || [1])
  );

  const chartPoints = data.volumeTrend?.map((pt: any, idx: number) => {
    const totalWidth = 440;

    const spacing =
      data.volumeTrend.length > 1
        ? totalWidth / (data.volumeTrend.length - 1)
        : totalWidth;

    const x = 30 + idx * spacing;

    const y = 140 - (pt.value / maxVolume) * 110;

    return `${x},${y}`;
  });

  const linePath =
    chartPoints?.length > 0 ? `M ${chartPoints.join(" L ")}` : "";

  // ================= LOADER =================

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center text-white text-xl font-bold">
        Loading Dashboard...
      </div>
    );
  }

  // ================= UI =================

  return (
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
            "fixed inset-y-0 left-0 z-50 w-[260px] border-r border-[#1e1e24] flex flex-col justify-between p-4 transition-transform duration-200 lg:static lg:translate-x-0 flex-shrink-0 h-full",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
          style={{ backgroundColor: "#0c0c0e" }}
        >
          <div className="space-y-6">

            {/* Logo */}
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[21px] font-bold tracking-tight text-white select-none">
                HuemanAI
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Options */}
            <nav className="space-y-[6px]">
              {[
                { name: "Dashboard", icon: <Layers size={17} />, href: "/dashboard" },
                { name: "Calls", icon: <PhoneCall size={17} />, href: "/calls" },
                { name: "Actions", icon: <Calendar size={17} />, href: "/actions" },
                { name: "Insights", icon: <Activity size={17} />, href: "/insights" },
                { name: "Outbound", icon: <PhoneCall size={17} />, href: "/outbound_campaign" },
                { name: "Reports", icon: <Award size={17} />, href: "/reports" },
              ].map((item) => {
                const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      router.push(item.href);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4.5 px-4.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all text-left ${
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
              <div className="px-4.5 py-3 flex flex-col gap-1">
                <div className="flex items-center gap-4.5 text-zinc-400">
                  <NetraStarIcon />
                  <span className="text-sm font-semibold tracking-wide">Netra AI</span>
                </div>
                <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase ml-[34px]">
                  Coming Soon
                </span>
              </div>

              {/* Admin item */}
              <button
                onClick={() => {
                  router.push("/admin");
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4.5 px-4.5 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all text-left ${
                  pathname === "/admin"
                    ? "text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
                style={pathname === "/admin" ? { backgroundColor: "#1d1d22" } : undefined}
              >
                <Settings size={17} />
                <span>Admin</span>
              </button>
            </nav>
          </div>

          {/* Profile and Logout */}
          <div className="space-y-5 pt-5 border-t border-[#18181b]/60">

            {/* User Details */}
            <div className="flex items-center gap-3 px-2">
              <div className="w-[38px] h-[38px] rounded-full bg-[#18181b] border border-zinc-800 flex items-center justify-center text-sm font-extrabold text-zinc-300">
                {avatarLetter}
              </div>
              <div className="overflow-hidden">
                <p className="text-[13px] font-bold text-white truncate">{userName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/40 transition-all text-left cursor-pointer"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            {/* Sidebar Collapse */}
            <div className="flex justify-start px-2 cursor-pointer text-zinc-600 hover:text-zinc-400 transition-colors">
              <ChevronLeft size={18} />
            </div>

          </div>
        </aside>

        {/* ================= RIGHT WORKSPACE ================= */}
        <div
          className="flex-grow flex flex-col overflow-hidden min-w-0"
          style={{ backgroundColor: "#050505" }}
        >
          <div className="flex-1 overflow-y-auto">

            {/* ================= HEADER ================= */}
            <header className="h-[70px] border-b border-zinc-900 flex items-center justify-between px-6 bg-[#070709] flex-shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black">Dashboard</h2>
                  <p className="text-xs text-zinc-500">
                    Reservation Analytics
                  </p>
                </div>

                {/* Reservation / Feedback Pill Switcher */}
                <div
                  className="border border-zinc-900/80 p-0.5 rounded-full flex gap-0.5 ml-4"
                  style={{ backgroundColor: "#0b0b0d" }}
                >
                  <button
                    onClick={() => setReservationTab("Reservation")}
                    className={`text-[10px] font-bold px-4 py-1 rounded-full transition-all border cursor-pointer ${
                      reservationTab === "Reservation"
                        ? "bg-[#18181b] border-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/60 border-transparent"
                    }`}
                  >
                    Reservation
                  </button>
                  <button
                    onClick={() => setReservationTab("Feedback")}
                    className={`text-[10px] font-bold px-4 py-1 rounded-full transition-all border cursor-pointer ${
                      reservationTab === "Feedback"
                        ? "bg-[#18181b] border-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-900/60 border-transparent"
                    }`}
                  >
                    Feedback
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="border border-zinc-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <Download size={14} />
                  Export
                </button>

                <div className="relative">
                  <Bell size={18} className="text-zinc-400" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500"></span>
                </div>
              </div>
            </header>

            {/* ================= CONTENT ================= */}
            <div className="p-6 space-y-6">

              {/* ================= CALL OUTCOMES ================= */}
              <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-6">
                <p className="text-xs text-zinc-500 uppercase mb-2">
                  Call Outcomes
                </p>

                <h2 className="text-4xl font-black mb-6">
                  {data.totalCalls}
                </h2>

                <div className="w-full h-3 rounded-full overflow-hidden flex">
                  {data.outcomeBarData?.map((bar: any, idx: number) => {
                    const colors = [
                      "#10b981",
                      "#3b82f6",
                      "#06b6d4",
                      "#eab308",
                      "#f97316",
                      "#f43f5e",
                      "#64748b",
                    ];

                    const pct =
                      data.totalCalls > 0
                        ? (bar.count / data.totalCalls) * 100
                        : 0;

                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${pct}%`,
                          backgroundColor: colors[idx],
                        }}
                      />
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  {data.outcomeBarData?.map((bar: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: [
                            "#10b981",
                            "#3b82f6",
                            "#06b6d4",
                            "#eab308",
                            "#f97316",
                            "#f43f5e",
                            "#64748b",
                          ][idx],
                        }}
                      />

                      <span className="text-zinc-300">
                        {bar.name}
                      </span>

                      <span className="font-bold">
                        {bar.count}
                      </span>

                      <span className="text-zinc-500 text-xs">
                        ({getOutcomePct(bar.count)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= STATS ================= */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-5">
                  <p className="text-xs text-zinc-500 mb-2">
                    Total Bookings
                  </p>
                  <h3 className="text-3xl font-black">
                    {data.totalBookingsCaptured}
                  </h3>
                </div>

                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-5">
                  <p className="text-xs text-zinc-500 mb-2">
                    Total Covers
                  </p>
                  <h3 className="text-3xl font-black">
                    {data.totalCovers}
                  </h3>
                </div>

                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-5">
                  <p className="text-xs text-zinc-500 mb-2">
                    Reservation %
                  </p>
                  <h3 className="text-3xl font-black">
                    {data.confirmedPercentage?.toFixed(1)}%
                  </h3>
                </div>

                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-5">
                  <p className="text-xs text-zinc-500 mb-2">
                    Avg Time
                  </p>
                  <h3 className="text-3xl font-black">
                    {formatAvgTime(data.avgTime)}
                  </h3>
                </div>
              </div>

              {/* ================= CALLS PER DAY ================= */}
              <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-6">
                <h3 className="text-lg font-black mb-6">
                  Calls Per Day
                </h3>

                <div className="w-full h-[250px]">
                  <svg viewBox="0 0 500 150" className="w-full h-full">
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-xs text-zinc-500 mt-3">
                  {data.volumeTrend?.map((pt: any) => (
                    <span key={pt.label}>
                      {pt.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* ================= TOP QUERIES ================= */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-6">
                  <h3 className="text-lg font-black mb-5">
                    Top Queries
                  </h3>

                  <div className="space-y-3">
                    {data.topQueriesToday?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-zinc-800 rounded-xl p-4"
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-white">
                            {item.query}
                          </p>
                          <span className="text-xs text-zinc-400">
                            {item.count} times
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= TRENDING ================= */}
                <div className="bg-[#0b0b0d] border border-zinc-900 rounded-2xl p-6">
                  <h3 className="text-lg font-black mb-5">
                    Trending Topics
                  </h3>

                  <div className="space-y-3">
                    {data.trendingTopics?.map((topic: any, idx: number) => (
                      <div
                        key={idx}
                        className="border border-zinc-800 rounded-xl p-4 flex justify-between"
                      >
                        <div>
                          <p className="font-semibold">
                            {topic.topic}
                          </p>
                          <p className="text-xs text-zinc-500">
                            Previous: {topic.prevCount}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-bold">
                            {topic.count}
                          </p>
                          <p className="text-green-400 text-xs">
                            +{topic.change}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}