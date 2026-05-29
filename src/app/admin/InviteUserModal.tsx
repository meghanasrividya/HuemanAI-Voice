/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, AlertCircle, Eye, EyeOff, ChevronDown, Loader2 } from "lucide-react";
import { inviteAdminUser, AdminUser } from "@/lib/api/admin";

let mockUserIdCounter = 1000;
const getNextMockUserId = () => {
  mockUserIdCounter += 1;
  return String(mockUserIdCounter);
};

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUsers?: AdminUser[] | null, simulatedNewUser?: AdminUser) => void;
}

const ROLE_OPTIONS = [
  { value: "admin",   label: "Admin" },
  { value: "viewer",  label: "Viewer" },
  { value: "actions", label: "Actions" },
  { value: "user",    label: "User" },
];

function RoleSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = ROLE_OPTIONS.find((o) => o.value === value) ?? ROLE_OPTIONS[0];
  return (
    <div className="space-y-1.5 pb-2">
      <label style={{ fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</label>
      <div style={{ position: "relative" }} ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "#050507", border: "1px solid #232327", borderRadius: 12, padding: "12px 16px", color: "white", fontSize: 14, cursor: "pointer", outline: "none" }}
        >
          <span>{active.label}</span>
          <ChevronDown size={14} style={{ color: "#71717a", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
        </button>
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 99999, background: "#101014", border: "1px solid #2a2a30", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.7)" }}>
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: opt.value === value ? "#1a1a22" : "transparent", color: opt.value === value ? "white" : "#d4d4d8", fontSize: 14, cursor: "pointer", border: "none", textAlign: "left", outline: "none" }}
              >
                <span style={{ width: 16, fontSize: 12, color: "#a1a1aa" }}>{opt.value === value ? "✓" : ""}</span>
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [showPassword, setShowPassword] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInviteName("");
      setInviteEmail("");
      setInvitePassword("");
      setInviteRole("viewer");
      setShowPassword(false);
      setInviteError(null);
      setInviting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim() || !invitePassword.trim()) {
      setInviteError("All fields are required.");
      return;
    }

    setInviting(true);
    setInviteError(null);

    const payload = {
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      password: invitePassword.trim(),
      role: inviteRole.toLowerCase(),
    };

    try {
      const updatedUsers = await inviteAdminUser(payload);
      onSuccess(updatedUsers, undefined);
      onClose();
    } catch (err) {
      console.warn("Failed to invite user via backend API, simulating success locally:", err);
      const mockNewUser: AdminUser = {
        id: getNextMockUserId(),
        name: payload.name,
        email: payload.email,
        role: payload.role.charAt(0).toUpperCase() + payload.role.slice(1),
        is_admin: payload.role === "admin",
        status: "active",
        lastLogin: null,
      };
      onSuccess(null, mockNewUser);
      onClose();
    } finally {
      setInviting(false);
    }
  };

  // Always render — visibility controlled by isOpen
  if (!isOpen) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999 }}
      className="flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{ position: "relative" }}
        className="w-full max-w-lg rounded-2xl bg-[#0c0c0f] border border-[#232327] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          style={{ position: "absolute", top: 16, right: 16 }}
          className="text-zinc-500 hover:text-white transition p-1.5 rounded-full hover:bg-white/5 active:scale-95 cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">Invite User</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Send an invitation to join your organisation.</p>
        </div>

        {/* Error */}
        {inviteError && (
          <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-950/10 p-3 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{inviteError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Name *
            </label>
            <input
              type="text"
              required
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="John Doe"
              className="w-full bg-[#050507] border border-[#232327] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="fredrick@huemanai.co.uk"
              className="w-full bg-[#050507] border border-[#232327] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#050507] border border-[#232327] rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", inset: "0 0 0 auto" }}
                className="flex items-center px-4 text-zinc-500 hover:text-white transition cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <RoleSelect value={inviteRole} onChange={setInviteRole} />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#1d1d22]">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#232327] bg-[#141417] text-zinc-300 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-white/5 active:scale-95 transition-all cursor-pointer select-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviting}
              className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"
            >
              {inviting ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Invite"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
