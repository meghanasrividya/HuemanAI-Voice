"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";


import {
  Bell,
  Download,
  FileBarChart2,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = [
  "#27d6a2",
  "#24b8ea",
  "#8b5cf6",
  "#f6c21a",
  "#ef5574",
  "#d947e8",
  "#20c4d7",
];

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DATE_RANGE_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last7" },
  { label: "Last 14 days", value: "last14" },
  { label: "Last 30 days", value: "last30" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
];


const SCROLL_PANEL =
  "overflow-y-auto pr-2 [scrollbar-color:#333_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#333]";

const tooltipContentStyle = {
  backgroundColor: "#151515",
  border: "1px solid #2a2a2a",
  borderRadius: "8px",
  color: "#f4f4f5",
  fontSize: "11px",
};


const tooltipLabelStyle = {
  color: "#a1a1aa",
  fontSize: "10px",
};


// ─── Types ───────────────────────────────────────────────────────────────────

type NumericValue = number | string | null | undefined;

type OutcomeItem = {
  name?: string;
  count?: NumericValue;
};

type BookingItem = {
  date?: string;
  count?: NumericValue;
};

type ReservationGroup = {
  count?: NumericValue;
  covers?: NumericValue;
};

type AfterHoursStats = {
  callsAfterHours?: NumericValue;
  bookingsAfterHours?: NumericValue;
  bookingsDoneAfterHours?: NumericValue;
  bookings?: NumericValue;
  coversAfterHours?: NumericValue;
  coversGeneratedAfterHours?: NumericValue;
  covers?: NumericValue;
  conversionRate?: NumericValue;
  securedBookings?: ReservationGroup;
};

type ReservationSeparation = {
  securedBookings?: ReservationGroup;
  largeGroup?: ReservationGroup;
  promotions?: ReservationGroup;
};

type TrendValue = {
  changePct?: NumericValue;
};

type VolumePoint = {
  label?: string;
  value?: NumericValue;
};

type UpsellStats = {
  totalRevenue?: NumericValue;
  successfulUpsells?: NumericValue;
};

type ConversionItem = {
  stage?: string;
  count?: NumericValue;
  pct?: NumericValue;
};

type TimingItem = {
  label?: string;
  value?: NumericValue;
};

type DashboardData = {
  totalCalls?: NumericValue;
  outcomeBarData?: OutcomeItem[];
  dailyBookings?: {
    byDateBooked?: BookingItem[];
    byVisitDate?: BookingItem[];
  };
  totalBookingsCaptured?: NumericValue;
  totalCovers?: NumericValue;
  confirmedPercentage?: NumericValue;
  avgTime?: NumericValue;
  kpiTrends?: {
    totalBookingsCaptured?: TrendValue;
    avgTime?: TrendValue;
  };
  afterHoursStats?: AfterHoursStats;
  reservationSeparation?: ReservationSeparation;
  volumeTrend?: VolumePoint[];
  upsellStats?: UpsellStats;
  conversionFunnel?: ConversionItem[];
  last7DaysCallCount?: Record<string, Record<string, NumericValue>>;
  timingDistribution?: TimingItem[];
};

type FeedbackBreakdownItem = {
  label?: string;
  count?: number;
};

type RebookingStats = {
  offered?: number;
  accepted?: number;
  declined?: number;
  conversionRate?: number;
};

type OutcomeBar = {
  totalAttempted?: number;
  meaningful?: number;
  nonMeaningful?: number;
  voicemail?: number;
};

type FeedbackData = {
  totalFeedback?: number;
  avgRating?: number;
  sentimentScore?: number;
  sentimentTrend?: string;

  couponsProvided?: number;
  positivePercentage?: number;
  negativePercentage?: number;

  feedbackFormSent?: number;
  formSubmissionPct?: number;

  feedbackTypeBreakdown?: FeedbackBreakdownItem[];

  topPositiveThemes?: string[];
  topNegativeThemes?: string[];

  rebookingStats?: RebookingStats;

  outcomeBar?: OutcomeBar;

  volumeTrend?: {
    label?: string;
    value?: number;
  }[];

  kpiTrends?: any;
};

type AnalyticsTopic = {
  label?: string;
  count?: NumericValue;
};

type AnalyticsQuery = AnalyticsTopic & {
  sampleVerbatim?: string;
};

type SpecialRequest = AnalyticsTopic & {
  category?: string;
  sampleDetail?: string;
};

type AnalyticsData = {
  trendingTopics?: AnalyticsTopic[];
  topQueries?: AnalyticsQuery[];
  topSpecialRequests?: SpecialRequest[];
};

type ReservationMetric = {
  label: string;
  value: number;
  covers: number;
  color: string;
};

type DashboardMetrics = {
  outcomeItems: OutcomeItem[];
  totalCalls: number;
  orderedBookings: BookingItem[];
  bookingBreakdownTotal: number;
  maxBookingValue: number;
  peakBookingIndex: number;
  afterHoursCalls: number;
  afterHoursBookings: number;
  afterHoursCovers: number;
  afterHoursConversion: number;
  reservationTotal: number;
  reservationItems: ReservationMetric[];
  timingMax: number;
  timingPeak?: TimingItem;
};

type DashboardMetricsProps = { data: DashboardMetrics };
type DashboardDataProps = { data: DashboardData };
type AnalyticsDataProps = { analyticsData: AnalyticsData | null };
type DashboardDataWithMetricsProps = { data: DashboardData; metrics: DashboardMetrics };
type MetricsOnlyProps = { metrics: DashboardMetrics };

type ProgressRowProps = {
  label: string;
  value: number;
  detail: string;
  color: string;
  className?: string;
};

type ProgressBarProps = {
  value: number;
  color: string;
  className?: string;
};

type SectionProps = {
  children: React.ReactNode;
  className?: string;
};

type KPIProps = {
  title: string;
  value: React.ReactNode;
  growth?: NumericValue;
  indicator?: boolean;
  growthLabel?: string;
};

// ─── Utilities ───────────────────────────────────────────────────────────────

function toNumber(value: unknown) {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return (value / total) * 100;
}

function formatPct(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function formatTime(seconds: NumericValue) {
  const safeSeconds = Math.max(0, Math.round(toNumber(seconds)));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function parseLocalDate(value?: string) {
  const [year, month, day] = String(value || "")
    .slice(0, 10)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
}

function daySortValue(value?: string) {
  const raw = parseLocalDate(value).getDay(); // 0=Sun
  return raw === 0 ? 7 : raw; // Mon=1 … Sun=7
}

function dayLabel(value?: string, weekday: "short" | "long" = "short") {
  if (!value) return "";
  return parseLocalDate(value).toLocaleDateString("en-US", { weekday });
}

function dateLabel(value?: string) {
  if (!value) return "";
  return parseLocalDate(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function logRequestError(err: unknown) {
  if (axios.isAxiosError(err)) {
    console.log(err.response?.data || err.message);
    return;
  }
  if (err instanceof Error) {
    console.log(err.message);
    return;
  }
  console.log(err);
}

// ─── Date Range Dropdown ─────────────────────────────────────────────────────

function DateRangeDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("last7");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = DATE_RANGE_OPTIONS.find((o) => o.value === selected);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="h-9 border border-[#2e2e2e] rounded-[8px] px-4 flex items-center gap-2 text-[11px] font-semibold text-zinc-200 hover:bg-[#1a1a1a] transition-colors bg-[#141414]"
      >
        {current?.label}
        <ChevronDown
          size={13}
          className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-[180px] bg-[#141414] border border-[#2e2e2e] rounded-[10px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] py-1 overflow-hidden">
          {DATE_RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setSelected(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-medium hover:bg-[#1f1f1f] transition-colors text-left"
            >
              <span className={selected === opt.value ? "text-white font-semibold" : "text-zinc-400"}>
                {opt.label}
              </span>
              {selected === opt.value && <Check size={12} className="text-emerald-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reservation" | "feedback">("reservation");

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token")?.replace("Bearer ", "") || "";
      const csrf = localStorage.getItem("csrf_token") || "";
      const response = await axios.post<DashboardData>(
        "/api/dashboard/reservation",
        {},
        { headers: { Authorization: `Bearer ${token}`, "X-CSRF-TOKEN": csrf } }
      );
      setData(response.data);
    } catch (err) {
      logRequestError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsInsights = async () => {
    setAnalyticsLoading(true);
    try {
      const token = localStorage.getItem("access_token")?.replace("Bearer ", "") || "";
      const csrf = localStorage.getItem("csrf_token") || "";
      const response = await axios.post<AnalyticsData>(
        "/api/dashboard/analytics-insights",
        {},
        { headers: { Authorization: `Bearer ${token}`, "X-CSRF-TOKEN": csrf } }
      );
      setAnalyticsData(response.data);
    } catch (err) {
      logRequestError(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchFeedback = async () => {
    setFeedbackLoading(true);
    try {
      const token = localStorage.getItem("access_token")?.replace("Bearer ", "") || "";
      const csrf = localStorage.getItem("csrf_token") || "";
      const response = await axios.post<FeedbackData>(
        "/api/dashboard/feedback",
        {},
        { headers: { Authorization: `Bearer ${token}`, "X-CSRF-TOKEN": csrf } }
      );
      setFeedbackData(response.data);
    } catch (err) {
      logRequestError(err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === "reservation") {
        fetchDashboard();
        fetchAnalyticsInsights();
      } else if (activeTab === "feedback") {
        fetchFeedback();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  const dashboardData = useMemo<DashboardMetrics | null>(() => {
    if (!data) return null;

    const outcomeItems = data.outcomeBarData || [];
    const totalCalls = toNumber(data.totalCalls);

    // Sort Mon→Sun (Mon=1 … Sun=7)
    const orderedBookings = [...(data.dailyBookings?.byDateBooked || [])].sort(
      (a, b) => daySortValue(a.date) - daySortValue(b.date)
    );

    const bookingBreakdownTotal = orderedBookings.reduce(
      (sum, item) => sum + toNumber(item.count),
      0
    );
    const maxBookingValue = Math.max(1, ...orderedBookings.map((item) => toNumber(item.count)));
    const peakBookingIndex = orderedBookings.findIndex(
      (item) => toNumber(item.count) === maxBookingValue
    );

    const afterHoursStats = data.afterHoursStats || {};
    const afterHoursCalls = toNumber(afterHoursStats.callsAfterHours);
    const afterHoursBookings = toNumber(
      afterHoursStats.bookingsDoneAfterHours ??
      afterHoursStats.bookings ??
      afterHoursStats.securedBookings?.count ??
      Math.max(0, Math.round(afterHoursCalls / 2))
    );
    const afterHoursCovers = toNumber(
      afterHoursStats.coversGeneratedAfterHours ??
      afterHoursStats.covers ??
      afterHoursStats.securedBookings?.covers ??
      afterHoursCalls
    );
    const afterHoursConversion =
      afterHoursStats.conversionRate ?? pct(afterHoursBookings, afterHoursCalls);

    const reservationTotal = toNumber(data.totalBookingsCaptured);
    const reservationItems: ReservationMetric[] = [
      {
        label: "Secured Bookings",
        value: toNumber(data.reservationSeparation?.securedBookings?.count),
        covers: toNumber(data.reservationSeparation?.securedBookings?.covers),
        color: COLORS[0],
      },
      {
        label: "Large Party Bookings",
        value: toNumber(data.reservationSeparation?.largeGroup?.count),
        covers: toNumber(data.reservationSeparation?.largeGroup?.covers),
        color: COLORS[1],
      },
      {
        label: "Promotional / Offer",
        value: toNumber(data.reservationSeparation?.promotions?.count),
        covers: toNumber(data.reservationSeparation?.promotions?.covers),
        color: COLORS[3],
      },
    ];

    const timingMax = Math.max(
      1,
      ...(data.timingDistribution || []).map((item) => toNumber(item.value))
    );
    const timingPeak = (data.timingDistribution || []).find(
      (item) => toNumber(item.value) === timingMax
    );

    return {
      outcomeItems,
      totalCalls,
      orderedBookings,
      bookingBreakdownTotal,
      maxBookingValue,
      peakBookingIndex,
      afterHoursCalls,
      afterHoursBookings,
      afterHoursCovers,
      afterHoursConversion: toNumber(afterHoursConversion),
      reservationTotal,
      reservationItems,
      timingMax,
      timingPeak,
    };
  }, [data]);

  const isCurrentTabLoading = activeTab === "reservation"
    ? (loading || analyticsLoading || !data || !dashboardData)
    : (feedbackLoading || !feedbackData);

  if (isCurrentTabLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-[13px] font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <main className="overflow-y-auto bg-[#0a0a0a]">
        {/* Header */}
        <header className="h-[60px] border-b border-[#1e1e1e] flex items-center justify-between px-[24px] sticky top-0 bg-[#0a0a0a] z-50">
          <div className="flex items-center gap-4">
            <h1 className="text-[15px] font-bold tracking-tight">Dashboard</h1>

            {/* Tab switcher */}
            <div className="flex items-center bg-[#0f0f0f] border border-[#222] rounded-full p-[3px]">
              <button
                onClick={() => setActiveTab("reservation")}
                className={`h-[28px] rounded-full px-5 text-[10px] transition-all duration-200 ${activeTab === "reservation"
                    ? "bg-white text-black font-bold shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                    : "text-zinc-500 hover:text-white font-medium"
                  }`}
              >
                Reservation
              </button>
              <button
                onClick={() => setActiveTab("feedback")}
                className={`h-[28px] rounded-full px-5 text-[10px] transition-all duration-200 ${activeTab === "feedback"
                    ? "bg-white text-black font-bold shadow-[0_2px_8px_rgba(255,255,255,0.15)]"
                    : "text-zinc-500 hover:text-white font-medium"
                  }`}
              >
                Feedback
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <DateRangeDropdown />

            <button className="h-9 border border-[#2e2e2e] rounded-[8px] px-4 flex items-center gap-2 text-[11px] font-semibold text-zinc-300 hover:bg-[#1a1a1a] transition-colors bg-[#141414]">
              <Download size={13} />
              Export
            </button>

            <div className="relative h-9 w-9 flex items-center justify-center">
              <Bell size={16} className="text-zinc-300" />
              <div className="absolute top-[9px] right-[9px] w-2 h-2 bg-emerald-400 border border-[#0a0a0a] rounded-full" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="w-full px-[24px] pt-[22px] pb-8 space-y-[18px]">
          {activeTab === "reservation" ? (
            <>
              <CallOutcomes data={dashboardData!} />

              <div className="grid grid-cols-4 gap-[14px]">
                <KPI
                  title="Total Bookings Captured"
                  value={data!.totalBookingsCaptured}
                  growth={data!.kpiTrends?.totalBookingsCaptured?.changePct}
                  growthLabel={`${data!.kpiTrends?.totalBookingsCaptured?.changePct}%`}
                />
                <KPI title="Total Covers" value={data!.totalCovers} />
                <KPI title="Reservations %" value={`${data!.confirmedPercentage}%`} />
                <KPI
                  title="Avg Time"
                  value={formatTime(data!.avgTime)}
                  growth={data!.kpiTrends?.avgTime?.changePct}
                  growthLabel={`${data!.kpiTrends?.avgTime?.changePct}%`}
                  indicator
                />
              </div>

              <div className="grid grid-cols-2 gap-[18px] items-start">
                <AfterHours data={dashboardData!} />
                <ReservationBreakdown data={data!} metrics={dashboardData!} />
              </div>

              <BookingsBreakdown
                metrics={dashboardData!}
                data={data!}
              />

              <div className="grid grid-cols-3 gap-[18px]">
                <CallsPerDay data={data!} />
                <UpsellPerformance data={data!} />
              </div>

              <div className="grid grid-cols-2 gap-[18px]">
                <ConversionFunnel data={data!} />
                <TrendingTopics analyticsData={analyticsData} />
              </div>

              <div className="grid grid-cols-2 gap-[18px]">
                <TopQueries analyticsData={analyticsData} />
                <TopSpecialRequests analyticsData={analyticsData} />
              </div>

              <ReservationTiming data={data!} metrics={dashboardData!} />
            </>
          ) : (
            <>
              <div className="grid grid-cols-5 gap-[14px]">
                <KPI
                  title="Positive %"
                  value={`${feedbackData?.positivePercentage || 0}%`}
                />

                <KPI
                  title="Negative %"
                  value={`${feedbackData?.negativePercentage || 0}%`}
                />

                <KPI
                  title="Coupons Provided"
                  value={feedbackData?.couponsProvided || 0}
                />

                <KPI
                  title="Feedback Form Candidates"
                  value={feedbackData?.feedbackFormSent || 0}
                />

                <KPI
                  title="Form Submission %"
                  value={`${feedbackData?.formSubmissionPct || 0}%`}
                />
              </div>

              <div className="grid grid-cols-2 gap-[18px]">
                <FeedbackTypes data={feedbackData!} />
                <RebookingLoyalty data={feedbackData!} />
              </div>

              <FeedbackThemes data={feedbackData!} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Call Outcomes ────────────────────────────────────────────────────────────

function CallOutcomes({ data }: DashboardMetricsProps) {
  return (
    <Section className="px-[24px] py-[22px]">
      <p className="text-zinc-500 text-[11px] mb-1.5 font-medium">Call Outcomes</p>

      <h2 className="text-[30px] leading-none font-black mb-5 tracking-tight">
        {data.totalCalls}
        <span className="text-[15px] ml-2 text-zinc-500 font-semibold">total calls</span>
      </h2>

      {/* Stacked bar */}
      <div className="h-[8px] rounded-full overflow-hidden flex mb-5 bg-[#1e1e1e] gap-[2px]">
        {data.outcomeItems.map((item, idx) => (
          <div
            key={item.name || idx}
            style={{
              width: `${pct(toNumber(item.count), data.totalCalls)}%`,
              background: COLORS[idx % COLORS.length],
            }}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2.5">
        {data.outcomeItems.map((item, idx) => (
          <div key={item.name || idx} className="flex items-center gap-2 text-[10px] leading-none">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: COLORS[idx % COLORS.length] }}
            />
            <span className="text-zinc-400">{item.name}</span>
            <span className="font-bold text-white">{item.count}</span>
            <span className="text-zinc-600">
              ({formatPct(pct(toNumber(item.count), data.totalCalls))})
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPI({ title, value, growth, indicator = false, growthLabel }: KPIProps) {
  return (
    <div className="relative bg-[#111111] border border-[#222] rounded-[10px] p-[20px] min-h-[160px] flex flex-col justify-between">
      {indicator && (
        <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-emerald-400" />
      )}

      <div>
        <p className="text-zinc-500 text-[10px] font-medium mb-4 leading-snug">{title}</p>
        <h2 className="text-[28px] leading-none font-black tracking-tight">{value}</h2>
      </div>

      {growth !== undefined && (
        <div className="mt-3 bg-emerald-950/60 text-emerald-400 text-[9px] font-black px-2.5 py-1 rounded-full w-fit border border-emerald-900/40">
          ↗ {growthLabel}
        </div>
      )}
    </div>
  );
}

// ─── After Hours ──────────────────────────────────────────────────────────────

function AfterHours({ data }: DashboardMetricsProps) {
  return (
    <Section className="p-[22px]">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="font-black text-[11px] leading-none tracking-wider text-zinc-100">
            NON-WORKING HOURS BREAKDOWN
          </h3>
          <p className="text-zinc-500 text-[10px] mt-1.5">
            Activity recorded outside your typical opening times
          </p>
        </div>
        <div className="bg-violet-900/50 text-violet-300 border border-violet-800/40 px-3 py-1 rounded-full text-[8px] font-black h-fit tracking-wider">
          AFTER HOURS
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-end gap-2 mb-5">
        <div className="text-[36px] leading-none font-black">{data.afterHoursCalls}</div>
        <div className="pb-0.5 text-[11px] text-zinc-500">calls</div>
        <div className="pb-0.5 text-[14px] text-zinc-600 font-light mx-1">·</div>
        <div className="text-[22px] leading-none text-[#27d6a2] font-black">{data.afterHoursBookings}</div>
        <div className="pb-0.5 text-[11px] text-zinc-500">bookings</div>
        <div className="pb-0.5 text-[14px] text-zinc-600 font-light mx-1">·</div>
        <div className="text-[22px] leading-none text-[#24b8ea] font-black">{data.afterHoursCovers}</div>
        <div className="pb-0.5 text-[11px] text-zinc-500">covers</div>
      </div>

      <ProgressBar value={100} color={COLORS[0]} className="mb-6" />

      <ProgressRow
        label="Secured Bookings"
        value={100}
        detail={`100%  ${data.afterHoursBookings} | ${data.afterHoursCovers}`}
        color={COLORS[0]}
      />

      <ProgressRow
        label="After-Hours Conversion Rate"
        value={data.afterHoursConversion}
        detail={formatPct(data.afterHoursConversion)}
        color={COLORS[5]}
        className="mt-7"
      />
    </Section>
  );
}

// ─── Reservation Breakdown ────────────────────────────────────────────────────

function ReservationBreakdown({ data, metrics }: DashboardDataWithMetricsProps) {
  return (
    <Section className="p-[22px]">
      <h3 className="font-black text-[11px] leading-none tracking-wider text-zinc-100">
        RESERVATION BREAKDOWN
      </h3>
      <p className="text-zinc-500 text-[10px] mt-1.5 mb-5">
        Distribution of reservation types with covers
      </p>

      <div className="flex gap-2.5 items-end mb-5">
        <div className="text-[36px] leading-none font-black">{data.totalBookingsCaptured}</div>
        <div className="pb-0.5 text-[11px] text-zinc-500">bookings</div>
        <div className="pb-0.5 text-[14px] text-zinc-600 mx-1">·</div>
        <div className="text-[30px] leading-none font-black text-cyan-400">{data.totalCovers}</div>
        <div className="pb-0.5 text-[11px] text-zinc-500">covers</div>
      </div>

      <div className="h-[7px] rounded-full overflow-hidden flex mb-6 bg-[#1e1e1e] gap-[2px]">
        {metrics.reservationItems.map((item) => (
          <div
            key={item.label}
            style={{
              width: `${pct(item.value, metrics.reservationTotal)}%`,
              background: item.color,
            }}
          />
        ))}
      </div>

      <div className="space-y-5">
        {metrics.reservationItems.map((item) => (
          <ProgressRow
            key={item.label}
            label={item.label}
            value={pct(item.value, metrics.reservationTotal)}
            detail={`${formatPct(pct(item.value, metrics.reservationTotal))}  ${item.value} | ${item.covers}`}
            color={item.color}
          />
        ))}
      </div>
    </Section>
  );
}

// ─── Bookings Breakdown ───────────────────────────────────────────────────────

function BookingsBreakdown({
  metrics,
  data,
}: {
  metrics: DashboardMetrics;
  data: DashboardData;
}) {
  const [activeTab, setActiveTab] = useState<"dateBooked" | "visitDate">(
    "dateBooked"
  );
  const gradients = [
    { from: "#16a34a", to: "#4ade80" },
    { from: "#0369a1", to: "#38bdf8" },
    { from: "#6d28d9", to: "#a78bfa" },
    { from: "#b45309", to: "#fbbf24" },
    { from: "#be123c", to: "#fb7185" },
    { from: "#7e22ce", to: "#d946ef" },
    { from: "#0e7490", to: "#22d3ee" },
  ];

  const bookedBookings = [...(data.dailyBookings?.byDateBooked || [])].sort(
    (a, b) => daySortValue(a.date) - daySortValue(b.date)
  );

  const bookedTotal = bookedBookings.reduce(
    (sum, item) => sum + toNumber(item.count),
    0
  );

  const bookedMax = Math.max(
    1,
    ...bookedBookings.map((item) => toNumber(item.count))
  );

  const bookedPeakIndex = bookedBookings.findIndex(
    (item) => toNumber(item.count) === bookedMax
  );

  const visitBookings = [...(data.dailyBookings?.byVisitDate || [])].sort(
    (a, b) => daySortValue(a.date) - daySortValue(b.date)
  );

  const visitTotal = visitBookings.reduce(
    (sum, item) => sum + toNumber(item.count),
    0
  );

  const visitMax = Math.max(
    1,
    ...visitBookings.map((item) => toNumber(item.count))
  );

  const visitPeakIndex = visitBookings.findIndex(
    (item) => toNumber(item.count) === visitMax
  );

  return (
    <Section className="p-[24px]">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-[12px] leading-none font-black tracking-wider text-zinc-100">
            BOOKINGS BREAKDOWN
          </h2>
          <p className="text-zinc-500 text-[10px] mt-1.5">
            {activeTab === "dateBooked" ? "When bookings were created" : "When guests are visiting"}
          </p>
        </div>

        <div className="flex bg-[#0f0f0f] border border-[#222] rounded-full p-[3px]">
          <button
            onClick={() => setActiveTab("dateBooked")}
            className={`px-4 py-1.5 text-[9px] rounded-full transition-all duration-200 ${activeTab === "dateBooked"
              ? "bg-emerald-400 text-black font-black shadow-[0_0_14px_rgba(39,214,162,0.45)]"
              : "text-zinc-500 hover:text-white font-semibold"
              }`}
          >
            Date Booked
          </button>

          <button
            onClick={() => setActiveTab("visitDate")}
            className={`px-4 py-1.5 text-[9px] rounded-full transition-all duration-200 ${activeTab === "visitDate"
              ? "bg-[#a855f7] text-white font-black shadow-[0_0_14px_rgba(168,85,247,0.45)]"
              : "text-zinc-500 hover:text-white font-semibold"
              }`}
          >
            Visit Date
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2.5 mb-5">
        <h1 className="text-[36px] leading-none font-black">
          {activeTab === "dateBooked" ? bookedTotal : visitTotal}
        </h1>
        <span className="text-zinc-500 text-[11px] mb-0.5">total bookings</span>
      </div>

      {activeTab === "dateBooked" ? (
        <>
          {/* Stacked bar */}
          <div className="flex h-[7px] rounded-full overflow-hidden mb-5 bg-[#1e1e1e] gap-[2px]">
            {bookedBookings.map((item, idx) => (
              <div
                key={item.date || idx}
                style={{
                  width: `${pct(toNumber(item.count), bookedTotal)}%`,
                  background: COLORS[idx % COLORS.length],
                }}
              />
            ))}
          </div>

          <p className="text-zinc-500 text-[10px] mb-7">
            Max Value:
            <span className="font-bold text-white ml-1">
              {bookedMax} bookings
            </span>
            <span className="ml-1">on</span>
            <span className="font-bold text-white ml-1">
              {dayLabel(bookedBookings[bookedPeakIndex]?.date)}
            </span>
          </p>

          <div className="flex items-end justify-between h-[420px] px-2">
            {bookedBookings.map((item, idx) => {
              const value = toNumber(item.count);

              const heightPx = Math.max(
                (value / bookedMax) * 280,
                36
              );

              const isPeak = idx === bookedPeakIndex;

              const g = gradients[idx % gradients.length];

              return (
                <div
                  key={item.date || idx}
                  className="flex h-full flex-col items-center justify-end"
                  style={{
                    width: `${100 / bookedBookings.length}%`,
                    maxWidth: "120px",
                  }}
                >
                  <div
                    className="w-[80%] rounded-t-[8px] relative transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
                    style={{
                      height: `${heightPx}px`,
                      background: `linear-gradient(to bottom, ${g.from}, ${g.to})`,
                    }}
                  >
                    {isPeak && (
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/80 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <p
                      className="font-black text-[9px] tracking-widest uppercase"
                      style={{
                        color: COLORS[idx % COLORS.length],
                      }}
                    >
                      {dayLabel(item.date, "short").toUpperCase()}
                    </p>

                    <p className="text-zinc-600 text-[9px] mt-0.5">
                      {dateLabel(item.date)}
                    </p>

                    {isPeak && (
                      <div className="mt-2 inline-flex bg-sky-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.6)]">
                        PEAK
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Stacked bar */}
          <div className="flex h-[7px] rounded-full overflow-hidden mb-5 bg-[#1e1e1e] gap-[2px]">
            {visitBookings.map((item, idx) => (
              <div
                key={item.date || idx}
                style={{
                  width: `${pct(toNumber(item.count), visitTotal)}%`,
                  background: COLORS[idx % COLORS.length],
                }}
              />
            ))}
          </div>

          <p className="text-zinc-500 text-[10px] mb-7">
            Max Value:
            <span className="font-bold text-white ml-1">
              {visitMax} bookings
            </span>
            <span className="ml-1">on</span>
            <span className="font-bold text-white ml-1">
              {dayLabel(visitBookings[visitPeakIndex]?.date)}
            </span>
          </p>

          <div className="flex items-end justify-between h-[420px] px-2">
            {visitBookings.map((item, idx) => {
              const value = toNumber(item.count);

              const heightPx = Math.max(
                (value / visitMax) * 280,
                36
              );

              const isPeak = idx === visitPeakIndex;

              const g = gradients[idx % gradients.length];

              return (
                <div
                  key={item.date || idx}
                  className="flex h-full flex-col items-center justify-end"
                  style={{
                    width: `${100 / visitBookings.length}%`,
                    maxWidth: "120px",
                  }}
                >
                  <div
                    className="w-[80%] rounded-t-[8px] relative transition-transform duration-200 hover:-translate-y-1 cursor-pointer"
                    style={{
                      height: `${heightPx}px`,
                      background: `linear-gradient(to bottom, ${g.from}, ${g.to})`,
                    }}
                  >
                    {isPeak && (
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white/80 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
                    )}
                  </div>

                  <div className="mt-5 text-center">
                    <p
                      className="font-black text-[9px] tracking-widest uppercase"
                      style={{
                        color: COLORS[idx % COLORS.length],
                      }}
                    >
                      {dayLabel(item.date, "short").toUpperCase()}
                    </p>

                    <p className="text-zinc-600 text-[9px] mt-0.5">
                      {dateLabel(item.date)}
                    </p>

                    {isPeak && (
                      <div className="mt-2 inline-flex bg-[#a855f7] text-white text-[8px] font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                        PEAK
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Section>
  );
}

// ─── Calls Per Day ────────────────────────────────────────────────────────────

function CallsPerDay({ data }: DashboardDataProps) {
  return (
    <Section className="col-span-2 p-[24px]">
      <h3 className="font-black text-[12px] leading-none tracking-wider mb-1.5 text-zinc-100">
        CALLS PER DAY
      </h3>
      <p className="text-zinc-500 text-[10px] mb-5">
        Calls trend for Last 7 Days (Current Period)
      </p>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.volumeTrend || []}
            margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
          >
            <defs>
              <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#27d6a2" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#27d6a2" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#1a1a1a" />
            <XAxis
              dataKey="label"
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 9 }}
            />
            <YAxis
              width={32}
              ticks={[0, 6, 12, 18, 24]}
              domain={[0, 24]}
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 9 }}
            />
            <Tooltip
              contentStyle={tooltipContentStyle}
              labelStyle={tooltipLabelStyle}
              cursor={{ stroke: "#2a2a2a" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#27d6a2"
              strokeWidth={2}
              fill="url(#callsGradient)"
              dot={false}
              activeDot={{ r: 3, fill: "#27d6a2", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

// ─── Upsell Performance ───────────────────────────────────────────────────────

function UpsellPerformance({ data }: DashboardDataProps) {
  const revenue = toNumber(data.upsellStats?.totalRevenue);

  return (
    <Section className="p-[24px] flex flex-col">
      <h3 className="font-black text-[12px] leading-none tracking-wider mb-1.5 text-zinc-100">
        UPSELL PERFORMANCE
      </h3>
      <p className="text-zinc-500 text-[10px] mb-6">Extra revenue generated from calls</p>

      <div className="flex flex-1 justify-center items-center py-6">
        <h1 className="text-[38px] font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          {formatCurrency(revenue)}
        </h1>
      </div>

      <div className="h-[52px] rounded-[8px] border border-emerald-800/40 bg-emerald-950/40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Total Successful Upsells
        </div>
        <span className="text-[14px] font-black text-emerald-400">
          {data.upsellStats?.successfulUpsells ?? 0}
        </span>
      </div>
    </Section>
  );
}

// ─── Conversion Funnel ────────────────────────────────────────────────────────

const FunnelTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-[8px] px-3.5 py-2.5 shadow-xl min-w-[120px]">
        <p className="text-[11px] font-black text-white mb-1.5 leading-none">
          {item.stage}
        </p>
        <div className="flex items-center justify-between text-[10px] gap-6">
          <span className="text-zinc-500 font-semibold">Calls</span>
          <span className="text-white font-black">{item.count}</span>
        </div>
      </div>
    );
  }
  return null;
};

function ConversionFunnel({ data }: DashboardDataProps) {
  const funnelItems = data.conversionFunnel || [];

  const chartData = funnelItems.map((item) => ({
    ...item,
    count: toNumber(item.count),
    pct: toNumber(item.pct),
    chartValue: toNumber(item.pct),
  }));

  const maxCount = Math.max(100, ...chartData.map((d) => d.count));
  const ticks = [
    0,
    Math.round(maxCount * 0.25),
    Math.round(maxCount * 0.5),
    Math.round(maxCount * 0.75),
    maxCount,
  ];

  return (
    <Section className="p-[24px]">
      <h2 className="text-[12px] leading-none font-black tracking-wider mb-1.5 text-zinc-100">
        CONVERSION FUNNEL
      </h2>
      <p className="text-zinc-500 text-[10px] mb-5">
        Guest journey from initial call to confirmed booking
      </p>

      <div className="h-[220px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, left: -28, bottom: 4 }}
          >
            <CartesianGrid vertical={false} stroke="#1a1a1a" />
            <XAxis
              dataKey="stage"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 9 }}
            />
            <YAxis
              domain={[0, maxCount]}
              ticks={ticks}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#525252", fontSize: 9 }}
            />
            <Tooltip
              content={<FunnelTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.02)" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={100}>
              {chartData.map((item, idx) => (
                <Cell key={item.stage || idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2.5">
        {chartData.map((item, idx) => (
          <div
            key={item.stage || idx}
            className="h-[50px] flex items-center justify-between border border-[#1e1e1e] rounded-[8px] px-4 hover:border-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: COLORS[idx % COLORS.length] }}
              />
              <span className="text-[11px] font-semibold text-zinc-200">{item.stage}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-[12px]">{item.count}</span>
              <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 text-[9px] font-black px-2 py-0.5 rounded-full">
                {item.pct}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Trending Topics ──────────────────────────────────────────────────────────

function TrendingTopics({ analyticsData }: AnalyticsDataProps) {
  return (
    <Section className="p-[24px]">
      <h2 className="text-[12px] leading-none font-black tracking-wider mb-1.5 text-zinc-100">
        TRENDING TOPICS
      </h2>
      <p className="text-zinc-500 text-[10px] mb-5">
        Top reservation themes and their WoW change
      </p>

      <div className={`space-y-2.5 max-h-[480px] ${SCROLL_PANEL}`}>
        {analyticsData?.trendingTopics?.map((topic, idx) => (
          <div
            key={topic.label || idx}
            className="min-h-[64px] border rounded-[8px] p-4 hover:bg-white/[0.015] transition-colors"
            style={{ borderColor: `${COLORS[idx % COLORS.length]}55` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  background: `${COLORS[idx % COLORS.length]}18`,
                  color: COLORS[idx % COLORS.length],
                }}
              >
                {idx + 1}
              </div>
              <div>
                <h3 className="font-bold text-[11px] leading-tight text-zinc-100">{topic.label}</h3>
                <p className="text-zinc-600 text-[9px] mt-0.5 uppercase tracking-wider font-medium">
                  {topic.count} mentions
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Top Queries ──────────────────────────────────────────────────────────────

function TopQueries({ analyticsData }: AnalyticsDataProps) {
  return (
    <Section className="p-[24px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-[12px] leading-none font-black tracking-wider text-zinc-100">
            TOP QUERIES
          </h2>
          <p className="text-zinc-500 text-[10px] mt-1.5">
            Most frequently asked questions for last 7 days
          </p>
        </div>
        <FileBarChart2 size={15} className="text-zinc-600" />
      </div>

      <div className={`space-y-2.5 max-h-[480px] ${SCROLL_PANEL}`}>
        {analyticsData?.topQueries?.map((item, idx) => (
          <div
            key={item.label || idx}
            className="border border-[#1e1e1e] rounded-[8px] p-4 hover:border-emerald-900/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full border border-emerald-800/40 bg-emerald-950/40 flex items-center justify-center text-emerald-400 text-[10px] font-black shrink-0">
                {idx + 1}
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-[11px] leading-tight text-zinc-100">{item.label}</h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Asked {item.count} times</p>
                {item.sampleVerbatim && (
                  <p className="text-zinc-600 italic text-[10px] mt-2 leading-relaxed">
                    &ldquo;{item.sampleVerbatim}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Top Special Requests ─────────────────────────────────────────────────────

function TopSpecialRequests({ analyticsData }: AnalyticsDataProps) {
  const getCategoryColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("dietary") || cat.includes("allergen")) return "#f6c21a";
    if (cat.includes("occasion") || cat.includes("special")) return "#a855f7";
    if (cat.includes("seat")) return "#24b8ea";
    return "#71717a";
  };

  const processedRequests = useMemo(() => {
    let currentCat = "";
    let rank = 0;
    return (
      analyticsData?.topSpecialRequests?.map((item) => {
        if (item.category) {
          currentCat = item.category;
          rank = 1;
        } else {
          rank++;
        }
        return {
          ...item,
          resolvedCategory: currentCat,
          rank,
          showHeader: !!item.category,
        };
      }) || []
    );
  }, [analyticsData?.topSpecialRequests]);

  return (
    <Section className="p-[24px]">
      <div className="flex justify-between items-start mb-5">
        <div>
          <h2 className="text-[12px] leading-none font-black tracking-wider text-zinc-100">
            TOP SPECIAL REQUESTS
          </h2>
          <p className="text-zinc-500 text-[10px] mt-1.5">Common requests for last 7 days</p>
        </div>
        <Sparkles size={15} className="text-zinc-600" />
      </div>

      <div className={`space-y-4 max-h-[480px] ${SCROLL_PANEL}`}>
        {processedRequests.map((item, idx) => (
          <div key={item.label || idx}>
            {item.showHeader && (
              <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
                <span
                  className="text-[10px] leading-none"
                  style={{ color: getCategoryColor(item.resolvedCategory) }}
                >
                  ●
                </span>
                <span className="uppercase tracking-[2px] text-[8px] text-zinc-500 font-black">
                  {item.resolvedCategory}
                </span>
              </div>
            )}

            <div className="border border-[#1e1e1e] border-l-[3px] border-l-[#24b8ea] rounded-[8px] p-4 bg-[#111111]/20 hover:border-sky-900/50 transition-all duration-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full border border-sky-500/20 bg-sky-500/5 flex items-center justify-center text-sky-400 text-[11px] font-black shrink-0">
                  {item.rank}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-[11px] leading-tight text-zinc-100">{item.label}</h3>
                  <p className="text-zinc-400 text-[10px] mt-0.5">
                    Requested <span className="font-bold text-white">{item.count}</span> times
                  </p>
                  {item.sampleDetail && (
                    <p className="text-zinc-600 italic text-[10px] mt-2 leading-relaxed">
                      &ldquo;{item.sampleDetail}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── Reservation Timing ───────────────────────────────────────────────────────

function ReservationTiming({ data, metrics }: DashboardDataWithMetricsProps) {
  return (
    <Section className="p-[24px]">
      <h2 className="text-[12px] leading-none font-black tracking-wider text-zinc-100">
        RESERVATION TIMING DISTRIBUTION
      </h2>
      <p className="text-zinc-500 text-[10px] mt-1.5 mb-6">Booking patterns by hour of day</p>

      {/* Calls for last 7 days grid */}
      <div className="border border-[#1e1e1e] rounded-[10px] p-5 bg-[#0d0d0d] mb-8">
        <h3 className="text-[12px] font-bold mb-5 text-zinc-200">Calls for Last 7 Days</h3>

        <div className="grid grid-cols-7 gap-3">
          {DAY_ORDER.map((day, idx) => {
            const slots: Record<string, NumericValue> =
              data.last7DaysCallCount?.[day] ||
              data.last7DaysCallCount?.[day.toLowerCase()] ||
              {};

            const total = Object.values(slots).reduce<number>(
              (sum, value) => sum + toNumber(value),
              0
            );

            return (
              <div
                key={day}
                className="border rounded-[8px] px-4 py-4 bg-[#111111]"
                style={{ borderColor: `${COLORS[idx]}70` }}
              >
                <p
                  className="text-[9px] font-black tracking-wider mb-2.5 uppercase"
                  style={{ color: COLORS[idx] }}
                >
                  {day}
                </p>
                <h2 className="text-[36px] leading-none font-black">{total}</h2>
                <p className="text-zinc-600 text-[9px] mt-2 uppercase tracking-wider">
                  {Object.keys(slots).length} hours active
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timing bar chart */}
      <div>
        <h3 className="text-[11px] font-black tracking-wider mb-1.5 text-zinc-100">
          RESERVATION TIME PER SLOT
        </h3>
        <p className="text-zinc-500 text-[10px] mb-6">
          Max Value:
          <span className="text-white font-bold ml-1">{metrics.timingMax} reservations</span>
          <span className="ml-1">at</span>
          <span className="text-white font-bold ml-1">{metrics.timingPeak?.label}</span>
        </p>

        <div className="flex items-end h-[240px] gap-[3px]">
          {(data.timingDistribution || []).map((item, idx) => {
            const heightPx = (toNumber(item.value) / metrics.timingMax) * 180;

            return (
              <div
                key={item.label || idx}
                className="flex-1 flex flex-col justify-end items-center h-full"
              >
                <div
                  className="w-full bg-cyan-400 rounded-t-[4px] transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer"
                  style={{ height: `${Math.max(heightPx, 6)}px` }}
                />
                <p className="text-[8px] text-zinc-600 mt-3 rotate-0 truncate w-full text-center">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

// ─── Feedback Dashboard Components ────────────────────────────────────────────

function FeedbackTypes({ data }: { data: FeedbackData }) {
  return (
    <Section className="p-[24px] min-h-[260px]">
      <h2 className="text-[12px] font-black tracking-wider text-zinc-100">
        FEEDBACK TYPES
      </h2>

      <p className="text-zinc-500 text-[10px] mt-1.5 mb-6">
        Feedback distribution
      </p>

      {!data.feedbackTypeBreakdown?.length ? (
        <div className="flex items-center justify-center h-[160px] text-zinc-500 text-[12px]">
          No feedback type data available
        </div>
      ) : (
        <div className="space-y-4">
          {data.feedbackTypeBreakdown.map((item, idx) => (
            <ProgressRow
              key={idx}
              label={item.label || ""}
              value={item.count || 0}
              detail={`${item.count || 0}`}
              color={COLORS[idx % COLORS.length]}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

function RebookingLoyalty({ data }: { data: FeedbackData }) {
  const stats = data.rebookingStats;

  return (
    <Section className="p-[24px] min-h-[260px]">
      <h2 className="text-[12px] font-black tracking-wider text-zinc-100">
        REBOOKING & LOYALTY
      </h2>

      <p className="text-zinc-500 text-[10px] mt-1.5 mb-6">
        Rebooking retention funnel
      </p>

      {!stats?.offered ? (
        <div className="flex flex-col items-center justify-center h-[160px]">
          <div className="text-zinc-600 text-[14px] font-semibold">
            No rebooking activity recorded
          </div>

          <div className="text-zinc-700 text-[10px] mt-2">
            Offers will appear once captured by AI
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <ProgressRow
            label="Offered"
            value={100}
            detail={`${stats.offered}`}
            color="#27d6a2"
          />

          <ProgressRow
            label="Accepted"
            value={stats.conversionRate || 0}
            detail={`${stats.accepted}`}
            color="#24b8ea"
          />

          <ProgressRow
            label="Declined"
            value={stats.declined || 0}
            detail={`${stats.declined}`}
            color="#ef5574"
          />
        </div>
      )}
    </Section>
  );
}

function FeedbackThemes({ data }: { data: FeedbackData }) {
  return (
    <Section className="p-[24px]">
      <h2 className="text-[12px] font-black tracking-wider text-zinc-100">
        FEEDBACK THEMES
      </h2>

      <p className="text-zinc-500 text-[10px] mt-1.5 mb-6">
        Positive & negative themes
      </p>

      {!data.topPositiveThemes?.length &&
        !data.topNegativeThemes?.length ? (
        <div className="text-zinc-500 text-[12px]">
          No theme data available
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-emerald-400 text-[11px] font-bold mb-4">
              Positive Themes
            </h3>

            <div className="space-y-2">
              {data.topPositiveThemes?.map((theme, idx) => (
                <div
                  key={idx}
                  className="bg-[#161616] border border-[#262626] rounded-[8px] px-4 py-3 text-[11px]"
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-red-400 text-[11px] font-bold mb-4">
              Negative Themes
            </h3>

            <div className="space-y-2">
              {data.topNegativeThemes?.map((theme, idx) => (
                <div
                  key={idx}
                  className="bg-[#161616] border border-[#262626] rounded-[8px] px-4 py-3 text-[11px]"
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function ProgressRow({ label, value, detail, color, className = "" }: ProgressRowProps) {
  return (
    <div className={className}>
      <div className="flex justify-between text-[10px] mb-1.5">
        <span className="text-zinc-300 font-medium">{label}</span>
        <span className="font-bold text-zinc-200">{detail}</span>
      </div>
      <ProgressBar value={value} color={color} />
    </div>
  );
}

function ProgressBar({ value, color, className = "" }: ProgressBarProps) {
  return (
    <div className={`h-[6px] rounded-full bg-[#1e1e1e] overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: color,
        }}
      />
    </div>
  );
}

function Section({ children, className = "" }: SectionProps) {
  return (
    <section
      className={`bg-[#111111] border border-[#1e1e1e] rounded-[10px] transition-colors hover:border-[#272727] ${className}`}
    >
      {children}
    </section>
  );
}