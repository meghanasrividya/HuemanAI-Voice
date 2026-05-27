"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import { apiClient } from "../../lib/apiClient";
import { useAuthStore } from "../../store/authStore";
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
import { cn } from "../../lib/utils";

// Netra AI Star Custom Icon
const NetraStarIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#a855f7] text-[#a855f7]">
    <path d="M12 2l2.4 7.2h7.6l-6.2 4.5 2.4 7.3-6.2-4.5-6.2 4.5 2.4-7.3-6.2-4.5h7.6z" />
  </svg>
);

// Full Fallback data matching the exact payload provided by the user
const DEFAULT_DATA = {
  totalCalls: 96,
  avgSentimentPercentage: 45.8,
  avgSentiment: "0.46",
  totalBookingsCaptured: 26,
  totalBookingsBreakdown: [],
  confirmedPercentage: 27.1,
  avgTime: 113,
  totalCovers: 215,
  avgPartySize: 3,
  topSpecialRequests: [
    { request: "Available Table", count: 22 },
    { request: "HUEMANAI", count: 22 },
    { request: "Dinner Reservation", count: 20 },
    { request: "General Enquiry", count: 19 },
    { request: "Lunch Booking", count: 19 }
  ],
  timingDistribution: [
    { label: "08:00", value: 4 },
    { label: "09:00", value: 5 },
    { label: "10:00", value: 9 },
    { label: "11:00", value: 15 },
    { label: "12:00", value: 9 },
    { label: "13:00", value: 5 },
    { label: "14:00", value: 4 },
    { label: "15:00", value: 9 },
    { label: "16:00", value: 3 },
    { label: "17:00", value: 6 },
    { label: "18:00", value: 17 },
    { label: "19:00", value: 7 },
    { label: "20:00", value: 3 }
  ],
  last7DaysCallCount: {
    Tuesday: { "9": 4, "10": 4, "11": 3, "12": 1, "13": 1, "14": 1, "15": 1, "16": 1, "17": 1, "18": 7 },
    Wednesday: { "8": 1, "11": 3, "12": 2, "13": 1, "15": 2, "16": 1, "18": 3, "19": 2 },
    Thursday: { "10": 1, "11": 2, "12": 1, "13": 1, "15": 1, "17": 2, "19": 1 },
    Friday: { "8": 1, "9": 1, "10": 2, "11": 2, "12": 2, "14": 1, "15": 2, "17": 1, "19": 2, "20": 2 },
    Saturday: { "10": 1, "12": 3, "13": 1, "15": 2, "16": 1, "18": 4, "19": 2, "20": 1 },
    Sunday: { "8": 2, "11": 3, "13": 1, "14": 1, "18": 2 },
    Monday: { "10": 1, "11": 2, "14": 1, "15": 1, "17": 2, "18": 1 }
  },
  reservationCategories: [
    { name: "Reservation", value: 96 }
  ],
  topAskClass: "Reservation",
  maxBookingCategory: "Reservation",
  topQueriesToday: [
    { query: "Is my reservation still on?", count: 4 },
    { query: "Can I book a table?", count: 2 },
    { query: "Any dietary requirements or special requests for your visit?", count: 1 },
    { query: "Any dietary requirements or special requests?", count: 1 },
    { query: "Are there any dietary requirements?", count: 1 }
  ],
  locationWiseCallCount: [],
  volumeTrend: [
    { label: "2026-05-19", value: 24 },
    { label: "2026-05-20", value: 15 },
    { label: "2026-05-21", value: 9 },
    { label: "2026-05-22", value: 16 },
    { label: "2026-05-23", value: 15 },
    { label: "2026-05-24", value: 9 },
    { label: "2026-05-25", value: 8 }
  ],
  kpiTrends: {
    totalCalls: { current: 96, previous: 32, changePct: 200, sparkline: [24, 15, 9, 16, 15, 9, 8] },
    avgSentiment: { current: 0.46, currentLabel: "Positive", previous: 0.34, previousLabel: "Positive", changePct: 33.8, rag: "green", sparkline: [] },
    totalBookingsCaptured: { current: 26, previous: 2, changePct: 1200, categoryBreakdown: [{ name: "Reservation", count: 26 }] },
    conversionRate: { current: 27.083333333333332, previous: 6.3, changePct: 333.3, rag: "red", sparkline: [] },
    avgTime: { current: 113, previous: 71, changePct: 59.2, rag: "green", sparkline: [] }
  },
  outcomeBarData: [
    { name: "Booking Secured", count: 22, color: "bg-emerald-400" },
    { name: "Enquiry Handled", count: 26, color: "bg-sky-400" },
    { name: "Large Party Bookings", count: 2, color: "bg-cyan-400" },
    { name: "Promotional / Offer", count: 2, color: "bg-yellow-400" },
    { name: "Transferred to Staff", count: 13, color: "bg-amber-400" },
    { name: "Booking Cancelled", count: 1, color: "bg-orange-400" },
    { name: "General Assistance", count: 32, color: "bg-slate-400" }
  ],
  conversionFunnel: [
    { stage: "Total Calls", count: 96, pct: 100 },
    { stage: "Details Collected", count: 50, pct: 52 },
    { stage: "Booking Captured", count: 26, pct: 52 }
  ],
  volumeComparison: {
    currentTrend: [
      { label: "2026-05-19", value: 24 },
      { label: "2026-05-20", value: 15 },
      { label: "2026-05-21", value: 9 },
      { label: "2026-05-22", value: 16 },
      { label: "2026-05-23", value: 15 },
      { label: "2026-05-24", value: 9 },
      { label: "2026-05-25", value: 8 }
    ],
    previousTrend: []
  },
  trendingTopics: [
    { topic: "Enquiry", count: 37, prevCount: 22, change: 68 },
    { topic: "Table Booking", count: 30, prevCount: 7, change: 329 },
    { topic: "Table Rescheduling", count: 12, prevCount: 0, change: 100 },
    { topic: "General", count: 9, prevCount: 1, change: 800 },
    { topic: "Table Confirmation", count: 6, prevCount: 2, change: 200 }
  ],
  afterHoursStats: {
    callsAfterHours: 2,
    bookingsDoneAfterHours: 1,
    coversGeneratedAfterHours: 2,
    breakdown: {
      secured: { count: 1, covers: 2 },
      largeGroup: { count: 0, covers: 0 },
      promotional: { count: 0, covers: 0 }
    }
  },
  reservationSeparation: {
    totalReservationCalls: 96,
    securedBookings: { count: 22, covers: 71 },
    largeGroup: { count: 2, covers: 120 },
    promotions: { count: 2, covers: 24 }
  },
  upsellStats: {
    totalUpsells: 0,
    totalRevenue: 0,
    callIds: [],
    breakdown: { prosecco: 0, wine: 0, other: 0 }
  },
  dailyBookings: {
    byDateBooked: [
      { date: "2026-05-19", count: 6, covers: 24 },
      { date: "2026-05-20", count: 3, covers: 12 },
      { date: "2026-05-21", count: 1, covers: 2 },
      { date: "2026-05-22", count: 4, covers: 12 },
      { date: "2026-05-23", count: 3, covers: 9 },
      { date: "2026-05-24", count: 2, covers: 6 },
      { date: "2026-05-25", count: 3, covers: 6 }
    ],
    byVisitDate: [
      { date: "2026-05-21", count: 1, covers: 2 },
      { date: "2026-05-22", count: 2, covers: 4 },
      { date: "2026-05-23", count: 3, covers: 12 },
      { date: "2026-05-24", count: 6, covers: 18 },
      { date: "2026-05-26", count: 1, covers: 2 },
      { date: "2026-05-27", count: 1, covers: 2 },
      { date: "2026-06-01", count: 1, covers: 2 },
      { date: "2026-06-02", count: 1, covers: 2 },
      { date: "2026-06-05", count: 4, covers: 20 },
      { date: "2026-06-06", count: 1, covers: 2 },
      { date: "2026-06-12", count: 1, covers: 5 }
    ]
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [reservationTab, setReservationTab] = useState("Reservation");
  const [dateRange, setDateRange] = useState("Last 7 days");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Toggle tab inside Bookings Breakdown card
  const [bookingsBreakdownTab, setBookingsBreakdownTab] = useState("Date Booked");

  // Dynamic state for data binding
  const [data, setData] = useState(DEFAULT_DATA);
  const [loading, setLoading] = useState(false);

  // POST Request to Reservation API endpoint
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // 1. First, try a direct call to the live voice server with credentials enabled.
        // This is key for local development as the browser will send session/CSRF cookies of voice.huemanai.co.uk directly.
        console.log("Attempting direct live API POST to voice.huemanai.co.uk...");
        const token = useAuthStore.getState().token;
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

        // 2. If the direct call is blocked or fails, fall back to our Next.js API route proxy.
        try {
          console.log("Attempting proxy API POST via /api/dashboard/reservation...");
          const response = await apiClient.post("/dashboard/reservation");
          if (response.data) {
            console.log("Proxy API call successful!", response.data);
            setData(response.data);
            return;
          }
        } catch (proxyErr: any) {
          console.error(
            "Both direct and proxy API requests failed. Falling back to default mock dataset.",
            proxyErr.response?.data || proxyErr.message
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleSignOut = () => {
    router.push("/login");
  };

  // Utility to convert avgTime (in seconds) to human-readable m:ss
  const formatAvgTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Utility to calculate dynamic Call Outcome segments percentages
  const getOutcomePct = (count: number) => {
    if (data.totalCalls === 0) return "0.0%";
    return ((count / data.totalCalls) * 100).toFixed(1) + "%";
  };

  // Map toggle inside Bookings Breakdown
  const selectedBookingsData = bookingsBreakdownTab === "Date Booked"
    ? data.dailyBookings.byDateBooked
    : data.dailyBookings.byVisitDate;

  // Generate smooth dynamic coordinates for SVG Line Chart based on volumeTrend
  const maxVolume = Math.max(...data.volumeTrend.map(v => v.value), 24);
  const chartPoints = data.volumeTrend.map((pt, idx) => {
    const totalWidth = 440;
    const spacing = data.volumeTrend.length > 1 ? totalWidth / (data.volumeTrend.length - 1) : totalWidth;
    const x = 30 + idx * spacing;
    const y = 140 - (pt.value / maxVolume) * 110;
    return `${x},${y}`;
  });

  const linePath = chartPoints.length > 0 ? `M ${chartPoints.join(" L ")}` : "";
  const areaPath = chartPoints.length > 0
    ? `${linePath} L ${30 + (data.volumeTrend.length - 1) * (data.volumeTrend.length > 1 ? 440 / (data.volumeTrend.length - 1) : 440)},140 L 30,140 Z`
    : "";

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
                F
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">Fredrick</p>
                <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
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
        <div
          className="flex-grow flex flex-col overflow-hidden min-w-0"
          style={{ backgroundColor: "#050505" }}
        >

        {/* Header Bar */}
        <header
          className="h-[52px] border-b border-[#121216] px-6 flex justify-between items-center bg-[#070709] flex-shrink-0"
          style={{ backgroundColor: "#070709" }}
        >

          {/* Dashboard and Sub-tabs */}
          <div className="flex items-center gap-5">
            <h1 className="text-sm font-bold tracking-wider text-white uppercase">Dashboard</h1>

            {/* Reservation / Feedback Pill Switcher */}
            <div
              className="border border-zinc-900/80 p-0.5 rounded-full flex gap-0.5"
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

          {/* Right Utilities */}
          <div className="flex items-center gap-2">

            {/* Date range Selector */}
            <button
              className="border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-800 transition-colors"
              style={{ backgroundColor: "#0a0a0c" }}
            >
              <span>{dateRange}</span>
              <ChevronDown size={12} className="text-zinc-500" />
            </button>

            {/* Export Action */}
            <button
              className="border border-zinc-900 rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-[10px] font-bold text-zinc-300 hover:text-white hover:border-zinc-800 transition-colors"
              style={{ backgroundColor: "#0a0a0c" }}
            >
              <Download size={12} />
              <span>Export</span>
            </button>

            {/* Alerts Bell */}
            <div className="relative cursor-pointer p-1.5 rounded-lg hover:bg-zinc-900 transition-colors">
              <Bell size={15} className="text-zinc-300 hover:text-white" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-500 rounded-full text-[8px] font-extrabold text-black flex items-center justify-center">
                2
              </span>
            </div>

          </div>
        </header>

        {/* Dashboard Main Content (Long Scroll View) */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">

          {/* ================= SECTION 1: CALL OUTCOMES (Image 1) ================= */}
          <div
            className="border border-zinc-900 rounded-xl p-5 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >

            {/* Call Outcomes Header */}
            <div>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Call Outcomes</p>
              <h2 className="text-xl font-extrabold text-white mt-1 flex items-baseline gap-1.5">
                <span>{data.totalCalls}</span>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide normal-case">total calls</span>
              </h2>
            </div>

            {/* Segmented outcomes bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden flex">
              {data.outcomeBarData.map((bar, idx) => {
                const colors = ["#10b981", "#3b82f6", "#06b6d4", "#eab308", "#f97316", "#f43f5e", "#64748b"];
                const color = colors[idx % colors.length];
                const pct = data.totalCalls > 0 ? (bar.count / data.totalCalls) * 100 : 0;
                return (
                  <div key={bar.name} style={{ width: `${pct}%`, backgroundColor: color }} className="h-full" />
                );
              })}
            </div>

            {/* Color Dot Legend underneath */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 pt-1 text-[10px] font-semibold">
              {data.outcomeBarData.map((bar, idx) => {
                const colors = ["#10b981", "#3b82f6", "#06b6d4", "#eab308", "#f97316", "#f43f5e", "#64748b"];
                const color = colors[idx % colors.length];
                const pctLabel = getOutcomePct(bar.count);
                return (
                  <div key={bar.name} className="flex items-center gap-2 text-zinc-300">
                    <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />
                    <span>{bar.name} <strong className="text-white">{bar.count}</strong> <span className="text-zinc-500">({pctLabel})</span></span>
                  </div>
                );
              })}
            </div>

          </div>

          {/* ================= STATS GRID (Image 1) ================= */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Stat 1 */}
            <div
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Bookings Captured</p>
              <h3 className="text-2xl font-extrabold text-white">{data.totalBookingsCaptured}</h3>
              <div className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded-full">
                <span>↗</span>
                <span>{data.kpiTrends.totalBookingsCaptured.changePct.toFixed(1)}%</span>
              </div>
            </div>

            {/* Stat 2 */}
            <div
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Covers</p>
              <h3 className="text-2xl font-extrabold text-white">{data.totalCovers}</h3>
            </div>

            {/* Stat 3 */}
            <div
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Reservations %</p>
              <h3 className="text-2xl font-extrabold text-white">{data.confirmedPercentage.toFixed(1)}%</h3>
            </div>

            {/* Stat 4 */}
            <div
              className="border border-zinc-900 rounded-xl p-5 space-y-1.5 relative"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Avg Time</p>
              <h3 className="text-2xl font-extrabold text-white">{formatAvgTime(data.avgTime)}</h3>
              <div className="inline-flex items-center gap-1 bg-[#10b981]/10 text-[#10b981] text-[9px] font-bold px-2 py-0.5 rounded-full">
                <span>↗</span>
                <span>{data.kpiTrends.avgTime.changePct.toFixed(1)}%</span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute top-4 right-4" />
            </div>

          </div>

          {/* ================= WORK Breakdown: Non-Working Hours & Reservation breakdown (Image 1) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Non-working Hours Card */}
            <div
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[220px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Non-Working Hours Breakdown</h4>
                    <p className="text-[9px] text-zinc-500">Activity recorded outside your typical opening times</p>
                  </div>
                  <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold select-none">
                    ◆ AFTER HOURS
                  </span>
                </div>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-extrabold">{data.afterHoursStats.callsAfterHours}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">calls</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#10b981]">{data.afterHoursStats.bookingsDoneAfterHours}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">bookings</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#3b82f6]">{data.afterHoursStats.coversGeneratedAfterHours}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">covers</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900/60 text-[9px] font-bold">

                {/* Secured Bookings Line */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Secured Bookings
                    </span>
                    <span>
                      {data.afterHoursStats.bookingsDoneAfterHours > 0
                        ? ((data.afterHoursStats.breakdown.secured.count / data.afterHoursStats.bookingsDoneAfterHours) * 100).toFixed(1)
                        : "0.0"}%
                      <strong className="text-white">{data.afterHoursStats.breakdown.secured.count} | {data.afterHoursStats.breakdown.secured.covers}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div
                      className="bg-[#10b981] h-full"
                      style={{
                        width: data.afterHoursStats.bookingsDoneAfterHours > 0
                          ? `${(data.afterHoursStats.breakdown.secured.count / data.afterHoursStats.bookingsDoneAfterHours) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

                {/* Conversion Rate Line */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>After-Hours Conversion Rate</span>
                    <span className="text-white">
                      {data.afterHoursStats.callsAfterHours > 0
                        ? ((data.afterHoursStats.bookingsDoneAfterHours / data.afterHoursStats.callsAfterHours) * 100).toFixed(1)
                        : "0.0"}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full"
                      style={{
                        width: data.afterHoursStats.callsAfterHours > 0
                          ? `${(data.afterHoursStats.bookingsDoneAfterHours / data.afterHoursStats.callsAfterHours) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Reservation Breakdown Card */}
            <div
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[220px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Reservation Breakdown</h4>
                  <p className="text-[9px] text-zinc-500">Distribution of reservation types with covers</p>
                </div>

                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-3xl font-extrabold">{data.totalBookingsCaptured}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">bookings</span>
                  <span className="text-zinc-700 text-xs">•</span>
                  <span className="text-3xl font-extrabold text-[#3b82f6]">{data.totalCovers}</span>
                  <span className="text-zinc-500 text-[10px] font-bold">covers</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-zinc-900/60 text-[9px] font-bold">

                {/* Secured */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                      Secured Bookings
                    </span>
                    <span>
                      {data.totalBookingsCaptured > 0
                        ? ((data.reservationSeparation.securedBookings.count / data.totalBookingsCaptured) * 100).toFixed(1)
                        : "0.0"}%
                      <strong className="text-white"> {data.reservationSeparation.securedBookings.count} | {data.reservationSeparation.securedBookings.covers}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div
                      className="bg-[#10b981] h-full"
                      style={{
                        width: data.totalBookingsCaptured > 0
                          ? `${(data.reservationSeparation.securedBookings.count / data.totalBookingsCaptured) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

                {/* Large Party */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3b82f6]" />
                      Large Party Bookings
                    </span>
                    <span>
                      {data.totalBookingsCaptured > 0
                        ? ((data.reservationSeparation.largeGroup.count / data.totalBookingsCaptured) * 100).toFixed(1)
                        : "0.0"}%
                      <strong className="text-white"> {data.reservationSeparation.largeGroup.count} | {data.reservationSeparation.largeGroup.covers}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div
                      className="bg-[#3b82f6] h-full"
                      style={{
                        width: data.totalBookingsCaptured > 0
                          ? `${(data.reservationSeparation.largeGroup.count / data.totalBookingsCaptured) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

                {/* Promotional */}
                <div className="space-y-1">
                  <div className="flex justify-between text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                      Promotional / Offer
                    </span>
                    <span>
                      {data.totalBookingsCaptured > 0
                        ? ((data.reservationSeparation.promotions.count / data.totalBookingsCaptured) * 100).toFixed(1)
                        : "0.0"}%
                      <strong className="text-white"> {data.reservationSeparation.promotions.count} | {data.reservationSeparation.promotions.covers}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#18181c] rounded-full overflow-hidden">
                    <div
                      className="bg-[#eab308] h-full"
                      style={{
                        width: data.totalBookingsCaptured > 0
                          ? `${(data.reservationSeparation.promotions.count / data.totalBookingsCaptured) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ================= SECTION 2: BOOKINGS BREAKDOWN BAR CHART (Image 2) ================= */}
          <div
            className="border border-zinc-900 rounded-xl p-6 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Bookings Breakdown</h4>
                <p className="text-[9px] text-zinc-500">When bookings were created</p>
              </div>

              {/* Date Booked / Visit Date pills */}
              <div
                className="border border-zinc-900 p-0.5 rounded-lg flex gap-0.5 text-[9px] font-bold"
                style={{ backgroundColor: "#050507" }}
              >
                <button
                  onClick={() => setBookingsBreakdownTab("Date Booked")}
                  className={`px-3 py-1 rounded-md transition-all ${bookingsBreakdownTab === "Date Booked" ? "bg-[#10b981] text-white" : "text-zinc-500 bg-transparent"
                    }`}
                >
                  Date Booked
                </button>
                <button
                  onClick={() => setBookingsBreakdownTab("Visit Date")}
                  className={`px-3 py-1 rounded-md transition-all ${bookingsBreakdownTab === "Visit Date" ? "bg-[#10b981] text-white" : "text-zinc-500 bg-transparent"
                    }`}
                >
                  Visit Date
                </button>
              </div>
            </div>

            {/* Total Bookings label & thin top strip */}
            <div className="space-y-3">
              <h3 className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                <span>{data.totalBookingsCaptured}</span>
                <span className="text-zinc-500 text-[10px] font-bold normal-case">total bookings</span>
              </h3>

              <div className="w-full h-[3px] rounded-full overflow-hidden flex">
                <div className="bg-[#10b981] h-full" style={{ width: `${data.totalBookingsCaptured > 0 ? (data.reservationSeparation.securedBookings.count / data.totalBookingsCaptured) * 100 : 0}%` }} />
                <div className="bg-[#3b82f6] h-full" style={{ width: `${data.totalBookingsCaptured > 0 ? (data.reservationSeparation.largeGroup.count / data.totalBookingsCaptured) * 100 : 0}%` }} />
                <div className="bg-[#eab308] h-full" style={{ width: `${data.totalBookingsCaptured > 0 ? (data.reservationSeparation.promotions.count / data.totalBookingsCaptured) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Dynamic Max value calculation */}
            {selectedBookingsData.length > 0 && (
              <p className="text-[10px] text-zinc-500 font-semibold pt-1">
                Max Value: <strong className="text-white">
                  {Math.max(...selectedBookingsData.slice(0, 7).map(d => d.count))}
                </strong> bookings on {
                  (() => {
                    const peakItem = selectedBookingsData.slice(0, 7).reduce((max, item) => item.count > max.count ? item : max, selectedBookingsData[0]);
                    const d = new Date(peakItem.date);
                    return d.toLocaleDateString("en-US", { weekday: "short" });
                  })()
                }
              </p>
            )}

            {/* Bar Chart Graphics */}
            <div className="pt-6 grid grid-cols-7 items-end gap-3 h-[200px] border-b border-zinc-900/60 pb-2">

              {selectedBookingsData.slice(0, 7).map((item, idx) => {
                const dateObj = new Date(item.date);
                const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
                const displayDate = dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });

                const maxCount = Math.max(...selectedBookingsData.slice(0, 7).map(d => d.count), 1);
                const isPeak = item.count === maxCount;
                const barHeight = Math.max(25, (item.count / maxCount) * 140);

                const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#eab308", "#f43f5e", "#ec4899", "#06b6d4"];
                const color = colors[idx % colors.length];

                return (
                  <div key={item.date} className="flex flex-col items-center gap-2 group cursor-pointer relative">
                    {isPeak && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute -top-5" />}
                    <div
                      className="w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110"
                      style={{ height: `${barHeight}px`, backgroundColor: color }}
                    />
                    <div className="text-center pt-1.5 space-y-0.5">
                      <p className="text-[10px] font-bold animate-pulse-subtle" style={{ color }}>{dayName}</p>
                      <p className="text-[9px] text-zinc-500 font-medium">{displayDate}</p>
                      {isPeak && (
                        <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2 py-0.5 rounded-md font-extrabold uppercase scale-90 tracking-wide mt-1 block">
                          PEAK
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

          {/* ================= SECTION 3: CALLS PER DAY & UPSELL (Image 3) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Calls Per Day - Area Line Chart (Width 2 cols) */}
            <div
              className="border border-zinc-900 rounded-xl p-6 md:col-span-2 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Calls Per Day</h4>
                <p className="text-[9px] text-zinc-500">Calls trend for Last 7 Days (Current Period)</p>
              </div>

              {/* High-Fidelity SVG Area Line Chart */}
              <div className="w-full h-[180px] relative mt-4">
                <svg viewBox="0 0 500 150" className="w-full h-full">
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#1f1f23" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="140" x2="500" y2="140" stroke="#1f1f23" strokeWidth="0.5" />

                  {/* Grid Labels (Left) */}
                  <text x="0" y="24" fill="#64748b" fontSize="8" fontWeight="bold">{maxVolume}</text>
                  <text x="0" y="54" fill="#64748b" fontSize="8" fontWeight="bold">{Math.round(maxVolume * 0.75)}</text>
                  <text x="0" y="84" fill="#64748b" fontSize="8" fontWeight="bold">{Math.round(maxVolume * 0.5)}</text>
                  <text x="0" y="114" fill="#64748b" fontSize="8" fontWeight="bold">{Math.round(maxVolume * 0.25)}</text>
                  <text x="0" y="144" fill="#64748b" fontSize="8" fontWeight="bold">0</text>

                  {/* Area Fill */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#greenGrad)"
                      opacity="0.15"
                    />
                  )}

                  {/* Smooth Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X Axis Dates bottom */}
                <div className="flex justify-between pl-6 text-[8px] text-zinc-500 font-bold select-none mt-2">
                  {data.volumeTrend.map(pt => (
                    <span key={pt.label}>{pt.label}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Upsell Performance (Width 1 col) */}
            <div
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[260px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Upsell Performance</h4>
                <p className="text-[9px] text-zinc-500">Extra revenue generated from calls</p>
              </div>

              <div className="py-8 text-center">
                <h2 className="text-4xl font-black text-cyan-400 tracking-tight">
                  £{data.upsellStats.totalRevenue.toFixed(2)}
                </h2>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-zinc-900/60 text-[9px] font-bold text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" />
                <span>Total Successful Upsells</span>
                <span className="ml-auto text-white">{data.upsellStats.totalUpsells}</span>
              </div>
            </div>

          </div>

          {/* ================= SECTION 4: CONVERSION FUNNEL & TRENDING (Image 4) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Conversion Funnel */}
            <div
              className="border border-zinc-900 rounded-xl p-6 flex flex-col justify-between min-h-[350px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Conversion Funnel</h4>
                  <p className="text-[9px] text-zinc-500">Guest journey from initial call to confirmed booking</p>
                </div>

                {/* Funnel Step Horizontal Bars */}
                <div className="space-y-4 pt-4">
                  {data.conversionFunnel.map((funnel, idx) => {
                    const colors = ["#10b981", "#3b82f6", "#8b5cf6"];
                    const color = colors[idx % colors.length];
                    const leftPad = ["pl-0", "pl-4", "pl-8"][idx % 3];
                    return (
                      <div key={funnel.stage} className={`space-y-1 ${leftPad}`}>
                        <div
                          className="w-full h-11 rounded-lg flex items-center justify-between px-4 border"
                          style={{ backgroundColor: `${color}25`, borderColor: `${color}20` }}
                        >
                          <span className="text-[10px] font-bold text-white">{funnel.stage}</span>
                          <span className="text-xs font-black text-white">{funnel.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funnel Table Breakdown */}
              <div className="space-y-2.5 pt-6 border-t border-zinc-900/60 text-[9px] font-bold text-zinc-400">
                {data.conversionFunnel.map((funnel, idx) => {
                  const colors = ["#10b981", "#3b82f6", "#8b5cf6"];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={funnel.stage} className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full block" style={{ backgroundColor: color }} />
                        {funnel.stage}
                      </span>
                      <span className="flex items-center gap-6">
                        <span className="text-white">{funnel.count}</span>
                        <span className="text-yellow-500 w-8 text-right">{funnel.pct}%</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Topics */}
            <div
              className="border border-zinc-900 rounded-xl p-6 space-y-4 min-h-[350px]"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div>
                <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Trending Topics</h4>
                <p className="text-[9px] text-zinc-500">Top reservation themes and their WoW change</p>
              </div>

              {/* Topics Sorted List */}
              <div className="space-y-2.5">
                {data.trendingTopics.slice(0, 5).map((topic, idx) => {
                  const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#eab308", "#rose-400"];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={topic.topic}
                      className="border border-zinc-900 rounded-xl p-3.5 flex items-center justify-between"
                      style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center border"
                          style={{ backgroundColor: `${color}15`, borderColor: `${color}25`, color: color }}
                        >
                          {idx + 1}
                        </div>
                        <span className="text-xs font-bold text-white">{topic.topic}</span>
                      </div>
                      <span className="text-[9px] font-bold text-zinc-500 tracking-wider">
                        {topic.count} MENTIONS
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ================= SECTION 5: TOP QUERIES & TOP SPECIAL REQUESTS (Image 5) ================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Top Queries list card */}
            <div
              className="border border-zinc-900 rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Top Queries</h4>
                  <p className="text-[9px] text-zinc-500">Most frequently asked questions for last 7 days</p>
                </div>
                <Award size={14} className="text-zinc-500" />
              </div>

              {/* Sorted Queries items */}
              <div className="space-y-3">
                {data.topQueriesToday.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.query}
                    className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                    style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#10b981]/10 text-[#10b981] text-[9.5px] font-bold flex items-center justify-center border border-[#10b981]/20">
                          {idx + 1}
                        </div>
                        <span className="text-[11px] font-bold text-white truncate max-w-[200px]">{item.query}</span>
                      </div>
                      <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                        Asked {item.count} times
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Special Requests */}
            <div
              className="border border-zinc-900 rounded-xl p-6 space-y-4"
              style={{ backgroundColor: "#0b0b0d" }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Top Special Requests</h4>
                  <p className="text-[9px] text-zinc-500">Common requests for last 7 days</p>
                </div>
                <Activity size={14} className="text-zinc-500" />
              </div>

              {/* Categorized Requests */}
              <div className="space-y-3">
                {data.topSpecialRequests.slice(0, 5).map((item, idx) => {
                  const colors = ["#eab308", "#8b5cf6", "#06b6d4", "#f43f5e", "#10b981"];
                  const color = colors[idx % colors.length];
                  return (
                    <div
                      key={item.request}
                      className="border border-zinc-900 rounded-xl p-3 flex flex-col gap-1"
                      style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-5 h-5 rounded-full text-[9.5px] font-bold flex items-center justify-center border"
                            style={{ backgroundColor: `${color}10`, borderColor: `${color}20`, color: color }}
                          >
                            {idx + 1}
                          </div>
                          <span className="text-[11px] font-bold text-white">{item.request}</span>
                        </div>
                        <span className="text-[8.5px] font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">
                          Requested {item.count} times
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ================= RESERVATION TIMING DISTRIBUTION (Image 5 bottom) ================= */}
          <div
            className="border border-zinc-900 rounded-xl p-6 space-y-4"
            style={{ backgroundColor: "#0b0b0d" }}
          >

            <div>
              <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider">Reservation Timing Distribution</h4>
              <p className="text-[9px] text-zinc-500">Booking patterns by hour of day</p>
            </div>

            {/* Weekly slots section heading */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider mb-3">Calls for Last 7 Days</p>

              {/* Mon-Sun cards wrap */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {Object.entries(data.last7DaysCallCount).map(([day, counts]) => {
                  const dailyTotal = Object.values(counts).reduce((a, b) => a + b, 0);
                  return (
                    <div
                      key={day}
                      className="border border-zinc-900 rounded-lg p-3 text-center space-y-2"
                      style={{ backgroundColor: "rgba(12, 12, 14, 0.8)" }}
                    >
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">{day}</span>
                      <div className="w-full h-8 bg-zinc-900/60 rounded border border-zinc-900 flex flex-col items-center justify-center text-[10px] font-semibold">
                        <span className="text-xs font-black text-white">{dailyTotal}</span>
                        <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wide">calls</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      </div>

    </div>
  );
}
