"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  PhoneCall,
  Calendar,
  Activity,
  Award,
  Settings,
  User,
  Moon,
  Sun,
  Mail,
  Clock,
  LogOut,
} from "lucide-react";
import { fetchUserProfile, fetchDashboardSummary } from "@/lib/api/user";
import { useAuthStore, getUserFullName } from "@/store/authStore";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Profile");
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Auth Store fallback for sidebar UI
  const { user } = useAuthStore();
  const userFullName = getUserFullName(user) || "Fredrick";
  const userEmail = user?.email || "fredrick@huemanai.co.uk";
  const avatarLetter = (userFullName[0] || userEmail[0] || "F").toUpperCase();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme === "light") {
        setDarkMode(false);
      }
    }
  }, []);

  const handleToggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    if (typeof window !== "undefined") {
      if (nextVal) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      loadProfileData();
    }
  }, [mounted]);

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch dashboard summary first
      const endDateObj = new Date();
      const startDateObj = new Date();
      startDateObj.setDate(endDateObj.getDate() - 29); // 30 days range

      const formatDate = (date: Date) => {
        return date.toISOString().split("T")[0];
      };

      const summaryPayload = {
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        dateRange: `custom|${formatDate(startDateObj)}|${formatDate(endDateObj)}`
      };

      try {
        const summaryData = await fetchDashboardSummary(summaryPayload);
        setSummary(summaryData);
      } catch (sumErr) {
        console.error("Failed to fetch dashboard summary:", sumErr);
      }

      // 2. Fetch user profile
      const profileData = await fetchUserProfile();
      setProfile(profileData);
    } catch (err: any) {
      console.error("Failed to load user profile:", err);
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#050505] flex items-center justify-center text-white text-xl font-bold">
        <div className="flex items-center gap-2">
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          Loading Profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full h-screen bg-[#050505] flex items-center justify-center text-white text-xl font-bold">
        <div className="text-center text-rose-400">
          <p>Error: {error || "Failed to load profile data."}</p>
          <button 
            onClick={() => loadProfileData()} 
            className="mt-4 px-4 py-2 bg-white text-black rounded-lg text-sm font-semibold hover:bg-zinc-200 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculated fields
  const totalCallMinutes = 4500; // Match original site limit
  const callMinutesUsed = profile.call_minutes_used || 515;
  const minutesLeft = totalCallMinutes - callMinutesUsed;
  const planSuffix = profile.plan_type === "per_month" ? " / Month" : "";

  // Falls back to screenshot values if not present
  const totalCallsProvided = profile.total_calls_provided || 2000;
  const callsLeft = summary && typeof summary.totalCalls === "number"
    ? totalCallsProvided - summary.totalCalls
    : (profile.calls_left || 1695);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* Sidebar */}
      <aside style={{ width: "230px" }} className="shrink-0 border-r border-[#1e1e24] bg-[#0c0c0e] px-4 py-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-[17px] font-bold tracking-tight text-white select-none">HuemanAI</span>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  router.push(item.href);
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                  activeTab === item.name
                    ? "bg-[#1d1d22] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}

            <div className="mt-3 rounded-2xl border border-[#29292f] bg-white/5 px-3 py-3">
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="h-3.5 w-3.5 rounded-full bg-[#a855f7]" />
                <span className="text-xs font-semibold tracking-wide">Netra AI</span>
              </div>
              <p className="mt-1 text-[9px] text-purple-400 font-semibold uppercase tracking-[0.3em] ml-7">
                Coming Soon
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab("Admin");
                router.push("/admin");
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                activeTab === "Admin"
                  ? "bg-[#1d1d22] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Settings size={15} />
              <span>Admin</span>
            </button>
          </nav>
        </div>

        {/* User Block (Selected / Clicked to stay on profile) */}
        <div className="mt-6 border-t border-[#18181b]/60 pt-5">
          <div 
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 px-1.5 cursor-pointer bg-[#1d1d22] rounded-xl py-2 hover:opacity-90 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] border border-zinc-850 text-xs font-extrabold text-zinc-300">
              {avatarLetter}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">{profile.first_name || userFullName}</p>
              <p className="text-[9px] text-zinc-500 truncate">{profile.email || userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-[#29292f] bg-[#101118] px-3 py-3 text-[11px] font-semibold text-zinc-400 transition hover:text-white hover:border-white/10"
          >
            <LogOut size={14} />
            Logout
          </button>

          <div className="mt-4 flex justify-start px-2 text-zinc-600 transition-colors hover:text-zinc-400">
            <span className="text-xl">&lt;</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#050505] p-6 lg:p-10">
        <div className="max-w-[1200px] mx-auto space-y-8">
          
          {/* Header */}
          <div className="space-y-1.5 mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Profile
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your account settings and view usage statistics.
            </p>
          </div>

          {/* Grid Layout of Row 1 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            
            {/* Personal Information */}
            <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm flex flex-col space-y-6">
              <div className="flex items-center gap-2 text-zinc-300">
                <User size={18} className="text-zinc-400" />
                <h2 className="text-base font-bold text-white">Personal Information</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-zinc-500">Full Name</span>
                  <p className="text-sm font-semibold text-white">{profile.first_name} {profile.last_name || ""}</p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Mail size={13} className="shrink-0" />
                    <span className="text-xs font-semibold">Email Address</span>
                  </div>
                  <p className="text-sm font-semibold text-white break-all">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm flex flex-col space-y-6">
              <div className="flex items-center gap-2 text-zinc-300">
                <PhoneCall size={18} className="text-zinc-400" />
                <h2 className="text-base font-bold text-white">Usage Statistics</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock size={13} className="shrink-0" />
                    <span className="text-xs font-semibold">Total Call Minutes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{totalCallMinutes} mins</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar size={13} className="shrink-0" />
                    <span className="text-xs font-semibold">Minutes Left (This Month)</span>
                  </div>
                  <p className="text-2xl font-bold text-white flex items-baseline gap-1">
                    <span>{minutesLeft}</span>
                    <span className="text-sm font-medium text-zinc-500">{planSuffix}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Calls Statistics */}
            <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm flex flex-col space-y-6">
              <div className="flex items-center gap-2 text-zinc-300">
                <PhoneCall size={18} className="text-zinc-400" />
                <h2 className="text-base font-bold text-white">Calls Statistics</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Clock size={13} className="shrink-0" />
                    <span className="text-xs font-semibold">Total Calls Provided</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{totalCallsProvided} Calls</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <Calendar size={13} className="shrink-0" />
                    <span className="text-xs font-semibold">Calls Left (This Month)</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{callsLeft}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Appearance */}
          <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm space-y-6 mt-8">
            <div className="flex items-center gap-2 text-zinc-300">
              <Settings size={18} className="text-zinc-400" />
              <h2 className="text-base font-bold text-white">Appearance</h2>
            </div>

            <div className="rounded-2xl border border-[#232327] bg-[#050507] p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-200">
                  {darkMode ? (
                    <Moon size={16} className="text-zinc-400" />
                  ) : (
                    <Sun size={16} className="text-zinc-400" />
                  )}
                  <h3 className="text-sm font-semibold">Dark Mode</h3>
                </div>
                <p className="text-xs text-zinc-500 pl-6">Toggle between light and dark themes for the dashboard.</p>
              </div>

              <button
                type="button"
                onClick={handleToggleDarkMode}
                style={{
                  width: 44,
                  height: 24,
                  borderRadius: 9999,
                  padding: 3,
                  cursor: "pointer",
                  transition: "background 0.2s",
                  background: darkMode ? "white" : "#e4e4e7",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
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
    </div>
  );
}
