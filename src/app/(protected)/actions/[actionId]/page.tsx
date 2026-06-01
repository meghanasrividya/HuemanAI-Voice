"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  FileText,
  MessageSquare,
  Mail,
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react";
import { fetchActionById, updateAction, decryptPhoneNumber, fetchAdminSettings } from "@/lib/api/actions";
import { TimezoneDate } from "@/lib/timezone/TimezoneDate";

interface EmailNotification {
  id?: string | number;
  request_type?: string;
  name?: string;
  date?: string;
  party_size?: string | number;
  serviceType?: string;
  notes?: string;
}

interface LinkedCall {
  call_id: string | number;
  created_at?: string;
  call_duration_ms?: string | number;
  call_summary?: string;
}

interface Action {
  id: string | number;
  created_at?: string;
  due_at?: string;
  is_overdue?: boolean;
  linked_calls?: LinkedCall[];
  follow_up_count?: number;
  guest_name?: string;
  phone_number?: string;
  notes?: string;
  comments?: string;
  status?: string;
  request_type?: string;
  request_type_label?: string;
  priority?: string;
  email_notification?: EmailNotification;
}

type ActionDetailPageProps = {
  params: Promise<{
    actionId: string;
  }>;
};

function computeIsOverdue(data: Pick<Action, "is_overdue" | "due_at">): boolean {
  return Boolean(data.is_overdue || (data.due_at && new Date(data.due_at).getTime() < Date.now()));
}

export default function ActionDetailPage({ params }: ActionDetailPageProps) {
  const { actionId } = use(params);
  const router = useRouter();

  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);

  // Comments Editing
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [actionData] = await Promise.all([
          fetchActionById(actionId),
          fetchAdminSettings().catch(() => null),
        ]);
        if (actionData) {
          setAction(actionData);
          setCommentText(actionData.comments || "");
          setIsOverdue(computeIsOverdue(actionData));
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load action details";
        console.error("Failed to load action details", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actionId]);

  const handleDecryptPhone = async () => {
    if (!action) return;
    if (revealedPhone) {
      setRevealedPhone(null);
    } else {
      try {
        const res = await decryptPhoneNumber(action.id.toString());
        if (res && res.decryptedNumber) {
          setRevealedPhone(res.decryptedNumber);
        }
      } catch (err) {
        console.error("Failed to decrypt phone number", err);
      }
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!action) return;
    try {
      await updateAction(action.id.toString(), {
        status: newStatus,
      });
      const data = await fetchActionById(action.id.toString());
      setAction(data);
      if (data) {
        setIsOverdue(computeIsOverdue(data));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSaveComment = async () => {
    if (!action || commentLoading) return;
    setCommentLoading(true);
    try {
      await updateAction(action.id.toString(), {
        comments: commentText,
      });
      setAction((prev) => prev ? { ...prev, comments: commentText } : prev);
      setIsEditingComment(false);
    } catch (err) {
      console.error("Failed to update comment", err);
      alert("Failed to save comment");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <div className="flex items-center gap-2">
          <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          Loading guest profile...
        </div>
      </div>
    );
  }

  if (error || !action) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#050505] text-white gap-4">
        <p className="text-rose-400 font-semibold">Error: {error || "No guest action found."}</p>
        <button
          onClick={() => router.push("/actions")}
          className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
        >
          Back to Action Center
        </button>
      </div>
    );
  }

  // Format created date
  let createdFormatted = "-";
  if (action.created_at) {
    try {
      const cleanCreated = action.created_at.replace(" ", "T") + "Z";
      createdFormatted = new TimezoneDate(cleanCreated).format("dd MMM yyyy");
    } catch {
      createdFormatted = action.created_at;
    }
  }

  // Format due time
  let dueTimeFormatted = "-";
  if (action.due_at) {
    try {
      dueTimeFormatted = new TimezoneDate(action.due_at).format("HH:mm");
    } catch {
      dueTimeFormatted = new Date(action.due_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    }
  }

  // Repeats badge
  const repeatsCount = (action.linked_calls && action.linked_calls.length > 1)
    ? action.linked_calls.length
    : (action.follow_up_count || 0);

  const isRepeatCaller = repeatsCount > 1;

  // Status mapping
  const normalizedStatus = action.status || "open";

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
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Navbar */}
        <header className="h-[60px] shrink-0 border-b border-[#1e1e24] bg-[#0c0c0e] px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/actions")}
              aria-label="Back to Actions"
              className="text-zinc-400 hover:text-white transition flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-900"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-zinc-500 font-semibold text-xs ml-2 select-none">Actions</span>
            <span className="text-zinc-600 select-none text-xs mx-1">/</span>
            <span className="text-zinc-300 font-semibold text-xs select-none truncate max-w-[150px]">
              {action.guest_name || "Guest Details"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isOverdue && (
              <span className="rounded-full border border-rose-500/35 bg-[#1b0b0e]/35 px-3.5 py-0.5 text-xs font-semibold text-rose-400">
                Overdue
              </span>
            )}
            <span
              className={`rounded-full border px-3.5 py-0.5 text-xs font-semibold capitalize ${
                normalizedStatus === "open"
                  ? "text-emerald-400 border-emerald-500/25 bg-emerald-500/5"
                  : normalizedStatus === "in progress" || normalizedStatus === "in_progress"
                  ? "text-blue-400 border-blue-500/25 bg-blue-500/5"
                  : normalizedStatus === "waiting on guest" || normalizedStatus === "waiting_on_guest"
                  ? "text-orange-400 border-orange-500/25 bg-orange-500/5"
                  : "text-zinc-400 border-zinc-500/25 bg-zinc-500/5"
              }`}
            >
              {normalizedStatus === "in_progress" ? "In Progress" : normalizedStatus === "waiting_on_guest" ? "Waiting on Guest" : normalizedStatus}
            </span>
          </div>
        </header>

        {/* Details Wrapper Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#050505]">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Header Summary Card */}
            <div className={`rounded-3xl border bg-[#0c0c0f] p-6 shadow-sm relative ${isRepeatCaller ? "border-orange-500/50" : "border-[#232327]"}`}>
              {isRepeatCaller && (
                <div className="mb-4 rounded-xl border border-orange-500/20 bg-[#2d1a0c]/40 px-4 py-2 flex items-center gap-2 text-xs font-semibold text-orange-400">
                  <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                  <span>REPEAT CALLER — {repeatsCount} CONTACTS FOR THIS ISSUE</span>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">{action.guest_name || "-"}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center rounded-full bg-white/5 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                      {issueTypeLabel}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${
                        action.priority?.toLowerCase() === "high"
                          ? "border-rose-500/30 bg-[#3d1217] text-rose-300"
                          : action.priority?.toLowerCase() === "medium"
                          ? "border-orange-500/30 bg-[#2d1a0c] text-orange-300"
                          : "border-zinc-800 bg-[#111214] text-zinc-300"
                      }`}
                    >
                      {action.priority || "Low"}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${isOverdue ? "text-rose-500" : "text-zinc-500"}`}>
                    Due At
                  </p>
                  <div className={`mt-1.5 flex items-center justify-end gap-1.5 text-base font-bold ${isOverdue ? "text-rose-500" : "text-white"}`}>
                    <Clock className={`h-4 w-4 ${isOverdue ? "text-rose-500" : "text-zinc-400"}`} />
                    <span>{dueTimeFormatted}</span>
                  </div>
                </div>
              </div>

              {/* 4 columns layout details */}
              <div className="mt-8 border-t border-[#1d1d22] pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Guest</p>
                  <p className="mt-1.5 text-sm font-bold text-white truncate">{action.guest_name || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Phone</p>
                  <div className="mt-1.5 flex items-center gap-2 text-sm font-bold text-zinc-300">
                    <span>{revealedPhone || action.phone_number || "-"}</span>
                    <button
                      onClick={handleDecryptPhone}
                      className="text-zinc-500 hover:text-white transition focus:outline-none"
                    >
                      {revealedPhone ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Repeats</p>
                  <div className="mt-1.5">
                    {repeatsCount > 1 ? (
                      <span className="inline-flex items-center rounded-full bg-orange-500/10 border border-orange-500/25 px-3 py-0.5 text-xs font-semibold text-orange-400">
                        {repeatsCount} contacts
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-400">
                        First contact
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Date</p>
                  <p className="mt-1.5 text-sm font-bold text-white">{createdFormatted}</p>
                </div>
              </div>
            </div>

            {/* Grid for Columns below */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (details, comments, email data) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Action Details Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-4 border-b border-[#1d1d22]">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">Action Details</h2>
                  </div>
                  <div className="mt-4 text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                    {action.notes || "No detailed notes provided for this action."}
                  </div>
                </div>

                {/* Comments Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-[#1d1d22]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-zinc-400" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">Comments</h2>
                    </div>
                    {!isEditingComment && (
                      <button
                        onClick={() => setIsEditingComment(true)}
                        className="rounded-full border border-zinc-800 bg-[#0c0c0e] px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/50 hover:text-white transition"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    {isEditingComment ? (
                      <div className="space-y-3">
                        <textarea
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Type your follow-up notes or comments here..."
                          rows={3}
                          className="w-full rounded-xl border border-[#2a2a30] bg-[#141416] px-4 py-2.5 text-sm text-white outline-none transition focus:border-white/20 resize-none"
                        />
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => {
                              setCommentText(action.comments || "");
                              setIsEditingComment(false);
                            }}
                            className="rounded-full border border-zinc-800 bg-[#0c0c0e] px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-900/50 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveComment}
                            disabled={commentLoading}
                            className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50"
                          >
                            {commentLoading ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
                        {action.comments || "No comments yet."}
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Notification Data */}
                {action.email_notification && (
                  <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                    <div className="flex items-center justify-between pb-4 border-b border-[#1d1d22]">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-400" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">Email Notification Data</h2>
                      </div>
                      <button className="rounded-full border border-zinc-800 bg-[#0c0c0e] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 cursor-default select-none">
                        Metadata
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">ID</p>
                        <p className="mt-1 text-sm font-bold text-white">{action.email_notification.id || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Request Type</p>
                        <p className="mt-1 text-sm font-bold text-zinc-300">{action.email_notification.request_type || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Name</p>
                        <p className="mt-1 text-sm font-bold text-white">{action.email_notification.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Date</p>
                        <p className="mt-1 text-sm font-bold text-white">{action.email_notification.date || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Party Size</p>
                        <p className="mt-1 text-sm font-bold text-white">{action.email_notification.party_size || "-"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Service Type</p>
                        <p className="mt-1 text-sm font-bold text-white">{action.email_notification.serviceType || "-"}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-[#1d1d22]/50">
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">Notes</p>
                      <p className="mt-1.5 text-sm text-zinc-300 font-semibold leading-relaxed">
                        {action.email_notification.notes || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Manage Status, Linked History) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Manage Status Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 pb-3.5 border-b border-[#1d1d22]">
                    Manage Status
                  </h2>

                  <div className="mt-4 space-y-2">
                    {[
                      { key: "open", label: "Open", color: "bg-emerald-400" },
                      { key: "in_progress", label: "In Progress", color: "bg-blue-400" },
                      { key: "waiting_on_guest", label: "Waiting on Guest", color: "bg-amber-400" },
                      { key: "resolved", label: "Resolved", color: "bg-zinc-400" },
                    ].map((opt) => {
                      const isSelected = normalizedStatus === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleStatusChange(opt.key)}
                          className={`w-full flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-wide transition-all text-left ${
                            isSelected
                              ? "bg-[#1d1d22] border border-white/5 text-white"
                              : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                          }`}
                        >
                          <span className={`h-2 w-2 rounded-full shrink-0 ${opt.color}`} />
                          <span className="flex-1">{opt.label}</span>
                          {isSelected && <span className="text-[10px] font-bold uppercase text-emerald-400">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Linked History Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 pb-3.5 border-b border-[#1d1d22]">
                    Linked History
                  </h2>

                  <div className="mt-4 space-y-4">
                    {action.linked_calls && action.linked_calls.length > 0 ? (
                      action.linked_calls.map((call: LinkedCall) => {
                        let callDateStr = "-";
                        if (call.created_at) {
                          try {
                            const cleanDate = call.created_at.replace(" ", "T") + "Z";
                            callDateStr = new TimezoneDate(cleanDate).format("dd MMM yyyy");
                          } catch {
                            callDateStr = call.created_at;
                          }
                        }

                        let durationFormatted = "0M";
                        if (call.call_duration_ms) {
                          const ms = parseInt(String(call.call_duration_ms), 10);
                          if (!isNaN(ms)) {
                            const minutes = Math.floor(ms / 60000);
                            durationFormatted = `${minutes}M`;
                          }
                        }

                        return (
                          <div
                            key={call.call_id}
                            className="rounded-2xl border border-[#29292f] bg-[#111115]/50 p-4 space-y-2.5 transition hover:border-zinc-700"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">Call #{call.call_id}</span>
                              <Link
                                href={`/calls/${call.call_id}`}
                                className="text-zinc-500 hover:text-white transition"
                              >
                                <ExternalLink size={13} />
                              </Link>
                            </div>
                            <p className="text-xs italic text-zinc-400 leading-relaxed">
                              &ldquo;{call.call_summary || "No call summary available."}&rdquo;
                            </p>
                            <p className="text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                              {callDateStr} • {durationFormatted} duration
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No linked calls found.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}