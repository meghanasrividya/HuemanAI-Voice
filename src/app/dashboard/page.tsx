"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Bell,
  Download,
  LayoutDashboard,
  Phone,
  ClipboardList,
  TrendingUp,
  PhoneCall,
  FileBarChart2,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const COLORS = [
  "#34d399",
  "#38bdf8",
  "#8b5cf6",
  "#facc15",
  "#fb7185",
  "#d946ef",
  "#22d3ee",
];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] =
    useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] =
    useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchAnalyticsInsights();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const token =
        localStorage
          .getItem("access_token")
          ?.replace("Bearer ", "") || "";

      const csrf =
        localStorage.getItem("csrf_token") || "";

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

      setData(response.data);
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  const fetchAnalyticsInsights = async () => {
    try {

      setAnalyticsLoading(true);

      const token =
        localStorage
          .getItem("access_token")
          ?.replace("Bearer ", "") || "";

      const csrf =
        localStorage.getItem("csrf_token") || "";

      const response = await axios.post(
        "/api/dashboard/analytics-insights",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-CSRF-TOKEN": csrf,
          },
        }
      );

      setAnalyticsData(response.data);

    } catch (err: any) {

      console.log(
        err?.response?.data || err.message
      );

    } finally {

      setAnalyticsLoading(false);
    }
  };

  if (
    loading ||
    analyticsLoading ||
    !data
  ) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white text-3xl font-bold">
        Loading Dashboard...
      </div>
    );
  }

  const orderedBookings = [
    ...data.dailyBookings.byDateBooked,
  ].sort((a: any, b: any) => {
    const dayA = new Date(a.date).getDay();
    const dayB = new Date(b.date).getDay();
    const valA = dayA === 0 ? 7 : dayA;
    const valB = dayB === 0 ? 7 : dayB;
    return valA - valB;
  });

  return (
    <div className="bg-black text-white min-h-screen flex overflow-hidden">

      {/* SIDEBAR */}

      <aside className="w-[260px] bg-[#070707] border-r border-zinc-900 flex flex-col justify-between">

        <div>

          <div className="h-[72px] flex items-center px-6 border-b border-zinc-900">
            <h1 className="text-2xl font-black">
              HuemanAI
            </h1>
          </div>

          <div className="p-4 space-y-2">

            {[
              {
                icon: <LayoutDashboard size={18} />,
                label: "Dashboard",
              },
              {
                icon: <Phone size={18} />,
                label: "Calls",
              },
              {
                icon: <ClipboardList size={18} />,
                label: "Actions",
              },
              {
                icon: <TrendingUp size={18} />,
                label: "Insights",
              },
              {
                icon: <PhoneCall size={18} />,
                label: "Outbound",
              },
              {
                icon: <FileBarChart2 size={18} />,
                label: "Reports",
              },
              {
                icon: <Sparkles size={18} />,
                label: "Netra AI",
              },
              {
                icon: <Settings size={18} />,
                label: "Admin",
              },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${idx === 0
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900"
                  }`}
              >
                {item.icon}
                <span className="text-sm">
                  {item.label}
                </span>
              </button>
            ))}

          </div>

        </div>

        <div className="p-4 border-t border-zinc-900">

          <div className="flex items-center gap-3 mb-5">

            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
              F
            </div>

            <div>
              <p className="font-semibold text-sm">
                Fredrick
              </p>

              <p className="text-xs text-zinc-500">
                fredrick@huemanai.co.uk
              </p>
            </div>

          </div>

          <button className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm">
            <LogOut size={16} />
            Logout
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="flex-1 overflow-y-auto bg-black">

        {/* HEADER */}

        <div className="h-[58px] border-b border-zinc-900 flex items-center justify-between px-6 sticky top-0 bg-black z-50">

          <div className="flex items-center gap-4">

            <h1 className="text-[28px] font-black tracking-tight">
              Dashboard
            </h1>

            <div className="flex bg-[#0d0d0d] border border-zinc-800 rounded-full p-1">

              <button className="bg-white text-black rounded-full px-5 py-1 text-sm font-semibold">
                Reservation
              </button>

              <button className="px-5 py-1 text-sm text-zinc-400">
                Feedback
              </button>

            </div>

          </div>

          <div className="flex items-center gap-4">

            <button className="border border-zinc-800 rounded-xl px-4 py-2 text-sm">
              Last 7 days
            </button>

            <button className="border border-zinc-800 rounded-xl px-4 py-2 flex items-center gap-2 text-sm">
              <Download size={14} />
              Export
            </button>

            <div className="relative">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full"></div>
            </div>

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-4 space-y-4 max-w-[1400px] mx-auto">

          {/* OUTCOME */}

          <Section>

            <p className="text-zinc-500 mb-3">
              Call Outcomes
            </p>

            <h2 className="text-5xl font-black mb-6">
              {data.totalCalls}
              <span className="text-2xl ml-2 text-zinc-500">
                total calls
              </span>
            </h2>

            <div className="h-4 rounded-full overflow-hidden flex mb-6">

              {data.outcomeBarData.map(
                (item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      width: `${(item.count /
                        data.totalCalls) *
                        100
                        }%`,
                      background: COLORS[idx],
                    }}
                  />
                )
              )}

            </div>

            <div className="flex flex-wrap gap-6">

              {data.outcomeBarData.map(
                (item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm"
                  >

                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: COLORS[idx],
                      }}
                    />

                    <span className="text-zinc-300">
                      {item.name}
                    </span>

                    <span className="font-bold">
                      {item.count}
                    </span>

                    <span className="text-zinc-500">
                      (
                      {(
                        (item.count /
                          data.totalCalls) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>

                  </div>
                )
              )}

            </div>

          </Section>

          {/* KPI */}

          <div className="grid grid-cols-4 gap-5">

            <KPI
              title="Total Bookings Captured"
              value={data.totalBookingsCaptured}
              growth={
                data.kpiTrends
                  .totalBookingsCaptured
                  .changePct
              }
            />

            <KPI
              title="Total Covers"
              value={data.totalCovers}
            />

            <KPI
              title="Reservations %"
              value={`${data.confirmedPercentage}%`}
            />

            <KPI
              title="Avg Time"
              value={`${Math.floor(
                data.avgTime / 60
              )}:${String(
                data.avgTime % 60
              ).padStart(2, "0")}`}
              growth={
                data.kpiTrends.avgTime.changePct
              }
            />

          </div>

          {/* BREAKDOWN */}

          <div className="grid grid-cols-2 gap-6">

            <Section>

              <div className="flex justify-between mb-6">

                <div>
                  <h3 className="font-black text-xl">
                    NON-WORKING HOURS BREAKDOWN
                  </h3>

                  <p className="text-zinc-500 text-sm mt-1">
                    Activity recorded outside your typical opening times
                  </p>
                </div>

                <div className="bg-violet-900/40 text-violet-300 px-4 py-1 rounded-full text-xs h-fit">
                  AFTER HOURS
                </div>

              </div>

              <div className="flex items-end gap-3 mb-6">

                <div className="text-6xl font-black">
                  {
                    data.afterHoursStats
                      .callsAfterHours
                  }
                </div>

                <div className="pb-2 text-zinc-400">
                  calls
                </div>

              </div>

              <div className="h-3 rounded-full bg-zinc-900 overflow-hidden mb-6">

                <div className="h-full bg-emerald-400 w-full"></div>

              </div>

              <div className="flex justify-between text-sm mb-3">

                <span>
                  Secured Bookings
                </span>

                <span>
                  100%
                </span>

              </div>

              <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">

                <div className="h-full bg-emerald-400 w-full"></div>

              </div>

            </Section>

            <Section>

              <h3 className="font-black text-xl mb-6">
                RESERVATION BREAKDOWN
              </h3>

              <div className="flex gap-4 items-end mb-6">

                <div className="text-6xl font-black">
                  {
                    data.totalBookingsCaptured
                  }
                </div>

                <div className="pb-2 text-zinc-400">
                  bookings
                </div>

                <div className="text-5xl font-black text-cyan-400">
                  {data.totalCovers}
                </div>

                <div className="pb-2 text-zinc-400">
                  covers
                </div>

              </div>

              {[
                {
                  label:
                    "Secured Bookings",
                  value:
                    data.reservationSeparation
                      .securedBookings
                      .count,
                  covers:
                    data.reservationSeparation
                      .securedBookings
                      .covers,
                  color: "#34d399",
                },
                {
                  label:
                    "Large Party Bookings",
                  value:
                    data.reservationSeparation
                      .largeGroup.count,
                  covers:
                    data.reservationSeparation
                      .largeGroup.covers,
                  color: "#38bdf8",
                },
                {
                  label:
                    "Promotional / Offer",
                  value:
                    data.reservationSeparation
                      .promotions.count,
                  covers:
                    data.reservationSeparation
                      .promotions.covers,
                  color: "#facc15",
                },
              ].map((item, idx) => (

                <div key={idx} className="mb-5">

                  <div className="flex justify-between mb-2 text-sm">

                    <span>
                      {item.label}
                    </span>

                    <span>
                      {item.value} |{" "}
                      {item.covers}
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-zinc-900 overflow-hidden">

                    <div
                      className="h-full"
                      style={{
                        width: `${(item.value /
                          data
                            .totalBookingsCaptured) *
                          100
                          }%`,
                        background: item.color,
                      }}
                    />

                  </div>

                </div>
              ))}

            </Section>

          </div>

          {/* BOOKINGS */}

          {/* BOOKINGS BREAKDOWN */}

          <Section>

            <div className="flex items-start justify-between mb-8">

              <div>

                <h2 className="text-3xl font-black tracking-tight">
                  BOOKINGS BREAKDOWN
                </h2>

                <p className="text-zinc-500 text-sm mt-1">
                  When bookings were created
                </p>

              </div>

              <div className="flex bg-[#0f0f10] border border-zinc-800 rounded-full p-1">

                <button className="bg-emerald-400 text-black text-xs font-bold px-5 py-2 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                  Date Booked
                </button>

                <button className="px-5 py-2 text-xs text-zinc-400">
                  Visit Date
                </button>

              </div>

            </div>

            {/* TOTAL */}

            <div className="flex items-end gap-3 mb-6">

              <h1 className="text-6xl font-black">
                {data.totalBookingsCaptured}
              </h1>

              <span className="text-zinc-400 mb-2">
                total bookings
              </span>

            </div>

            {/* COLOR LINE */}

            <div className="flex h-3 rounded-full overflow-hidden mb-8">

              {COLORS.map((color, idx) => (

                <div
                  key={idx}
                  className="flex-1 mx-[1px]"
                  style={{
                    background: color,
                  }}
                />

              ))}

            </div>

            {/* MAX VALUE */}

            <p className="text-zinc-500 text-sm mb-10">
              Max Value:
              <span className="font-bold text-white ml-1">
                {Math.max(
                  ...orderedBookings.map(
                    (i: any) => i.count
                  )
                )} bookings
              </span>
            </p>

            {/* CUSTOM BARS */}

            <div className="flex items-end justify-between h-[250px] gap-6 px-4">

              {orderedBookings.map(
                (item: any, idx: number) => {

                  const max = Math.max(
                    ...orderedBookings.map(
                      (i: any) => i.count
                    )
                  );

                  const height =
                    (item.count / max) * 150;

                  const gradients = [
                    "from-emerald-500 to-emerald-400",
                    "from-sky-500 to-sky-400",
                    "from-violet-500 to-violet-400",
                    "from-amber-500 to-yellow-400",
                    "from-rose-500 to-pink-400",
                    "from-fuchsia-500 to-purple-400",
                    "from-cyan-500 to-cyan-400",
                  ];

                  const day = new Date(
                    item.date
                  ).toLocaleDateString("en-US", {
                    weekday: "short",
                  });

                  const date = new Date(
                    item.date
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center justify-end h-full flex-1"
                    >

                      {/* BAR */}

                      <div
                        className={`w-full rounded-t-[18px] bg-gradient-to-b ${gradients[idx]} relative transition-all duration-500 hover:scale-105`}
                        style={{
                          height: `${height}px`,
                          minHeight: "35px",
                        }}
                      >

                        {idx === 1 && (
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f5d7b7] rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                        )}

                      </div>

                      {/* LABELS */}

                      <div className="mt-6 text-center">

                        <p
                          className="font-black text-sm tracking-wide"
                          style={{
                            color: COLORS[idx],
                          }}
                        >
                          {day.toUpperCase()}
                        </p>

                        <p className="text-zinc-500 text-xs mt-1">
                          {date}
                        </p>

                        {idx === 1 && (
                          <div className="mt-3 inline-flex bg-sky-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.7)]">
                            PEAK
                          </div>
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </Section>

          {/* CALLS + UPSELL */}

          <div className="grid grid-cols-3 gap-6">

            <Section className="col-span-2">

              <h3 className="font-black text-xl mb-6">
                CALLS PER DAY
              </h3>

              <div className="h-[320px]">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart
                    data={data.volumeTrend}
                  >

                    <XAxis
                      dataKey="label"
                      stroke="#666"
                    />

                    <Tooltip />

                    <defs>
                      <linearGradient
                        id="color"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity={0.5}
                        />

                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity={0}
                        />

                      </linearGradient>
                    </defs>

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#34d399"
                      fill="url(#color)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </Section>

            <Section>

              <h3 className="font-black text-xl mb-3">
                UPSELL PERFORMANCE
              </h3>

              <p className="text-zinc-500 text-sm mb-16">
                Extra revenue generated from calls
              </p>

              <div className="flex justify-center items-center h-[200px]">

                <h1 className="text-6xl font-black text-cyan-400">
                  £
                  {
                    data.upsellStats
                      .totalRevenue
                  }
                </h1>

              </div>

            </Section>


          </div>

          {/* CONVERSION + TRENDING */}

          <div className="grid grid-cols-2 gap-6">

            {/* CONVERSION */}

            <Section>

              <h2 className="text-2xl font-black mb-1">
                CONVERSION FUNNEL
              </h2>

              <p className="text-zinc-500 text-sm mb-8">
                Guest journey from initial call to confirmed booking
              </p>

              {/* BARS */}

              <div className="flex items-end justify-center gap-6 h-[180px] mb-10">

                {data.conversionFunnel.map(
                  (item: any, idx: number) => {

                    const gradients = [
                      "from-emerald-500 to-emerald-400",
                      "from-sky-500 to-sky-400",
                      "from-violet-500 to-violet-400",
                    ];

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center flex-1"
                      >

                        <div
                          className={`w-full rounded-t-2xl bg-gradient-to-b ${gradients[idx]}`}
                          style={{
                            height: `${item.pct * 1.3}px`,
                            minHeight: "50px",
                          }}
                        />

                        <p className="text-xs text-zinc-400 mt-4 text-center">
                          {item.stage}
                        </p>

                      </div>
                    );
                  }
                )}

              </div>

              {/* STATS */}

              <div className="space-y-4">

                {data.conversionFunnel.map(
                  (item: any, idx: number) => {

                    const colors = [
                      "#34d399",
                      "#38bdf8",
                      "#8b5cf6",
                    ];

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between border border-zinc-900 rounded-xl px-4 py-4"
                      >

                        <div className="flex items-center gap-3">

                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              background: colors[idx],
                            }}
                          />

                          <span className="text-sm">
                            {item.stage}
                          </span>

                        </div>

                        <div className="flex items-center gap-3">

                          <span className="font-bold">
                            {item.count}
                          </span>

                          <div className="bg-emerald-900/40 text-emerald-400 text-xs font-bold px-2 py-1 rounded-full">
                            {item.pct}%
                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </Section>

            {/* TRENDING */}

            <Section>

              <h2 className="text-2xl font-black mb-1">
                TRENDING TOPICS
              </h2>

              <p className="text-zinc-500 text-sm mb-8">
                Top reservation themes and their WoW change
              </p>

              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2">

                {analyticsData?.trendingTopics?.map(
                  (topic: any, idx: number) => (

                    <div
                      key={idx}
                      className="border rounded-[18px] p-3"
                      style={{
                        borderColor: COLORS[idx],
                      }}
                    >

                      <div className="flex items-start gap-4">

                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                          style={{
                            background: `${COLORS[idx]}20`,
                            color: COLORS[idx],
                          }}
                        >
                          {idx + 1}
                        </div>

                        <div>

                          <h3 className="font-bold text-lg">
                            {topic.label}
                          </h3>

                          <p className="text-zinc-500 text-sm mt-1">
                            {topic.count} mentions
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </Section>

          </div>

          {/* TOP QUERIES + SPECIAL REQUESTS */}

          <div className="grid grid-cols-2 gap-6">

            {/* TOP QUERIES */}

            <Section>

              <div className="flex justify-between items-start mb-8">

                <div>

                  <h2 className="text-2xl font-black">
                    TOP QUERIES
                  </h2>

                  <p className="text-zinc-500 text-sm mt-1">
                    Most frequently asked questions for last 7 days
                  </p>

                </div>

              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">

                {analyticsData?.topQueries?.map(
                  (item: any, idx: number) => (

                    <div
                      key={idx}
                      className="border border-[#1b1b1b] rounded-[18px] p-4"
                    >

                      <div className="flex items-start gap-4">

                        <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black">
                          {idx + 1}
                        </div>

                        <div>

                          <h3 className="font-bold text-lg">
                            {item.label}
                          </h3>

                          <p className="text-sm text-zinc-300 mt-1">
                            Asked {item.count} times
                          </p>

                          <p className="text-zinc-500 italic text-sm mt-3">
                            “{item.sampleVerbatim}”
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </Section>

            {/* SPECIAL REQUESTS */}

            <Section>

              <h2 className="text-2xl font-black">
                TOP SPECIAL REQUESTS
              </h2>

              <p className="text-zinc-500 text-sm mt-1 mb-8">
                Common requests for last 7 days
              </p>

              <div className="space-y-8 max-h-[420px] overflow-y-auto pr-2">

                {analyticsData?.topSpecialRequests?.map(
                  (item: any, idx: number) => (

                    <div key={idx}>

                      <div className="flex items-center gap-2 mb-4">

                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: COLORS[idx],
                          }}
                        />

                        <span className="uppercase tracking-[2px] text-xs text-zinc-500 font-bold">
                          {item.category}
                        </span>

                      </div>

                      <div className="border border-zinc-800 rounded-2xl p-5">

                        <div className="flex items-start gap-4">

                          <div className="w-10 h-10 rounded-full border border-sky-500/30 bg-sky-500/10 flex items-center justify-center text-sky-400 font-black">
                            {idx + 1}
                          </div>

                          <div>

                            <h3 className="font-bold text-lg">
                              {item.label}
                            </h3>

                            <p className="text-zinc-300 text-sm mt-1">
                              Requested {item.count} times
                            </p>

                            <p className="text-zinc-500 italic text-sm mt-3">
                              “{item.sampleDetail}”
                            </p>

                          </div>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </Section>

          </div>

          {/* RESERVATION TIMING */}

          {/* RESERVATION TIMING */}

          <Section>

            <h2 className="text-[18px] font-black tracking-wide">
              RESERVATION TIMING DISTRIBUTION
            </h2>

            <p className="text-zinc-500 text-sm mt-1 mb-8">
              Booking patterns by hour of day
            </p>

            {/* INNER WRAPPER */}

            <div className="border border-[#1b1b1b] rounded-[20px] p-6 bg-[#0b0b0c]">

              <h3 className="text-[16px] font-bold mb-6">
                Calls for Last 7 Days
              </h3>

              {/* DAYS */}

              <div className="grid grid-cols-7 gap-4">

                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day: any, idx: number) => {

                  const slots =
                    data.last7DaysCallCount?.[day] ||
                    data.last7DaysCallCount?.[
                    day.toLowerCase()
                    ] ||
                    {};

                  const total = Object.values(slots).reduce(
                    (a: any, b: any) => a + b,
                    0
                  );

                  return (
                    <div
                      key={idx}
                      className="border rounded-[18px] px-5 py-6 bg-[#0c0c0d]"
                      style={{
                        borderColor: COLORS[idx],
                      }}
                    >

                      <p
                        className="text-[11px] font-black tracking-[1px] mb-4"
                        style={{
                          color: COLORS[idx],
                        }}
                      >
                        {day}
                      </p>

                      <h2 className="text-[56px] leading-none font-black">
                        {total}
                      </h2>

                      <p className="text-zinc-500 text-xs mt-3">
                        {Object.keys(slots).length} HOURS ACTIVE
                      </p>

                    </div>
                  );
                })}

              </div>

            </div>

            {/* TIMING */}

            <div className="mt-10">

              <h3 className="text-[16px] font-black mb-2">
                RESERVATION TIME PER SLOT
              </h3>

              <p className="text-zinc-500 text-sm mb-12">
                Max Value:
                <span className="text-white font-bold ml-1">
                  {Math.max(
                    ...data.timingDistribution.map(
                      (i: any) => i.value
                    )
                  )} reservations
                </span>

                <span className="ml-1">
                  at
                </span>

                <span className="text-white font-bold ml-1">
                  {
                    data.timingDistribution.find(
                      (i: any) =>
                        i.value ===
                        Math.max(
                          ...data.timingDistribution.map(
                            (x: any) => x.value
                          )
                        )
                    )?.label
                  }
                </span>

              </p>

              {/* GRAPH */}

              <div className="flex items-end h-[300px] gap-[2px]">

                {data.timingDistribution.map(
                  (item: any, idx: number) => {

                    const max = Math.max(
                      ...data.timingDistribution.map(
                        (i: any) => i.value
                      )
                    );

                    const height =
                      (item.value / max) * 230;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col justify-end items-center h-full"
                      >

                        <div
                          className="w-full bg-cyan-400 rounded-t-[14px] transition-all duration-300"
                          style={{
                            height: `${height}px`,
                            minHeight: "28px",
                          }}
                        />

                        <p className="text-[12px] text-zinc-500 mt-5">
                          {item.label}
                        </p>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </Section>


        </div>

      </main>

    </div>
  );
}

function Section({
  children,
  className = "",
}: any) {
  return (
    <div
      className={`bg-[#090909] border border-[#1a1a1a] rounded-[22px] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] ${className}`}
    >
      {children}
    </div>
  );
}

function KPI({
  title,
  value,
  growth,
}: any) {
  return (
    <div className="bg-[#090909] border border-[#1a1a1a] rounded-[22px] p-5 min-h-[125px] flex flex-col justify-between">

      <div>

        <p className="text-zinc-500 text-sm mb-4">
          {title}
        </p>

        <h2 className="text-[52px] leading-none font-black tracking-tight">
          {value}
        </h2>

      </div>

      {growth !== undefined && (
        <div className="bg-emerald-900/40 text-emerald-400 text-sm font-semibold px-3 py-1 rounded-full w-fit">
          ↗ {growth}%
        </div>
      )}

    </div>
  );
}