"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AudioLines,
  LayoutDashboard,
  PhoneCall,
  Activity,
  Award,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
  Compass,
  ArrowUpRight,
  TrendingUp,
  CircleDot
} from "lucide-react";

interface CallLog {
  id: string;
  agent: string;
  duration: string;
  status: "active" | "completed" | "queued";
  sentiment: "Positive" | "Neutral" | "Negative";
  latency: string;
  time: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [calls, setCalls] = useState<CallLog[]>([
    {
      id: "C-9021",
      agent: "Sarah (Billing Support)",
      duration: "02:41",
      status: "active",
      sentiment: "Positive",
      latency: "120ms",
      time: "Just now"
    },
    {
      id: "C-8982",
      agent: "Alex (Tech Support)",
      duration: "05:12",
      status: "completed",
      sentiment: "Positive",
      latency: "145ms",
      time: "2 mins ago"
    },
    {
      id: "C-8871",
      agent: "David (Outbound Lead)",
      duration: "00:45",
      status: "active",
      sentiment: "Neutral",
      latency: "98ms",
      time: "5 mins ago"
    },
    {
      id: "C-8850",
      agent: "Sarah (Billing Support)",
      duration: "08:19",
      status: "completed",
      sentiment: "Negative",
      latency: "190ms",
      time: "12 mins ago"
    },
    {
      id: "C-8842",
      agent: "Emma (Onboarding Agent)",
      duration: "03:55",
      status: "completed",
      sentiment: "Positive",
      latency: "115ms",
      time: "18 mins ago"
    }
  ]);

  // Simulate incoming live voice call activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCalls((prevCalls) => {
        // Increment first active call duration
        return prevCalls.map((call, idx) => {
          if (call.status === "active") {
            const [min, sec] = call.duration.split(":").map(Number);
            const totalSec = min * 60 + sec + 1;
            const nextMin = Math.floor(totalSec / 60).toString().padStart(2, "0");
            const nextSec = (totalSec % 60).toString().padStart(2, "0");
            return { ...call, duration: `${nextMin}:${nextSec}` };
          }
          return call;
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#0a0a0c] border-r border-zinc-900 flex flex-col justify-between p-6">
        <div className="space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 px-2">
            <AudioLines className="text-white w-6 h-6 animate-pulse" />
            <span className="text-lg font-bold tracking-tight text-white select-none">
              HuemanAI
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab("calls")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "calls"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <PhoneCall size={18} />
              <span>Voice Agents</span>
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity size={18} />
              <span>Realtime Metrics</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-white/10 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings size={18} />
              <span>Configuration</span>
            </button>
          </nav>
        </div>

        {/* User Card & Sign Out */}
        <div className="space-y-4 pt-6 border-t border-zinc-900">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User size={16} className="text-zinc-300" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Administrator</p>
              <p className="text-[10px] text-zinc-500">admin@hueman.ai</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-950/20 hover:text-red-300 transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Section */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-[#050505]">
        
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-900 px-8 flex justify-between items-center bg-[#070709]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold tracking-tight">Voice Operations Console</h2>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <CircleDot size={8} className="animate-pulse fill-emerald-400" />
              Live Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search call logs, agents..."
                className="w-56 bg-[#0a0a0c] border border-zinc-900 rounded-full pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-zinc-800 transition-colors"
              />
            </div>
            
            {/* Alerts */}
            <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-zinc-950 to-[#0e0e11] border border-zinc-900/80 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute right-10 top-0 bottom-0 flex items-center opacity-10 pointer-events-none">
              <Compass size={180} className="text-white animate-spin-slow" style={{ animationDuration: '40s' }} />
            </div>
            <div className="max-w-xl space-y-2 relative z-10">
              <h3 className="text-xl font-bold">Welcome back to HuemanAI!</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Your neural voice support agents are currently operating fully autonomously. Overall user sentiment is tracking high today.
              </p>
            </div>
          </div>

          {/* Metric Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Metric 1 */}
            <div className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors">
              <div className="flex justify-between items-start text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Call Channels</span>
                <PhoneCall size={16} className="text-white" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">2</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingUp size={12} />
                  +12%
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">Concurrent active lines</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors">
              <div className="flex justify-between items-start text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Average Latency</span>
                <Activity size={16} className="text-white" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">134ms</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  -8ms
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">LLM + TTS delivery speed</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors">
              <div className="flex justify-between items-start text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Speech Accuracy</span>
                <Award size={16} className="text-white" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">99.4%</span>
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  Optimal
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">Transcription accuracy score</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-colors">
              <div className="flex justify-between items-start text-zinc-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Calls Today</span>
                <ArrowUpRight size={16} className="text-white" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">1,842</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <TrendingUp size={12} />
                  +240
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-2">Completed automated logs</p>
            </div>

          </div>

          {/* Active Call Logs Table */}
          <div className="bg-[#0b0b0d] border border-zinc-900 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider">Recent Audio Call Logs</h4>
                <p className="text-[11px] text-zinc-500">Live operational events stream</p>
              </div>
              <button
                onClick={() => setCalls([
                  {
                    id: `C-${Math.floor(1000 + Math.random() * 9000)}`,
                    agent: "Emma (Onboarding Agent)",
                    duration: "00:00",
                    status: "active",
                    sentiment: "Positive",
                    latency: "105ms",
                    time: "Just now"
                  },
                  ...calls
                ])}
                className="text-xs border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-zinc-300 hover:text-white"
              >
                Spawn Live Call
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pt-2 pl-2">Call ID</th>
                    <th className="pb-3 pt-2">Voice Agent</th>
                    <th className="pb-3 pt-2">Duration</th>
                    <th className="pb-3 pt-2">Latency</th>
                    <th className="pb-3 pt-2">Sentiment</th>
                    <th className="pb-3 pt-2">Status</th>
                    <th className="pb-3 pt-2 text-right pr-2">Started</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60">
                  {calls.map((call) => (
                    <tr key={call.id} className="hover:bg-zinc-900/20 transition-all">
                      <td className="py-4 pl-2 font-mono text-zinc-400 font-semibold">{call.id}</td>
                      <td className="py-4 font-medium text-white">{call.agent}</td>
                      <td className="py-4 text-zinc-300 font-mono">{call.duration}</td>
                      <td className="py-4 text-zinc-400 font-mono">{call.latency}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          call.sentiment === "Positive"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : call.sentiment === "Neutral"
                            ? "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {call.sentiment}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          call.status === "active"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : "bg-zinc-500/10 text-zinc-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            call.status === "active" ? "bg-blue-400 animate-pulse" : "bg-zinc-600"
                          }`} />
                          {call.status}
                        </span>
                      </td>
                      <td className="py-4 text-right pr-2 text-zinc-500">{call.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
