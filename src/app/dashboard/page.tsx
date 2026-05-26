"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
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
} from "lucide-react";

// ================= API CLIENT =================

const apiClient = axios.create({
  baseURL: "https://voice.huemanai.co.uk/api",
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const rawToken = localStorage.getItem("access_token") || "";
    const token = rawToken.replace("Bearer ", "");
    const csrfToken = localStorage.getItem("csrf_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    }
  }

  config.headers.Accept = "application/json";
  config.headers["Content-Type"] = "application/json";

  return config;
});

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

  const [activeTab, setActiveTab] = useState("Dashboard");

  const [data, setData] = useState<DashboardData>(DEFAULT_DATA);

  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState<any>({});

  // ================= FETCH USER =================

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user_data");

      if (user) {
        setUserData(JSON.parse(user));
      }
    }
  }, []);

  // ================= FETCH DASHBOARD =================

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const rawToken = localStorage.getItem("access_token") || "";
      const token = rawToken.replace("Bearer ", "");
      const csrf = localStorage.getItem("csrf_token") || "";

      console.log("TOKEN =>", token);

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

      console.log("SUCCESS =>", response.data);

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

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

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
    <div className="flex h-screen bg-black text-white overflow-hidden">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-[240px] bg-[#0b0b0d] border-r border-zinc-900 flex flex-col justify-between p-4">

        <div>

          <h1 className="text-xl font-black mb-8">HuemanAI</h1>

          <div className="space-y-2">

            {[
              { name: "Dashboard", icon: <Layers size={16} /> },
              { name: "Calls", icon: <PhoneCall size={16} /> },
              { name: "Actions", icon: <Calendar size={16} /> },
              { name: "Insights", icon: <Activity size={16} /> },
              { name: "Reports", icon: <Award size={16} /> },
            ].map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeTab === item.name
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900"
                  }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}

          </div>
        </div>

        {/* ================= USER ================= */}

        <div className="border-t border-zinc-900 pt-4">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
              {userData?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <p className="text-sm font-bold">
                {userData?.first_name || "User"}
              </p>

              <p className="text-xs text-zinc-500">
                {userData?.email || ""}
              </p>
            </div>

          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-900"
          >
            <LogOut size={14} />
            Logout
          </button>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <div className="flex-1 overflow-y-auto">

        {/* ================= HEADER ================= */}

        <header className="h-[70px] border-b border-zinc-900 flex items-center justify-between px-6 bg-[#070709]">

          <div>
            <h2 className="text-2xl font-black">Dashboard</h2>
            <p className="text-xs text-zinc-500">
              Reservation Analytics
            </p>
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
  );
}