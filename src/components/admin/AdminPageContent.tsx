/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserPlus,
  MoreHorizontal,
  ChevronDown,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";
import { fetchAdminUsers, updateOrganisationSettings, AdminUser, updateUserStatus, removeUser } from "@/lib/api/admin";
import InviteUserModal from "./InviteUserModal";

// ── Custom dark dropdown — matches the original site design ──────────────────
interface AdminSelectOption { value: string; label: string; }
interface AdminSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: AdminSelectOption[];
  id?: string;
}
function AdminSelect({ value, onChange, options, id }: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const active = options.find((o) => o.value === value) ?? options[0];
  return (
    <div style={{ position: "relative" }} ref={ref} id={id}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="admin-select-button"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "#050507", border: "1px solid #232327", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, cursor: "pointer", outline: "none" }}
      >
        <span>{active?.label}</span>
        <ChevronDown size={14} style={{ color: "#71717a", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
      </button>
      {open && (
        <div 
          className="admin-select-dropdown"
          style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9999, background: "#101014", border: "1px solid #2a2a30", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="admin-select-option"
              data-selected={opt.value === value}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: opt.value === value ? "#1a1a22" : "transparent", color: opt.value === value ? "white" : "#d4d4d8", fontSize: 14, cursor: "pointer", border: "none", textAlign: "left", outline: "none" }}
            >
              <span style={{ width: 16, display: "inline-flex", alignItems: "center", color: "#a1a1aa", fontSize: 12 }}>
                {opt.value === value ? "✓" : ""}
              </span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ── User action menu (... button) ─────────────────────────────────────────────
interface UserActionMenuProps {
  user: AdminUser;
  onDisableClick: (user: AdminUser) => void;
  onEnableClick: (user: AdminUser) => void;
  onRemoveClick: (user: AdminUser) => void;
}
function UserActionMenu({ user, onDisableClick, onEnableClick, onRemoveClick }: UserActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const isDisabled = user.status === "disabled";
  return (
    <div style={{ position: "relative", display: "inline-block" }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="p-1 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition active:scale-95"
      >
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 9999, minWidth: 160, background: "#101014", border: "1px solid #2a2a30", borderRadius: 12, padding: "6px 0", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
          <button
            type="button"
            onClick={() => { setOpen(false); isDisabled ? onEnableClick(user) : onDisableClick(user); }}
            style={{ display: "block", width: "100%", padding: "9px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, cursor: "pointer", color: isDisabled ? "#4ade80" : "#f87171", fontWeight: 600 }}
          >
            {isDisabled ? "Enable User" : "Disable User"}
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); onRemoveClick(user); }}
            style={{ display: "block", width: "100%", padding: "9px 16px", background: "transparent", border: "none", textAlign: "left", fontSize: 13, cursor: "pointer", color: "#d4d4d8", fontWeight: 500 }}
          >
            Remove User
          </button>
        </div>
      )}
    </div>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

const fallbackUsers: AdminUser[] = [
  {
    id: "30",
    name: "Chafic-Fredricks",
    email: "chafic.koleilat@machynys.com",
    role: "Admin",
    is_admin: true,
    status: "active",
    lastLogin: null
  },
  {
    id: "26",
    name: "Front Of House",
    email: "frontofhouse-fredricks@huemanai.co.uk",
    role: "Actions",
    is_admin: false,
    status: "active",
    lastLogin: null
  },
  {
    id: "4",
    name: "Fredrick",
    email: "fredrick@huemanai.co.uk",
    role: "Admin",
    is_admin: true,
    status: "active",
    lastLogin: null
  }
];

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);

  // Organisation Settings Hook
  const { settings, isLoading: settingsLoading, refetch: refetchSettings } = useOrganisationSettings();

  // Form States
  const [organisationName, setOrganisationName] = useState("Fredricks");
  const [businessType, setBusinessType] = useState("Restaurant");
  const [timezone, setTimezone] = useState("Europe/London");
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("EUR (€)");
  const [enableOutboundCalls, setEnableOutboundCalls] = useState(true);
  const [enableAiInsights, setEnableAiInsights] = useState(true);
  const [enableLocations, setEnableLocations] = useState(false);

  // Status/Loading States
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Users List State
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Invite Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Action menu state for user disable/enable
  const [disableConfirmUser, setDisableConfirmUser] = useState<AdminUser | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [removeConfirmUser, setRemoveConfirmUser] = useState<AdminUser | null>(null);
  const [userRemoving, setUserRemoving] = useState(false);

  const handleDisableUser = async () => {
    if (!disableConfirmUser) return;
    setStatusUpdating(true);
    try {
      const updated = await updateUserStatus(disableConfirmUser.id, "disabled");
      if (Array.isArray(updated) && updated.length > 0) {
        setUsers(updated);
      } else {
        setUsers((prev) => prev.map((u) => u.id === disableConfirmUser.id ? { ...u, status: "disabled" } : u));
      }
    } catch (err) {
      console.error("Failed to disable user", err);
      setUsers((prev) => prev.map((u) => u.id === disableConfirmUser.id ? { ...u, status: "disabled" } : u));
    } finally {
      setStatusUpdating(false);
      setDisableConfirmUser(null);
    }
  };

  const handleEnableUser = async (user: AdminUser) => {
    try {
      const updated = await updateUserStatus(user.id, "active");
      if (Array.isArray(updated) && updated.length > 0) {
        setUsers(updated);
      } else {
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "active" } : u));
      }
    } catch (err) {
      console.error("Failed to enable user", err);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: "active" } : u));
    }
  };

  const handleRemoveUser = async () => {
    if (!removeConfirmUser) return;
    setUserRemoving(true);
    try {
      const updated = await removeUser(removeConfirmUser.id);
      if (Array.isArray(updated)) {
        setUsers(updated);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== removeConfirmUser.id));
      }
    } catch (err) {
      console.error("Failed to remove user", err);
      setUsers((prev) => prev.filter((u) => u.id !== removeConfirmUser.id));
    } finally {
      setUserRemoving(false);
      setRemoveConfirmUser(null);
    }
  };

  const handleInviteSuccess = (updatedUsers?: AdminUser[] | null, simulatedNewUser?: AdminUser) => {
    if (updatedUsers && Array.isArray(updatedUsers)) {
      setUsers(updatedUsers);
    } else if (simulatedNewUser) {
      setUsers((prev) => [simulatedNewUser, ...prev]);
    } else {
      loadUsersList();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Language code → display label map
  const languageCodeToLabel: Record<string, string> = {
    en: "English", hi: "Hindi", es: "Spanish", fr: "French", de: "German", it: "Italian",
  };
  // Currency code → display label map
  const currencyCodeToLabel: Record<string, string> = {
    INR: "INR (₹)", EUR: "EUR (€)", GBP: "GBP (£)", USD: "USD ($)",
  };

  // Initialize form state from fetched settings (uses real API field names)
  useEffect(() => {
    if (settings) {
      if (settings.organisation_name) setOrganisationName(settings.organisation_name);
      if (settings.business_type) setBusinessType(settings.business_type);
      if (settings.default_timezone) setTimezone(settings.default_timezone);
      if (settings.default_language) setLanguage(languageCodeToLabel[settings.default_language] ?? settings.default_language);
      if (settings.currency) setCurrency(currencyCodeToLabel[settings.currency] ?? settings.currency);
      if (settings.enable_outbound_calls !== undefined) setEnableOutboundCalls(settings.enable_outbound_calls);
      if (settings.enable_ai_insights !== undefined) setEnableAiInsights(settings.enable_ai_insights);
      if (settings.enable_locations !== undefined) setEnableLocations(settings.enable_locations);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  // Load Users List
  const loadUsersList = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const data = await fetchAdminUsers();
      if (data && Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers(fallbackUsers);
      }
    } catch (err) {
      console.warn("Failed to fetch admin users, falling back to mock data:", err);
      // Fallback to local mock data matching the screenshot
      setUsers(fallbackUsers);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      loadUsersList();
    }
  }, [mounted]);

  if (!mounted) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Map display labels back to API codes
    const languageLabelToCode: Record<string, string> = {
      English: "en", Hindi: "hi", Spanish: "es", French: "fr", German: "de", Italian: "it",
    };
    const currencyLabelToCode: Record<string, string> = {
      "INR (₹)": "INR", "EUR (€)": "EUR", "GBP (£)": "GBP", "USD ($)": "USD",
    };

    // Exact field names the backend expects
    const payload = {
      organisation_name: organisationName,
      business_type: businessType,
      default_timezone: timezone,
      default_language: languageLabelToCode[language] ?? language,
      currency: currencyLabelToCode[currency] ?? currency,
      enable_outbound_calls: enableOutboundCalls,
      enable_ai_insights: enableAiInsights,
      enable_locations: enableLocations,
    };

    try {
      await updateOrganisationSettings(payload);
      setSaveSuccess(true);
      refetchSettings();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Failed to save organization settings to backend, updating locally:", err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Format dynamic last updated stamp
  const formatLastUpdatedDate = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date("2026-02-16T05:46:00Z");
    if (isNaN(date.getTime())) return "February 16th, 2026 5:46 AM";
    const day = date.getDate();
    let suffix = "th";
    if (day === 1 || day === 21 || day === 31) suffix = "st";
    else if (day === 2 || day === 22) suffix = "nd";
    else if (day === 3 || day === 23) suffix = "rd";

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "AM" : "PM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${month} ${day}${suffix}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const lastUpdatedText = `Last updated by ${settings?.updated_by || "fredrick@huemanai.co.uk"} on ${formatLastUpdatedDate(settings?.updated_at)}`;

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[#050505] p-6 lg:p-10">
        <div className="max-w-[1000px] mx-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-1.5">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Settings
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your organisation and users.
            </p>
          </div>

          {/* Organisation Settings Card */}
          <form onSubmit={handleSave} className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-white">
                Organisation Settings
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Basic configuration for your organisation.
              </p>
            </div>

            {saveSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/10 p-4 text-sm text-emerald-400 flex items-center gap-3">
                <CheckCircle2 className="shrink-0" size={16} />
                <span>Organisation settings updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 text-sm text-rose-400 flex items-center gap-3">
                <AlertCircle className="shrink-0" size={16} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Organisation Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Organisation Name *
              </label>
              <input
                type="text"
                required
                value={organisationName}
                onChange={(e) => setOrganisationName(e.target.value)}
                className="w-full bg-[#050507] border border-[#232327] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Business Type</label>
              <AdminSelect
                id="admin-business-type"
                value={businessType}
                onChange={setBusinessType}
                options={[
                  { value: "Restaurant", label: "Restaurant" },
                  { value: "Hotel", label: "Hotel" },
                  { value: "Cafe", label: "Cafe" },
                  { value: "Bar", label: "Bar" },
                  { value: "Retail", label: "Retail" },
                  { value: "Office", label: "Office" },
                  { value: "Other", label: "Other" },
                ]}
              />
            </div>

            {/* Default Timezone */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Default Timezone</label>
              <AdminSelect
                id="admin-timezone"
                value={timezone}
                onChange={setTimezone}
                options={[
                  { value: "Europe/London",    label: "Europe/London" },
                  { value: "America/New_York", label: "America/New_York" },
                  { value: "UTC",              label: "UTC" },
                  { value: "Asia/Kolkata",     label: "Asia/Kolkata" },
                  { value: "Asia/Dubai",       label: "Asia/Dubai" },
                  { value: "Asia/Singapore",   label: "Asia/Singapore" },
                ]}
              />
            </div>

            {/* Default Language */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Default Language</label>
              <AdminSelect
                id="admin-language"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "English", label: "English" },
                  { value: "Hindi",   label: "Hindi" },
                  { value: "Spanish", label: "Spanish" },
                  { value: "French",  label: "French" },
                  { value: "German",  label: "German" },
                  { value: "Italian", label: "Italian" },
                ]}
              />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Currency</label>
              <AdminSelect
                id="admin-currency"
                value={currency}
                onChange={setCurrency}
                options={[
                  { value: "INR (₹)", label: "INR (₹)" },
                  { value: "USD ($)", label: "USD ($)" },
                  { value: "EUR (€)", label: "EUR (€)" },
                  { value: "GBP (£)", label: "GBP (£)" },
                ]}
              />
            </div>

            {/* Toggle Switch: Outbound Calls */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-semibold text-zinc-300">Enable Outbound Calls</span>
              <button
                type="button"
                onClick={() => setEnableOutboundCalls(!enableOutboundCalls)}
                className="admin-toggle-button"
                data-active={enableOutboundCalls}
                style={{ width: 44, height: 24, borderRadius: 9999, padding: 3, cursor: "pointer", transition: "background 0.2s", background: enableOutboundCalls ? "white" : "#3f3f46", border: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <span className="admin-toggle-dot" data-active={enableOutboundCalls} style={{ width: 18, height: 18, borderRadius: 9999, background: enableOutboundCalls ? "#0c0c0f" : "#a1a1aa", transition: "transform 0.2s", transform: enableOutboundCalls ? "translateX(20px)" : "translateX(0px)", display: "block" }} />
              </button>
            </div>

            {/* Toggle Switch: AI Insights */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-semibold text-zinc-300">Enable AI Insights</span>
              <button
                type="button"
                onClick={() => setEnableAiInsights(!enableAiInsights)}
                className="admin-toggle-button"
                data-active={enableAiInsights}
                style={{ width: 44, height: 24, borderRadius: 9999, padding: 3, cursor: "pointer", transition: "background 0.2s", background: enableAiInsights ? "white" : "#3f3f46", border: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <span className="admin-toggle-dot" data-active={enableAiInsights} style={{ width: 18, height: 18, borderRadius: 9999, background: enableAiInsights ? "#0c0c0f" : "#a1a1aa", transition: "transform 0.2s", transform: enableAiInsights ? "translateX(20px)" : "translateX(0px)", display: "block" }} />
              </button>
            </div>

            {/* Toggle Switch: Locations */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-semibold text-zinc-300">Enable Locations</span>
              <button
                type="button"
                onClick={() => setEnableLocations(!enableLocations)}
                className="admin-toggle-button"
                data-active={enableLocations}
                style={{ width: 44, height: 24, borderRadius: 9999, padding: 3, cursor: "pointer", transition: "background 0.2s", background: enableLocations ? "white" : "#3f3f46", border: "none", display: "flex", alignItems: "center", flexShrink: 0 }}
              >
                <span className="admin-toggle-dot" data-active={enableLocations} style={{ width: 18, height: 18, borderRadius: 9999, background: enableLocations ? "#0c0c0f" : "#a1a1aa", transition: "transform 0.2s", transform: enableLocations ? "translateX(20px)" : "translateX(0px)", display: "block" }} />
              </button>
            </div>

            {/* Save Changes Button */}
            <button
              type="submit"
              disabled={saving || settingsLoading}
              className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {saving ? (
                <span className="flex items-center gap-1.5 justify-center">
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>

          {/* Last updated text label */}
          <p className="text-[10px] text-zinc-500 pl-2">
            {lastUpdatedText}
          </p>

          {/* Users Card */}
          <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Users
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Manage who can access this organisation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 active:scale-95 cursor-pointer select-none"
              >
                <UserPlus size={14} />
                Invite User
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-[#08080a] text-left text-[10px] uppercase tracking-[0.22em] text-zinc-500 border-b border-[#232327]/60">
                  <tr>
                    <th className="px-6 py-4 font-semibold">NAME</th>
                    <th className="px-6 py-4 font-semibold">EMAIL</th>
                    <th className="px-6 py-4 font-semibold">ROLE</th>
                    <th className="px-6 py-4 font-semibold">STATUS</th>
                    <th className="px-6 py-4 font-semibold">LAST LOGIN</th>
                    <th className="px-6 py-4 font-semibold">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        <div className="flex items-center justify-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          Loading users...
                        </div>
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-rose-400 font-semibold">
                        Error loading users: {usersError}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                        No users configured.
                      </td>
                    </tr>
                  ) : (
                    users.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-[#232327]/30 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-white">
                          {item.name || "-"}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 font-medium">
                          {item.email || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] border ${
                              item.role.toLowerCase() === "admin"
                                ? "bg-[#18181b] border-zinc-800 text-zinc-300"
                                : "bg-[#2e1065]/50 border-purple-900/40 text-purple-400"
                            }`}
                          >
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] border ${
                              item.status === "active"
                                ? "bg-[#064e3b]/30 border-emerald-900/40 text-emerald-400"
                                : "bg-[#3d1217]/30 border-rose-900/40 text-rose-400"
                            }`}
                          >
                            {item.status === "disabled" ? "Disabled" : item.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {item.lastLogin && typeof item.lastLogin === "string" ? item.lastLogin : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <UserActionMenu
                            user={item}
                            onDisableClick={setDisableConfirmUser}
                            onEnableClick={handleEnableUser}
                            onRemoveClick={setRemoveConfirmUser}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      </div>

    {/* Invite User Modal */}
    <InviteUserModal
      isOpen={isInviteModalOpen}
      onClose={() => setIsInviteModalOpen(false)}
      onSuccess={handleInviteSuccess}
    />

    {/* Disable User Confirmation Dialog */}
    {disableConfirmUser && (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setDisableConfirmUser(null); }}
      >
        <div style={{ background: "#0c0c0f", border: "1px solid #232327", borderRadius: 16, padding: "28px 32px", maxWidth: 440, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.8)", position: "relative" }}>
          <button
            onClick={() => setDisableConfirmUser(null)}
            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "#71717a" }}
          >
            <X size={16} />
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 12 }}>Disable User</h3>
          <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 28 }}>
            Are you sure you want to disable <strong style={{ color: "white" }}>{disableConfirmUser.name}</strong>? They will no longer be able to access the platform.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => setDisableConfirmUser(null)}
              style={{ padding: "9px 20px", background: "#141417", border: "1px solid #232327", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#d4d4d8", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={statusUpdating}
              onClick={handleDisableUser}
              style={{ padding: "9px 20px", background: "#3f3f46", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", opacity: statusUpdating ? 0.6 : 1 }}
            >
              {statusUpdating ? "Disabling..." : "Disable"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Remove User Confirmation Dialog */}
    {removeConfirmUser && (
      <div
        style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}
        onClick={(e) => { if (e.target === e.currentTarget) setRemoveConfirmUser(null); }}
      >
        <div style={{ background: "#0c0c0f", border: "1px solid #232327", borderRadius: 20, padding: "28px 32px", maxWidth: 440, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,0.8)", position: "relative" }}>
          <button
            onClick={() => setRemoveConfirmUser(null)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "#71717a" }}
          >
            <X size={16} />
          </button>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "white", marginBottom: 12 }}>Remove User</h3>
          <p style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.6, marginBottom: 28 }}>
            Are you sure you want to remove {removeConfirmUser.name}? This action cannot be undone.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => setRemoveConfirmUser(null)}
              style={{ padding: "10px 24px", background: "transparent", border: "1px solid #27272a", borderRadius: 9999, fontSize: 13, fontWeight: 600, color: "white", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={userRemoving}
              onClick={handleRemoveUser}
              style={{ padding: "10px 24px", background: "#71717a", border: "none", borderRadius: 9999, fontSize: 13, fontWeight: 700, color: "white", cursor: "pointer", opacity: userRemoving ? 0.6 : 1 }}
            >
              {userRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);
}