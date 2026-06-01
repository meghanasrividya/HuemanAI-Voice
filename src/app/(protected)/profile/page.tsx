"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Moon,
  Sun,
  Mail,
  Clock,
  PhoneCall,
  Settings,
  Calendar,
} from "lucide-react";
import { fetchUserProfile, fetchDashboardSummary } from "@/lib/api/user";
import { useAuthStore, getUserFullName } from "@/store/authStore";

interface UserProfile {
  first_name?: string;
  last_name?: string;
  email?: string;
  call_minutes_used?: number;
  plan_type?: string;
  total_calls_provided?: number;
  calls_left?: number;
}

interface DashboardSummary {
  totalCalls?: number;
}

const now = new Date();
const startDateObj = new Date(now);
startDateObj.setDate(now.getDate() - 29);

const fmt = (d: Date) => d.toISOString().split("T")[0];

const summaryPayload = {
  startDate: startDateObj.toISOString(),
  endDate: now.toISOString(),
  dateRange: `custom|${fmt(startDateObj)}|${fmt(now)}`,
};

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const userFullName = getUserFullName(user) || "User";
  const userEmail = user?.email ?? "";

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("theme") !== "light";
  });

  const { data: profile, isLoading, error, refetch } = useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });

  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary-profile"],
    queryFn: () => fetchDashboardSummary(summaryPayload),
  });

  const handleToggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          Loading Profile...
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !profile) {
    return (
      <div className="h-full bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-rose-400 font-semibold">
            {(error as Error)?.message ?? "Failed to load profile data."}
          </p>
          <button
            onClick={() => void refetch()}
            className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-200 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────
  const totalCallMinutes = 4500;
  const callMinutesUsed = profile.call_minutes_used ?? 515;
  const minutesLeft = totalCallMinutes - callMinutesUsed;
  const planSuffix = profile.plan_type === "per_month" ? " / Month" : "";

  const totalCallsProvided = profile.total_calls_provided ?? 2000;
  const callsLeft =
    typeof summary?.totalCalls === "number"
      ? totalCallsProvided - summary.totalCalls
      : (profile.calls_left ?? 1695);

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    userFullName;

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="w-full px-[32px] pt-[32px] pb-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight mb-1.5 text-white">Profile</h1>
          <p className="text-zinc-400 text-[13px] tracking-wide">
            Manage your account settings and view usage statistics.
          </p>
        </div>

        {/* Row 1 — three info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Personal Information */}
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[12px] p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <User size={16} className="text-zinc-400" />
              <h2 className="text-[15px] font-bold text-white">Personal Information</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Full Name</span>
                <p className="text-sm font-semibold text-white">{displayName}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Mail size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Email Address</span>
                </div>
                <p className="text-sm font-semibold text-white break-all">
                  {profile.email ?? userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[12px] p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-zinc-400" />
              <h2 className="text-[15px] font-bold text-white">Usage Statistics</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <PhoneCall size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Total Call Minutes</span>
                </div>
                <p className="text-[26px] font-bold text-white leading-none">
                  {totalCallMinutes.toLocaleString()} <span className="text-sm font-medium text-zinc-500">mins</span>
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Minutes Left (This Month)</span>
                </div>
                <p className="text-[26px] font-bold text-white leading-none">
                  {minutesLeft.toLocaleString()}
                  {planSuffix && <span className="text-sm font-medium text-zinc-500 ml-1">{planSuffix}</span>}
                </p>
              </div>
            </div>
          </div>

          {/* Calls Statistics */}
          <div className="bg-[#0f0f0f] border border-zinc-800 rounded-[12px] p-5 flex flex-col gap-5">
            <div className="flex items-center gap-2">
              <PhoneCall size={16} className="text-zinc-400" />
              <h2 className="text-[15px] font-bold text-white">Calls Statistics</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Total Calls Provided</span>
                </div>
                <p className="text-[26px] font-bold text-white leading-none">
                  {totalCallsProvided.toLocaleString()} <span className="text-sm font-medium text-zinc-500">Calls</span>
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-zinc-500 shrink-0" />
                  <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">Calls Left (This Month)</span>
                </div>
                <p className="text-[26px] font-bold text-white leading-none">
                  {typeof callsLeft === "number" ? callsLeft.toLocaleString() : callsLeft}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Row 2 — Appearance */}
        <div className="mt-5 bg-[#0f0f0f] border border-zinc-800 rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-5">
            <Settings size={16} className="text-zinc-400" />
            <h2 className="text-[15px] font-bold text-white">Appearance</h2>
          </div>

          <div className="flex items-center justify-between rounded-[10px] border border-zinc-800 bg-[#0a0a0a] px-5 py-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {darkMode
                  ? <Moon size={15} className="text-zinc-400" />
                  : <Sun size={15} className="text-zinc-400" />
                }
                <span className="text-sm font-semibold text-white">Dark Mode</span>
              </div>
              <p className="text-[12px] text-zinc-500 pl-[23px]">
                Toggle between light and dark themes for the dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleDarkMode}
              aria-label="Toggle dark mode"
              style={{
                width: 44,
                height: 24,
                borderRadius: 9999,
                padding: 3,
                background: darkMode ? "white" : "#3f3f46",
                border: "none",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9999,
                  background: darkMode ? "#0c0c0f" : "white",
                  transition: "transform 0.2s",
                  transform: darkMode ? "translateX(20px)" : "translateX(0px)",
                  display: "block",
                }}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
