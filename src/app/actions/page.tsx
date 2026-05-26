"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Bell,
  Search,
  Plus,
  RefreshCcw,
  ChevronDown,
  Layers,
  PhoneCall,
  Activity,
  Award,
  Settings,
  Eye,
  Calendar,
} from "lucide-react";
import { fetchActionsList, updateAction } from "@/lib/api/actions";
import { TimezoneDate } from "@/lib/timezone/TimezoneDate";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

export default function ActionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Actions");

  const [actionsList, setActionsList] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "open", "in progress", "resolved"
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "misc", "cancellation"
  const [priorityFilter, setPriorityFilter] = useState("all"); // "all", "low", "medium", "high"
  const [sortBy, setSortBy] = useState("due_at"); // "due_at", "created_at"
  const [sortOrder, setSortOrder] = useState("desc"); // "desc", "asc"
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic stats
  const [stats, setStats] = useState({
    open: 106,
    dueToday: 3,
    overdue: 102,
    misc: 21,
    cancellation: 3,
  });

  const loadActions = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
        excludeResolved: statusFilter !== "resolved",
      };

      if (statusFilter !== "all" && statusFilter !== "resolved") {
        payload.status = statusFilter;
      }
      if (priorityFilter !== "all") {
        payload.priority = priorityFilter;
      }
      if (typeFilter !== "all") {
        payload.request_type = typeFilter;
      }
      if (searchQuery) {
        payload.search = searchQuery;
      }

      const res = await fetchActionsList(payload);
      if (res) {
        setActionsList(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      console.error("Failed to load actions", err);
      setError(err.message || "Failed to load actions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetchActionsList({
        page: 1,
        limit: 500,
        excludeResolved: true,
      });
      if (res && res.data) {
        const data = res.data;
        const totalOpen = res.pagination?.total || data.length;
        
        // Calculate overdue
        const overdueCount = data.filter((item: any) => 
          item.is_overdue || (item.due_at && new Date(item.due_at).getTime() < Date.now())
        ).length;
        
        // Calculate due today
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999).getTime();
        const dueTodayCount = data.filter((item: any) => {
          if (!item.due_at) return false;
          const dueTime = new Date(item.due_at).getTime();
          return dueTime >= startOfToday && dueTime <= endOfToday;
        }).length;
        
        // Calculate misc
        const miscCount = data.filter((item: any) => item.request_type === "misc").length;
        
        // Calculate cancellation
        const cancellationCount = data.filter((item: any) => 
          item.request_type === "cancellation" || item.request_type === "Cancellation"
        ).length;
        
        setStats({
          open: totalOpen,
          dueToday: dueTodayCount,
          overdue: overdueCount,
          misc: miscCount,
          cancellation: cancellationCount,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  // Load stats once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Load actions when filter/page changes
  useEffect(() => {
    loadActions();
  }, [currentPage, statusFilter, typeFilter, priorityFilter, sortBy, sortOrder]);

  // Debounced search query loading
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setCurrentPage(1);
      loadActions();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const formatDueColumn = (dueAtStr: string, isOverdue: boolean) => {
    if (!dueAtStr) return "-";
    
    const dueAtTime = new Date(dueAtStr).getTime();
    if (isNaN(dueAtTime)) return "-";
    
    const nowTime = Date.now();
    
    if (isOverdue || dueAtTime < nowTime) {
      const diff = nowTime - dueAtTime;
      if (diff < 3600000) {
        return `${Math.max(1, Math.floor(diff / 60000))}m overdue`;
      }
      if (diff < 86400000) {
        return `${Math.floor(diff / 3600000)}h overdue`;
      }
      return `${Math.floor(diff / 86400000)}d overdue`;
    } else {
      const remaining = dueAtTime - nowTime;
      if (remaining < 86400000) {
        if (remaining < 3600000) {
          return `In ${Math.max(1, Math.ceil(remaining / 60000))}m`;
        }
        return `In ${Math.ceil(remaining / 3600000)}h`;
      }
      try {
        const dateObj = new TimezoneDate(dueAtStr);
        return dateObj.format("d MMM");
      } catch {
        return new Date(dueAtStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      }
    }
  };

  const summaryCards = [
    { label: "OPEN ACTIONS", value: stats.open.toString(), trend: "29% vs prev", color: "text-emerald-400" },
    { label: "DUE TODAY", value: stats.dueToday.toString(), trend: "100% vs prev", color: "text-emerald-400" },
    { label: "OVERDUE", value: stats.overdue.toString(), trend: "26% vs prev", color: "text-rose-400" },
    { label: "MISCELLANEOUS", value: stats.misc.toString(), trend: "600% vs prev", color: "text-emerald-400" },
    { label: "CANCELLATION", value: stats.cancellation.toString(), trend: "100% vs prev", color: "text-emerald-400" },
  ];

  return (
    <div className="flex min-h-screen overflow-hidden bg-[#050505] text-white">
      <aside style={{ width: "230px" }} className="shrink-0 border-r border-[#1e1e24] bg-[#0c0c0e] px-4 py-5">
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

        <div className="mt-6 border-t border-[#18181b]/60 pt-5">
          <div className="flex items-center gap-3 px-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] border border-zinc-800 text-xs font-extrabold text-zinc-300">
              F
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">Fredrick</p>
              <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
            </div>
          </div>

          <button 
            onClick={() => router.push("/login")}
            className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-[#29292f] bg-[#101118] px-3 py-3 text-[11px] font-semibold text-zinc-400 transition hover:text-white hover:border-white/10"
          >
            Logout
          </button>

          <div className="mt-4 flex justify-start px-2 text-zinc-600 transition-colors hover:text-zinc-400">
            <span className="text-xl">&lt;</span>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-hidden">
        <main className="flex h-full flex-col overflow-auto p-6">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-zinc-400">Action Center</p>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Manage and track guest follow-ups and resolutions
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    loadActions();
                    fetchStats();
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
                >
                  <span className="inline-flex h-2.5 w-2.5 items-center justify-center rounded-full border border-white/20 bg-transparent text-white">
                    <RefreshCcw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
                  </span>
                  Refresh
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  New Action
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="rounded-3xl border border-[#29292f] bg-white/5 px-4 py-3 text-sm text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>Enable notifications for new actions, overdue items, and repeat callers.</span>
                  </div>
                </div>
                <button className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200">
                  Enable
                </button>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-5">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">{card.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
                  <p className={`mt-3 inline-flex items-center gap-2 text-sm ${card.color}`}>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    {card.trend}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-5 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by guest name or phone..."
                    className="w-full rounded-full border border-[#29292f] bg-[#08080a] px-12 py-3 text-sm text-white outline-none ring-0 transition focus:border-white/20"
                  />
                </div>
                <div className="flex min-w-0 items-center gap-2 flex-nowrap overflow-x-auto">
                  {/* Status Filter */}
                  <div className="relative inline-block shrink-0">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none inline-flex items-center rounded-full border border-[#29292f] bg-[#08080a] pl-4 pr-10 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 cursor-pointer"
                    >
                      <option value="all" className="bg-[#0c0c0f] text-white">All Statuses</option>
                      <option value="open" className="bg-[#0c0c0f] text-white">Open</option>
                      <option value="in progress" className="bg-[#0c0c0f] text-white">In Progress</option>
                      <option value="resolved" className="bg-[#0c0c0f] text-white">Resolved</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>

                  {/* Type Filter */}
                  <div className="relative inline-block shrink-0">
                    <select
                      value={typeFilter}
                      onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none inline-flex items-center rounded-full border border-[#29292f] bg-[#08080a] pl-4 pr-10 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 cursor-pointer"
                    >
                      <option value="all" className="bg-[#0c0c0f] text-white">All Types</option>
                      <option value="misc" className="bg-[#0c0c0f] text-white">Callback Needed</option>
                      <option value="cancellation" className="bg-[#0c0c0f] text-white">Cancellation</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>

                  {/* Priority Filter */}
                  <div className="relative inline-block shrink-0">
                    <select
                      value={priorityFilter}
                      onChange={(e) => {
                        setPriorityFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none inline-flex items-center rounded-full border border-[#29292f] bg-[#08080a] pl-4 pr-10 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 cursor-pointer"
                    >
                      <option value="all" className="bg-[#0c0c0f] text-white">All Priorities</option>
                      <option value="low" className="bg-[#0c0c0f] text-white">Low</option>
                      <option value="medium" className="bg-[#0c0c0f] text-white">Medium</option>
                      <option value="high" className="bg-[#0c0c0f] text-white">High</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>

                  <span className="text-sm text-zinc-400 shrink-0">Sort:</span>

                  {/* Sort By Filter */}
                  <div className="relative inline-block shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none inline-flex items-center rounded-full border border-[#29292f] bg-[#08080a] pl-4 pr-10 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 cursor-pointer"
                    >
                      <option value="due_at" className="bg-[#0c0c0f] text-white">Due Date</option>
                      <option value="created_at" className="bg-[#0c0c0f] text-white">Created Date</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>

                  {/* Sort Order Filter */}
                  <div className="relative inline-block shrink-0">
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setSortOrder(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="appearance-none inline-flex items-center rounded-full border border-[#29292f] bg-[#08080a] pl-4 pr-10 py-2 text-sm text-zinc-200 outline-none transition hover:bg-white/10 cursor-pointer"
                    >
                      <option value="desc" className="bg-[#0c0c0f] text-white">Descending</option>
                      <option value="asc" className="bg-[#0c0c0f] text-white">Ascending</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-3xl border border-[#29292f]">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-separate border-spacing-y-3 text-sm">
                    <thead className="bg-[#08080a] text-left text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      <tr>
                        <th className="px-4 py-4">Created</th>
                        <th className="px-4 py-4">Guest</th>
                        <th className="px-4 py-4">Phone</th>
                        <th className="px-4 py-4">Issue Type</th>
                        <th className="px-4 py-4">Priority</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Due</th>
                        <th className="px-4 py-4">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                            <div className="flex items-center justify-center gap-2">
                              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                              Loading actions...
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-rose-400 font-semibold">
                            Error: {error}
                          </td>
                        </tr>
                      ) : actionsList.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                            No actions found.
                          </td>
                        </tr>
                      ) : (
                        actionsList.map((action) => {
                          const isActionOverdue = action.is_overdue || (action.due_at && new Date(action.due_at).getTime() < Date.now());
                          
                          // Format created date
                          let createdFormatted = "-";
                          if (action.created_at) {
                            try {
                              const cleanCreated = action.created_at.replace(" ", "T") + "Z";
                              createdFormatted = new TimezoneDate(cleanCreated).format("dd MMM HH:mm");
                            } catch {
                              createdFormatted = action.created_at;
                            }
                          }

                          // Issue type label mapping
                          let issueTypeLabel = "-";
                          if (action.request_type === "misc") {
                            issueTypeLabel = "Callback Needed";
                          } else if (action.request_type === "cancellation" || action.request_type === "Cancellation") {
                            issueTypeLabel = "Cancellation";
                          } else {
                            issueTypeLabel = action.request_type_label || action.request_type || "-";
                          }

                          return (
                            <tr
                              key={action.id}
                              className={`border-t border-transparent bg-[#08080a] transition ${
                                isActionOverdue ? "bg-[#1b0b0e]" : "hover:bg-white/5"
                              }`}
                            >
                              <td className="px-4 py-4 text-zinc-300">{createdFormatted}</td>
                              <td 
                                className="px-4 py-4 cursor-pointer hover:underline"
                                onClick={() => router.push(`/actions/${action.id}`)}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="font-semibold text-white">{action.guest_name || "-"}</div>
                                  {action.follow_up_count && action.follow_up_count > 0 ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-[#2d1a0c] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-300 w-max">
                                      <span className="h-2 w-2 rounded-full bg-orange-400" />
                                      REPEAT X{action.follow_up_count}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-zinc-400">
                                <div className="inline-flex items-center gap-2">
                                  <span>{action.phone_number || "-"}</span>
                                  <Eye className="h-4 w-4 text-zinc-500" />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-300">
                                  {issueTypeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                    action.priority?.toLowerCase() === "high"
                                      ? "bg-[#3d1217] text-rose-300"
                                      : action.priority?.toLowerCase() === "medium"
                                      ? "bg-[#2d1a0c] text-orange-300"
                                      : "bg-[#111214] text-zinc-300"
                                  }`}
                                >
                                  {action.priority || "Low"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="relative inline-block">
                                  <select
                                    value={action.status || "open"}
                                    onChange={async (e) => {
                                      const newStatus = e.target.value;
                                      try {
                                        await updateAction(action.id.toString(), { 
                                          status: newStatus,
                                          resolved_at: newStatus === "resolved" ? new Date().toISOString() : null 
                                        });
                                        loadActions();
                                        fetchStats();
                                      } catch (err) {
                                        console.error("Failed to update status", err);
                                      }
                                    }}
                                    className={`appearance-none inline-flex items-center gap-2 rounded-full px-3 py-1 pr-7 text-[11px] font-semibold uppercase tracking-[0.18em] outline-none cursor-pointer border border-transparent ${
                                      action.status === "open"
                                        ? "bg-[#111214] text-emerald-300 hover:bg-[#1a1c20]"
                                        : action.status === "in progress"
                                        ? "bg-[#161c2c] text-blue-300 hover:bg-[#1f283f]"
                                        : "bg-[#121c16] text-zinc-400 hover:bg-[#1a2c20]"
                                    }`}
                                  >
                                    <option value="open" className="bg-[#0c0c0f] text-white">Open</option>
                                    <option value="in progress" className="bg-[#0c0c0f] text-white">In Progress</option>
                                    <option value="resolved" className="bg-[#0c0c0f] text-white">Resolved</option>
                                  </select>
                                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                                </div>
                              </td>
                              <td className={`px-4 py-4 font-semibold ${isActionOverdue ? "text-rose-400" : "text-zinc-300"}`}>
                                <div className="flex items-center gap-1.5">
                                  {isActionOverdue && <span className="text-rose-400">⚠️</span>}
                                  <span>{formatDueColumn(action.due_at, isActionOverdue)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-zinc-500">{action.comments || "-"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Footer */}
                {pagination.total > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#08080a] border-t border-[#29292f] rounded-b-3xl">
                    <div className="text-xs sm:text-sm text-zinc-400">
                      Showing <span className="font-semibold text-white">{(currentPage - 1) * pagination.limit + 1}</span> to{" "}
                      <span className="font-semibold text-white">
                        {Math.min(currentPage * pagination.limit, pagination.total)}
                      </span>{" "}
                      of <span className="font-semibold text-white">{pagination.total}</span> entries
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPreviousPage}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#29292f] bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        Previous
                      </button>
                      {pagination.totalPages > 1 && [...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                            currentPage === i + 1
                              ? "bg-white text-black"
                              : "border border-[#29292f] bg-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={!pagination.hasNextPage}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#29292f] bg-white/5 text-zinc-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
