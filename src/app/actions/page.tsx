"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  EyeOff,
  Calendar,
  X,
} from "lucide-react";
import { fetchActionsList, updateAction, fetchActionStats, decryptPhoneNumber, createAction } from "@/lib/api/actions";
import { TimezoneDate } from "@/lib/timezone/TimezoneDate";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  labelPrefix?: string;
}

function CustomDropdown({ value, onChange, options, labelPrefix = "" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative inline-block shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-between rounded-full border border-zinc-800 bg-[#050505] pl-4 pr-9 h-10 text-xs font-semibold text-zinc-300 outline-none hover:bg-[#0c0c0e] hover:border-zinc-700 active:scale-95 transition-all cursor-pointer select-none"
      >
        <span className="truncate">
          {labelPrefix}{activeOption?.label}
        </span>
        <ChevronDown
          className={`absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 min-w-[160px] max-h-60 overflow-y-auto bg-[#0A0A0A] border border-zinc-800 rounded-xl py-1.5 shadow-xl select-none animate-in fade-in duration-100">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-1.5 transition-colors duration-150"
              >
                <span className="w-4 h-4 inline-flex items-center justify-center text-zinc-400 shrink-0 font-bold">
                  {isSelected ? "✓" : ""}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in progress", label: "In Progress" },
  { value: "waiting on guest", label: "Waiting on Guest" },
  { value: "resolved", label: "Resolved" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "promotion enquiry", label: "Promotion Enquiry" },
  { value: "large group booking", label: "Large Group Booking" },
  { value: "system error", label: "System Error" },
  { value: "availability error", label: "Availability Error" },
  { value: "cancellation", label: "Cancellation" },
  { value: "booking update", label: "Booking Update" },
  { value: "waitlist", label: "Waitlist" },
  { value: "lost & found", label: "Lost & Found" },
  { value: "misc", label: "Callback Needed" },
];

const priorityOptions = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const sortByOptions = [
  { value: "created_at", label: "created" },
  { value: "priority", label: "priority" },
  { value: "status", label: "status" },
  { value: "due_at", label: "due date" },
];

const sortOrderOptions = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

const modalTypeOptions = [
  { value: "promotion enquiry", label: "Promotion Enquiry" },
  { value: "large group booking", label: "Large Group Booking" },
  { value: "system error", label: "System Error" },
  { value: "availability error", label: "Availability Error" },
  { value: "cancellation", label: "Cancellation" },
  { value: "booking update", label: "Booking Update" },
  { value: "waitlist", label: "Waitlist" },
  { value: "lost & found", label: "Lost & Found" },
  { value: "misc", label: "Callback Needed" },
];

const modalPriorityOptions = [
  { value: "default", label: "Use default for type" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const rowStatusOptions = [
  { value: "open",             label: "Open",             color: "text-emerald-400 border-emerald-500/30", bg: "bg-transparent border" },
  { value: "in_progress",      label: "In Progress",      color: "text-blue-400 border-blue-500/20",    bg: "bg-blue-500/10 border" },
  { value: "waiting_on_guest", label: "Waiting on Guest", color: "text-amber-400 border-amber-500/20",   bg: "bg-amber-500/10 border" },
  { value: "resolved",         label: "Resolved",         color: "text-zinc-400 border-zinc-800",    bg: "bg-zinc-900/40 border" },
];

// Normalise whatever the API returns into one of our known values
function normaliseStatus(raw: string): string {
  if (!raw) return "open";
  const s = raw.toLowerCase().trim();
  if (s === "in progress" || s === "in_progress") return "in_progress";
  if (s === "waiting on guest" || s === "waiting_on_guest") return "waiting_on_guest";
  if (s === "resolved") return "resolved";
  return "open";
}

interface StatusDropdownProps {
  actionId: string;
  currentStatus: string;
  onStatusChange: () => void;
}

function StatusDropdown({ actionId, currentStatus, onStatusChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false);
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const display = normaliseStatus(optimistic ?? currentStatus);
  const active = rowStatusOptions.find((o) => o.value === display) ?? rowStatusOptions[0];

  const handleSelect = async (val: string) => {
    setOpen(false);
    setOptimistic(val);
    setUpdating(true);
    try {
      await updateAction(actionId, {
        status: val,
        resolved_at: val === "resolved" ? new Date().toISOString() : null,
      });
      onStatusChange();
    } catch (err) {
      console.error("Failed to update status", err);
      setOptimistic(null); // roll back
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button
        type="button"
        disabled={updating}
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 pr-5 text-xs font-semibold cursor-pointer transition-all select-none ${active.bg} ${active.color} ${updating ? "opacity-60" : ""}`}
        style={{ position: "relative" }}
      >
        {active.label}
        <ChevronDown
          style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}
          className={`h-3 w-3 opacity-80 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 9999, minWidth: 160 }}
          className="rounded-xl border border-zinc-800 bg-[#0A0A0A] py-1 shadow-xl select-none animate-in fade-in duration-100"
        >
          {rowStatusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/5 ${opt.color.split(' ')[0]} ${display === opt.value ? "font-bold" : ""}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ActionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Actions");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const [revealedPhones, setRevealedPhones] = useState<Record<number, string>>({});

  // Manual Creation Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [modalIssueType, setModalIssueType] = useState("misc");
  const [modalPriority, setModalPriority] = useState("default");
  const [createLoading, setCreateLoading] = useState(false);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutsideModalSelects(event: MouseEvent) {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target as Node)) {
        setIsPriorityDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideModalSelects);
    return () => document.removeEventListener("mousedown", handleClickOutsideModalSelects);
  }, []);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "open", "in progress", "resolved"
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "misc", "cancellation"
  const [priorityFilter, setPriorityFilter] = useState("all"); // "all", "low", "medium", "high"
  const [sortBy, setSortBy] = useState("due_at"); // "due_at", "created_at"
  const [sortOrder, setSortOrder] = useState("desc"); // "desc", "asc"
  const [currentPage, setCurrentPage] = useState(1);

  // Dynamic stats
  const [stats, setStats] = useState<any>({
    open: 106,
    openTrend: 29,
    dueToday: 3,
    dueTodayTrend: 100,
    overdue: 102,
    overdueTrend: 26,
    topTypes: [
      { label: "Miscellaneous", count: 21, change_pct: 600 },
      { label: "Cancellation", count: 3, change_pct: 100 }
    ]
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
      const res = await fetchActionStats();
      if (res) {
        setStats({
          open: res.open_actions?.count ?? 0,
          openTrend: res.open_actions?.change_pct ?? 0,
          dueToday: res.due_today?.count ?? 0,
          dueTodayTrend: res.due_today?.change_pct ?? 0,
          overdue: res.overdue?.count ?? 0,
          overdueTrend: res.overdue?.change_pct ?? 0,
          topTypes: res.top_types || []
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

  const dynamicTopTypes = stats.topTypes || [];
  const type1 = dynamicTopTypes[0] || { label: "Miscellaneous", count: 0, change_pct: 0 };
  const type2 = dynamicTopTypes[1] || { label: "Cancellation", count: 0, change_pct: 0 };

  const summaryCards = [
    { label: "OPEN ACTIONS", value: stats.open.toString(), trend: `${stats.openTrend}% vs prev`, color: "text-emerald-400" },
    { label: "DUE TODAY", value: stats.dueToday.toString(), trend: `${stats.dueTodayTrend}% vs prev`, color: "text-emerald-400" },
    { label: "OVERDUE", value: stats.overdue.toString(), trend: `${stats.overdueTrend}% vs prev`, color: "text-rose-400" },
    { label: (type1.label || type1.request_type || "Miscellaneous").toUpperCase(), value: (type1.count ?? 0).toString(), trend: `${type1.change_pct ?? 0}% vs prev`, color: "text-emerald-400" },
    { label: (type2.label || type2.request_type || "Cancellation").toUpperCase(), value: (type2.count ?? 0).toString(), trend: `${type2.change_pct ?? 0}% vs prev`, color: "text-emerald-400" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
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
          <div 
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 px-1.5 cursor-pointer hover:opacity-80 transition-all"
          >
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
        <main className="flex h-full flex-col overflow-hidden p-6">
          <div className="flex flex-col h-full min-h-0 space-y-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <h1 className="text-[28px] font-bold tracking-tight text-white">
                  Action Center
                </h1>
                <p className="text-sm text-zinc-400 font-light">
                  Manage and track guest follow-ups and resolutions
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    loadActions();
                    fetchStats();
                  }}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-full border border-zinc-800 bg-[#0c0c0e]/40 hover:bg-[#0c0c0e] hover:border-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white transition disabled:opacity-50 cursor-pointer"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 h-10 text-sm font-semibold text-black hover:bg-zinc-200 transition"
                >
                  <Plus className="h-4 w-4" />
                  New Action
                </button>
              </div>
            </div>

            <div className="rounded-full border border-zinc-800/80 bg-[#0A0A0A] px-4 py-2 shadow-sm">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 text-xs md:text-sm text-zinc-300">
                  <Bell className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span>Enable notifications for new actions, overdue items, and repeat callers.</span>
                </div>
                <button
                  className="rounded-full bg-white h-8 px-4 text-xs font-semibold text-black hover:bg-zinc-200 transition shrink-0 ml-4"
                  onClick={async () => {
                    if (typeof window !== "undefined" && "Notification" in window) {
                      await Notification.requestPermission();
                    }
                  }}
                >
                  Enable
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {summaryCards.map((card) => (
                <div key={card.label} className="rounded-xl border border-zinc-800/80 bg-[#0A0A0A] p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">{card.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
                  </div>
                  <p className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium ${card.color}`}>
                    <ArrowUpRight className="h-3 w-3" />
                    {card.trend}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex-grow flex flex-col min-h-0 rounded-2xl border border-zinc-800 bg-[#0A0A0A] p-5 lg:p-6 shadow-sm">
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 w-full">
                <div className="relative w-72 shrink-0">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by guest name or phone..."
                    className="w-full h-10 rounded-full border border-zinc-800 bg-[#050505] pl-10 pr-4 text-xs text-white outline-none ring-0 transition focus:border-zinc-700"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap xl:flex-nowrap">
                  {/* Status Filter */}
                  <CustomDropdown
                    value={statusFilter}
                    onChange={(val) => {
                      setStatusFilter(val);
                      setCurrentPage(1);
                    }}
                    options={statusOptions}
                  />

                  {/* Type Filter */}
                  <CustomDropdown
                    value={typeFilter}
                    onChange={(val) => {
                      setTypeFilter(val);
                      setCurrentPage(1);
                    }}
                    options={typeOptions}
                  />

                  {/* Priority Filter */}
                  <CustomDropdown
                    value={priorityFilter}
                    onChange={(val) => {
                      setPriorityFilter(val);
                      setCurrentPage(1);
                    }}
                    options={priorityOptions}
                  />

                  <span className="text-xs text-zinc-400 font-semibold shrink-0 select-none mr-0.5">Sort:</span>

                  {/* Sort By Filter */}
                  <CustomDropdown
                    value={sortBy}
                    onChange={(val) => {
                      setSortBy(val);
                      setCurrentPage(1);
                    }}
                    options={sortByOptions}
                  />

                  {/* Sort Order Filter */}
                  <CustomDropdown
                    value={sortOrder}
                    onChange={(val) => {
                      setSortOrder(val);
                      setCurrentPage(1);
                    }}
                    options={sortOrderOptions}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0 mt-6 overflow-hidden rounded-xl border border-zinc-800">
                <div className="overflow-x-auto overflow-y-auto flex-grow min-h-0">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="bg-[#050505] text-left text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800/60">
                      <tr>
                        <th className="px-4 py-3">Created</th>
                        <th className="px-4 py-3">Guest</th>
                        <th className="px-4 py-3">Phone</th>
                        <th className="px-4 py-3">Issue Type</th>
                        <th className="px-4 py-3">Priority</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Due</th>
                        <th className="px-4 py-3">Comments</th>
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
                          const repeatCount = (action.linked_calls && action.linked_calls.length > 1)
                            ? action.linked_calls.length
                            : (action.follow_up_count || 0);
                          const isRepeatCaller = repeatCount > 1;
                          
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
                              className={`border-b border-zinc-800/50 transition-colors ${
                                isActionOverdue ? "bg-[#1b0b0e]/35" : "bg-transparent hover:bg-white/5"
                              }`}
                            >
                              <td className={`px-4 py-2 text-zinc-300 ${isRepeatCaller ? "border-l-[3px] border-orange-500 pl-3" : ""}`}>
                                {createdFormatted}
                              </td>
                              <td 
                                className="px-4 py-2 cursor-pointer hover:underline animate-none"
                                onClick={() => router.push(`/actions/${action.id}`)}
                              >
                                <div className="flex flex-col gap-1">
                                  <div className="font-semibold text-white">{action.guest_name || "-"}</div>
                                  {isRepeatCaller ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2d1a0c] px-2 py-0.5 text-[9px] font-semibold tracking-wider text-orange-300 w-max border border-orange-500/20">
                                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                                      REPEAT X{repeatCount}
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-zinc-400">
                                <div className="inline-flex items-center gap-2">
                                  <span>
                                    {revealedPhones[action.id] || action.phone_number || "-"}
                                  </span>
                                  <button
                                    onClick={async () => {
                                      if (revealedPhones[action.id]) {
                                        setRevealedPhones((prev) => {
                                          const copy = { ...prev };
                                          delete copy[action.id];
                                          return copy;
                                        });
                                      } else {
                                        try {
                                          const res = await decryptPhoneNumber(action.id.toString());
                                          if (res && res.decryptedNumber) {
                                            setRevealedPhones((prev) => ({
                                              ...prev,
                                              [action.id]: res.decryptedNumber,
                                            }));
                                          }
                                        } catch (err) {
                                          console.error("Failed to decrypt phone number", err);
                                        }
                                      }
                                    }}
                                    className="text-zinc-500 hover:text-white transition focus:outline-none"
                                  >
                                    {revealedPhones[action.id] ? (
                                      <EyeOff className="h-4 w-4" />
                                    ) : (
                                      <Eye className="h-4 w-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/20 px-2.5 py-0.5 text-xs font-medium text-zinc-300">
                                  {issueTypeLabel}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                                    action.priority?.toLowerCase() === "high"
                                      ? "border-rose-500/30 text-rose-400 bg-rose-500/5"
                                      : action.priority?.toLowerCase() === "medium"
                                      ? "border-orange-500/30 text-orange-400 bg-orange-500/5"
                                      : "border-zinc-800 text-zinc-400 bg-zinc-900/40"
                                  }`}
                                >
                                  {action.priority ? (action.priority.charAt(0).toUpperCase() + action.priority.slice(1).toLowerCase()) : "Low"}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                <StatusDropdown
                                  actionId={action.id.toString()}
                                  currentStatus={action.status || "open"}
                                  onStatusChange={() => { loadActions(); fetchStats(); }}
                                />
                              </td>
                              <td className={`px-4 py-2 font-semibold ${isActionOverdue ? "text-rose-400" : "text-zinc-300"}`}>
                                <div className="flex items-center gap-1.5">
                                  {isActionOverdue && (
                                    <svg className="h-3.5 w-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                  )}
                                  <span>{formatDueColumn(action.due_at, isActionOverdue)}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-zinc-500">{action.comments || "-"}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
 
                {/* Pagination Footer */}
                {pagination.total > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-transparent border-t border-zinc-800/60">
                    <div className="text-xs text-zinc-400">
                      Showing page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                      <span className="font-semibold text-white">{pagination.totalPages || 1}</span> (
                      <span className="font-semibold text-white">{pagination.total}</span> total results)
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={!pagination.hasPreviousPage}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-zinc-800 bg-[#050505] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        &lt; Previous
                      </button>
                      {pagination.totalPages > 1 && [...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                            currentPage === i + 1
                              ? "bg-white text-black font-extrabold"
                              : "border border-zinc-800 bg-[#050505] text-zinc-400 hover:text-white"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      {pagination.totalPages <= 1 && (
                        <button
                          className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-white text-black cursor-default select-none"
                        >
                          1
                        </button>
                      )}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                        disabled={!pagination.hasNextPage}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-zinc-800 bg-[#050505] text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        Next &gt;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {mounted && isCreateModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <div 
            className="w-full max-w-[480px] bg-[#0c0c0e] border border-[#29292f] rounded-3xl p-6 shadow-2xl relative text-white flex flex-col max-h-[90vh]"
            style={{
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-500 hover:text-zinc-300 transition focus:outline-none"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">Create New Action</h2>
              <p className="text-xs text-zinc-400 mt-1">Manually create an action item for team follow-up.</p>
            </div>

            {/* Form Scrollable Area */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (createLoading) return;
                
                // Form validation
                if (!guestName.trim()) {
                  alert("Guest Name is required");
                  return;
                }

                setCreateLoading(true);
                try {
                  const payload = {
                    request_type: modalIssueType,
                    guest_name: guestName,
                    phone_number: phoneNumber,
                    priority: modalPriority === "default" ? null : modalPriority,
                    notes: notes,
                  };

                  await createAction(payload);

                  // Reset form
                  setGuestName("");
                  setPhoneNumber("");
                  setNotes("");
                  setModalIssueType("misc");
                  setModalPriority("default");
                  setIsCreateModalOpen(false);

                  // Reload list & stats
                  loadActions();
                  fetchStats();
                } catch (err) {
                  console.error("Failed to create action", err);
                  alert("Failed to create action: " + (err as any).message);
                } finally {
                  setCreateLoading(false);
                }
              }}
              className="flex-grow flex flex-col min-h-0 mt-5"
            >
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[60vh] custom-scrollbar">
                {/* Issue Type Selector */}
                <div ref={typeDropdownRef}>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Issue Type *</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                      className="w-full relative inline-flex items-center justify-between rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-zinc-100 outline-none hover:bg-[#1f1f24] transition select-none cursor-pointer"
                    >
                      <span>{modalTypeOptions.find(o => o.value === modalIssueType)?.label || "Callback Needed"}</span>
                      <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isTypeDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 z-50 max-h-60 overflow-y-auto bg-[#101014] border border-[#2a2a30] rounded-xl py-1.5 shadow-xl select-none">
                        {modalTypeOptions.map((opt) => {
                          const isSelected = opt.value === modalIssueType;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setModalIssueType(opt.value);
                                setIsTypeDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-[#1a1a20] hover:text-white flex items-center gap-2 transition"
                            >
                              <span className="w-4 h-4 inline-flex items-center justify-center text-zinc-400 shrink-0 font-bold">
                                {isSelected ? "✓" : ""}
                              </span>
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Guest Name */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Guest Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="w-full rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20"
                  />
                </div>

                {/* Priority */}
                <div ref={priorityDropdownRef}>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Priority</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                      className="w-full relative inline-flex items-center justify-between rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-zinc-100 outline-none hover:bg-[#1f1f24] transition select-none cursor-pointer"
                    >
                      <span>{modalPriorityOptions.find(o => o.value === modalPriority)?.label || "Use default for type"}</span>
                      <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isPriorityDropdownOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isPriorityDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 z-50 bg-[#101014] border border-[#2a2a30] rounded-xl py-1.5 shadow-xl select-none">
                        {modalPriorityOptions.map((opt) => {
                          const isSelected = opt.value === modalPriority;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setModalPriority(opt.value);
                                setIsPriorityDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-[#1a1a20] hover:text-white flex items-center gap-2 transition"
                            >
                              <span className="w-4 h-4 inline-flex items-center justify-center text-zinc-400 shrink-0 font-bold">
                                {isSelected ? "✓" : ""}
                              </span>
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context for this action..."
                    rows={3}
                    className="w-full rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20 resize-none animate-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-[#1d1d22]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-zinc-800 bg-[#0c0c0e] px-5 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-900/50 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {createLoading ? "Creating..." : "Create Action"}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}
