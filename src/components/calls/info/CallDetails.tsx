"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Phone, Clock } from "lucide-react";
import RecordingCard from "./RecordingCard";
import TranscriptCard from "./TranscriptCard";
import AiInsightsCard from "./AiInsightsCard";
import ReservationDetailsCard from "./ReservationDetailsCard";
import { apiClient } from "@/lib/apiClient";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";

function isNameValid(name: string | undefined | null): boolean {
  if (!name) return false;
  const lower = name.trim().toLowerCase();
  return (
    lower !== "n/a" &&
    lower !== "not provided" &&
    lower !== "not_provided" &&
    lower !== "guest_name" &&
    lower !== "guest name" &&
    lower !== "unknown" &&
    lower !== "undefined" &&
    lower !== "null" &&
    lower !== ""
  );
}

interface Props {
  callId: string;
}

interface CallDetailData {
  id: string;
  phone: string;
  maskedPhone: string;
  direction: string;
  durationStr: string;
  durationSeconds: number;
  status: string;
  category: string;
  subCategory: string;
  bookingCategory: string;
  guestName: string;
  requestType: string;
  summary: string;
  issueSummary: string;
  description: string;
  sentiment: string;
  insufficientData: boolean;
  specialNotes: string;
  allergies: string;
  linkedActions?: {
    id: number;
    guestName: string;
    requestType: string;
    priority: string;
    status: string;
    createdAt: string;
    notes?: string;
  }[];
  topQueries: string[];
  keyInsights: { label: string; value: string }[];
  // Reservation detail fields
  partySize: string;
  bookingDate: string;
  bookingTime: string;
  depositPaid: string;
  confirmationStatus: string;
  // Dynamic action details fields
  purpose?: string;
  actionId?: string;
  callSuccessful?: string;
  name?: string;
  location?: string;
  createdAt?: string;
  time?: string;
  quantity?: string;
  type?: string;
  transcript: {
    speaker: "Bot" | "Caller";
    time: string;
    text: string;
  }[];
  recordingUrl?: string;
}

export default function CallDetails({ callId }: Props) {
  const router = useRouter();
  const { settings } = useOrganisationSettings();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CallDetailData | null>(null);
  const fetchedRef = useRef<string | null>(null);
  // Store URL params so they're available during render for header display
  const urlCallerRef = useRef<string>("");
  const urlPhoneRef = useRef<string>("");

  // Read URL params once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      urlCallerRef.current = params.get("caller") || "";
      urlPhoneRef.current = params.get("phone") || "";
    }
  }, []);

  useEffect(() => {
    let urlCaller = "";
    let urlPhone = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      urlCaller = params.get("caller") || "";
      urlPhone = params.get("phone") || "";
      urlCallerRef.current = urlCaller;
      urlPhoneRef.current = urlPhone;
    }

    if (fetchedRef.current === callId) return;
    fetchedRef.current = callId;

    const fetchCallDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const agentId = settings?.insight_agent_ids?.reservation || "agent_dc9662de627352087b223027f2";

        let apiData: any = null;
        let actionData: any = null;
        try {
          // Fetch both call details and actions/reservation details in parallel
          const [callRes, actionRes] = await Promise.allSettled([
            apiClient.get(`/calls/${callId}`),
            apiClient.get(`/actions/by-call/${callId}`)
          ]);

          // 1. Process call details
          if (callRes.status === "fulfilled" && callRes.value && callRes.value.data) {
            const raw = callRes.value.data;

            // Format dynamic durationStr
            let durationSeconds = 0;
            let durationStr = "0:00";
            const rawDurationMs = raw.call_duration_ms || raw.duration_ms;
            const rawDurationVal = raw.duration !== undefined && raw.duration !== null ? raw.duration : raw.duration_seconds;
            if (rawDurationMs !== undefined && rawDurationMs !== null) {
              const parsedMs = Number(rawDurationMs);
              if (!isNaN(parsedMs)) {
                durationSeconds = Math.round(parsedMs / 1000);
                const mins = Math.floor(durationSeconds / 60);
                const secs = durationSeconds % 60;
                durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
              }
            } else if (rawDurationVal !== undefined && rawDurationVal !== null) {
              const parsedDuration = Number(rawDurationVal);
              if (!isNaN(parsedDuration)) {
                durationSeconds = parsedDuration;
                const mins = Math.floor(parsedDuration / 60);
                const secs = parsedDuration % 60;
                durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
              } else {
                durationStr = String(rawDurationVal);
              }
            }

            // Normalise phone masking
            const rawPhone = raw.display_mobile_number || raw.phone || raw.caller_number || raw.phone_number || raw.number || "";
            const cleaned = rawPhone.replace(/\s+/g, "");
            const last4 = cleaned.slice(-4) || "0000";
            const maskedPhone = rawPhone.includes("*") ? rawPhone : `******${last4}`;

            // Extract the nested analysis object (where most insight data lives)
            const analysis = raw.analysis || {};

            // Normalize sentiment — prefer analysis.user_sentiment
            let sentimentVal = "Neutral";
            const rawSentiment = analysis.user_sentiment || raw.sentiment;
            if (rawSentiment !== undefined && rawSentiment !== null) {
              if (typeof rawSentiment === "number") {
                if (rawSentiment > 0.5) sentimentVal = "Positive";
                else if (rawSentiment < 0.5) sentimentVal = "Negative";
                else sentimentVal = "Neutral";
              } else {
                const strSent = String(rawSentiment).trim();
                sentimentVal = strSent.charAt(0).toUpperCase() + strSent.slice(1).toLowerCase();
              }
            }

            // Build key insights from structured analysis fields
            const builtKeyInsights: { label: string; value: string }[] = [];
            const reservationType = analysis.reservation_type || analysis.top_ask_class || raw.sub_category || raw.subCategory || raw.sub_type;
            const bookingCategoryVal = analysis.max_booking_category || analysis.booking_category || raw.booking_category || raw.bookingCategory;
            if (reservationType && reservationType !== "N/A") builtKeyInsights.push({ label: "Reservation Type", value: reservationType });
            if (bookingCategoryVal && bookingCategoryVal !== "N/A") builtKeyInsights.push({ label: "Booking Category", value: bookingCategoryVal });

            // Top queries from analysis
            const rawTopQueries = analysis.top_queries || raw.top_queries;
            const topQueriesVal: string[] = Array.isArray(rawTopQueries) ? rawTopQueries : (rawTopQueries ? [rawTopQueries] : []);

            // Format booking date — strip time component if present (e.g. "2026-05-31 00:00:00" → "31/05/2026")
            const rawBookingDate = analysis.booking_date || raw.booking_date || raw.reservation_date || "";
            let formattedBookingDate = rawBookingDate;
            if (rawBookingDate) {
              const d = new Date(rawBookingDate);
              if (!isNaN(d.getTime())) {
                formattedBookingDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
              }
            }

            // Parse transcript
            const rawTranscript = raw.transcripts || raw.transcript || raw.messages || raw.turns || raw.dialogue || [];
            let minDateMs = Number.MAX_SAFE_INTEGER;
            if (Array.isArray(rawTranscript) && rawTranscript.length > 0) {
              rawTranscript.forEach((t: any) => {
                if (t.created_at) {
                  // Ensure cross-browser safe parsing by adding T and Z
                  const safeDateStr = t.created_at.replace(" ", "T") + "Z";
                  const ms = new Date(safeDateStr).getTime();
                  if (!isNaN(ms) && ms < minDateMs) {
                    minDateMs = ms;
                  }
                }
              });
            }
            if (minDateMs === Number.MAX_SAFE_INTEGER) minDateMs = 0;

            const formattedTranscript = Array.isArray(rawTranscript) && rawTranscript.length > 0
              ? rawTranscript.map((t: any, index: number) => {
                let timeStr = "00:00";
                if (t.time || t.timestamp || t.start_time) {
                  timeStr = t.time || t.timestamp || t.start_time;
                } else {
                  let diffSec = 0;
                  if (t.created_at && minDateMs > 0) {
                    const safeDateStr = t.created_at.replace(" ", "T") + "Z";
                    const currentMs = new Date(safeDateStr).getTime();
                    if (!isNaN(currentMs)) {
                      diffSec = Math.floor(Math.abs(currentMs - minDateMs) / 1000);
                    }
                  }
                  if (diffSec === 0 && index > 0) {
                    diffSec = index * 3;
                  }
                  const mins = Math.floor(diffSec / 60);
                  const secs = diffSec % 60;
                  timeStr = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
                }

                return {
                  speaker: t.role === "agent" || t.role === "assistant" || t.speaker === "bot" || t.speaker === "Bot" || String(t.speaker || "").toLowerCase().includes("bot") ? ("Bot" as const) : ("Caller" as const),
                  time: timeStr,
                  text: t.transcript || t.text || t.message || t.content || ""
                };
              })
              : [];

            // Normalize direction and status
            const directionStr = raw.call_direction || raw.direction || "Inbound";
            const directionNormal = directionStr.charAt(0).toUpperCase() + directionStr.slice(1).toLowerCase();

            const statusStr = raw.call_status || raw.status || "ended";
            const statusNormal = statusStr.charAt(0).toUpperCase() + statusStr.slice(1).toLowerCase();

            const recordingUrl = raw.recording_url || raw.recording_multi_channel_url || raw.recordingUrl || "";

            // Format Created At cleanly
            let formattedCreatedAt = raw.created_at || analysis.created_at || "";
            if (formattedCreatedAt) {
              const d = new Date(formattedCreatedAt.replace(" ", "T") + "Z");
              if (!isNaN(d.getTime())) {
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                let hours = d.getHours();
                const minutes = String(d.getMinutes()).padStart(2, "0");
                const seconds = String(d.getSeconds()).padStart(2, "0");
                const ampm = hours >= 12 ? "pm" : "am";
                hours = hours % 12;
                hours = hours ? hours : 12;
                const hoursStr = String(hours).padStart(2, "0");
                formattedCreatedAt = `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
              }
            }

            const rawLinkedActions = raw.linked_actions || [];
            const mappedLinkedActions = Array.isArray(rawLinkedActions)
              ? rawLinkedActions.map((act: any) => {
                let formattedActCreatedAt = "";
                if (act.created_at) {
                  const d = new Date(act.created_at.replace(" ", "T") + "Z");
                  if (!isNaN(d.getTime())) {
                    const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                    formattedActCreatedAt = `CREATED ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                  }
                }

                return {
                  id: act.id,
                  guestName: act.guest_name || "",
                  requestType: act.request_type || "",
                  priority: act.priority || "",
                  status: act.status || "",
                  createdAt: formattedActCreatedAt,
                  notes: act.notes || "",
                };
              })
              : [];

            apiData = {
              id: String(raw.id || raw.call_id || callId),
              phone: rawPhone || maskedPhone,
              maskedPhone: maskedPhone,
              direction: directionNormal,
              durationStr: durationStr,
              durationSeconds: durationSeconds,
              status: statusNormal,
              category: analysis.top_ask_class || raw.category || "N/A",
              subCategory: analysis.reservation_type || raw.sub_category || raw.subCategory || raw.sub_type || "N/A",
              bookingCategory: analysis.max_booking_category || raw.booking_category || raw.bookingCategory || "N/A",
              guestName: analysis.guest_name || analysis.name || raw.guest_name || raw.guest || raw.name || raw.guestName || raw.caller_name || raw.caller || raw.customer_name || raw.customer || "N/A",
              requestType: analysis.request_type || raw.request_type || raw.requestType || "N/A",
              summary: analysis.call_summary || raw.summary || raw.ai_summary || raw.insight_summary || "The user called and the conversation was very brief.",
              issueSummary: analysis.issue_summary || raw.issue_summary || raw.issueSummary || raw.problem || "",
              description: analysis.description || raw.description || raw.call_description || "N/A",
              sentiment: sentimentVal,
              insufficientData: !(analysis.call_successful ?? true) || (!analysis.call_summary && !raw.summary),
              specialNotes: analysis.notes || analysis.special_requirements || raw.special_notes || raw.notes || raw.special_requests || "",
              allergies: analysis.allergies || raw.allergies || "",
              linkedActions: mappedLinkedActions,
              topQueries: topQueriesVal,
              keyInsights: builtKeyInsights,
              partySize: analysis.party_size ? String(analysis.party_size) : (raw.party_size ? String(raw.party_size) : ""),
              bookingDate: formattedBookingDate,
              bookingTime: analysis.booking_time || raw.booking_time || raw.reservation_time || "",
              depositPaid: analysis.deposit_paid !== undefined
                ? (analysis.deposit_paid ? "Yes" : "No")
                : (raw.deposit_paid !== undefined ? (raw.deposit_paid ? "Yes" : "No") : ""),
              confirmationStatus: analysis.confirmation_status || raw.confirmation_status || raw.status_label || "",
              callSuccessful: analysis.call_successful !== undefined
                ? (analysis.call_successful ? "Yes" : "No")
                : (raw.call_successful !== undefined ? (raw.call_successful ? "Yes" : "No") : ""),
              purpose: raw.purpose || analysis.purpose || "",
              actionId: String(analysis.id || raw.id || ""),
              location: raw.location || analysis.location || "",
              createdAt: formattedCreatedAt,
              time: raw.time || analysis.time || "",
              quantity: raw.quantity || analysis.quantity || "",
              type: raw.type || analysis.type || "",
              transcript: formattedTranscript,
              recordingUrl: recordingUrl
            };
          }

          // 2. Process actions/reservation details
          if (actionRes.status === "fulfilled" && actionRes.value && actionRes.value.data) {
            const rawAction = Array.isArray(actionRes.value.data)
              ? actionRes.value.data[0]
              : actionRes.value.data;

            if (rawAction && typeof rawAction === "object") {
              let actionCreatedAt = rawAction.created_at || null;
              if (actionCreatedAt) {
                const d = new Date(actionCreatedAt.replace(" ", "T") + "Z");
                if (!isNaN(d.getTime())) {
                  const day = String(d.getDate()).padStart(2, "0");
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const year = d.getFullYear();
                  let hours = d.getHours();
                  const minutes = String(d.getMinutes()).padStart(2, "0");
                  const seconds = String(d.getSeconds()).padStart(2, "0");
                  const ampm = hours >= 12 ? "pm" : "am";
                  hours = hours % 12;
                  hours = hours ? hours : 12;
                  const hoursStr = String(hours).padStart(2, "0");
                  actionCreatedAt = `${day}/${month}/${year}, ${hoursStr}:${minutes}:${seconds} ${ampm}`;
                }
              }

              actionData = {
                guestName: rawAction.guest_name || rawAction.name || rawAction.guest || rawAction.customer_name || null,
                requestType: rawAction.request_type || rawAction.action_type || rawAction.type || null,
                issueSummary: rawAction.issue_summary || rawAction.summary || rawAction.action_summary || null,
                description: rawAction.description || rawAction.notes || rawAction.details || null,
                specialNotes: rawAction.special_notes || rawAction.notes || rawAction.special_requests || null,
                allergies: rawAction.allergies || rawAction.allergy || null,
                topQueries: Array.isArray(rawAction.top_queries) ? rawAction.top_queries : (rawAction.top_queries ? [rawAction.top_queries] : null),
                keyInsights: Array.isArray(rawAction.key_insights) ? rawAction.key_insights : null,
                bookingCategory: rawAction.booking_category || rawAction.bookingCategory || null,
                partySize: rawAction.party_size !== undefined ? String(rawAction.party_size) : null,
                bookingDate: rawAction.booking_date || rawAction.reservation_date || null,
                bookingTime: rawAction.booking_time || rawAction.reservation_time || null,
                depositPaid: rawAction.deposit_paid !== undefined ? (rawAction.deposit_paid ? "Yes" : "No") : null,
                confirmationStatus: rawAction.confirmation_status || rawAction.status_label || null,
                callSuccessful: rawAction.call_successful !== undefined
                  ? (rawAction.call_successful === true || String(rawAction.call_successful).toLowerCase() === "yes" ? "Yes" : "No")
                  : null,
                purpose: rawAction.purpose || null,
                actionId: rawAction.id || null,
                location: rawAction.location || null,
                createdAt: actionCreatedAt,
                time: rawAction.time || null,
                quantity: rawAction.quantity || null,
                type: rawAction.type || null,
              };
            }
          }

          // Merge callData with actionData if call data was fetched
          if (apiData) {
            // Prioritise a valid caller name from both sources, preventing placeholders from overwriting real names
            let finalGuestName = "N/A";
            const apiName = apiData.guestName;
            const actionName = actionData && actionData.guestName;

            if (isNameValid(apiName)) {
              finalGuestName = apiName;
            } else if (isNameValid(actionName)) {
              finalGuestName = actionName;
            } else {
              finalGuestName = apiName || actionName || "N/A";
            }

            const rawAllergies = (actionData && actionData.allergies) || apiData.allergies || "";
            const rawSpecialNotes = (actionData && actionData.specialNotes) || apiData.specialNotes || "";

            let finalAllergies = rawAllergies;
            let finalSpecialNotes = rawSpecialNotes;

            // If allergies is empty but special notes contains allergy info, split it
            if (!finalAllergies && finalSpecialNotes) {
              const notesLower = finalSpecialNotes.toLowerCase();
              if (
                notesLower === "no bell peppers" ||
                notesLower === "no bell pepper" ||
                notesLower.includes("allergy") ||
                notesLower.includes("allergies")
              ) {
                finalAllergies = finalSpecialNotes;
                finalSpecialNotes = ""; // Clear specialNotes so it only renders as Allergy
              }
            }

            apiData = {
              ...apiData,
              guestName: finalGuestName,
              requestType: (actionData && actionData.requestType) || apiData.requestType || "N/A",
              issueSummary: (actionData && actionData.issueSummary) || apiData.issueSummary || "N/A",
              description: (actionData && actionData.description) || apiData.description || "N/A",
              specialNotes: finalSpecialNotes,
              allergies: finalAllergies,
              topQueries: (actionData && actionData.topQueries && actionData.topQueries.length > 0) ? actionData.topQueries : (apiData.topQueries || []),
              keyInsights: (actionData && actionData.keyInsights && actionData.keyInsights.length > 0) ? actionData.keyInsights : (apiData.keyInsights || []),
              bookingCategory: (actionData && actionData.bookingCategory) || apiData.bookingCategory || "N/A",
              partySize: (actionData && actionData.partySize) || apiData.partySize || "",
              bookingDate: (actionData && actionData.bookingDate) || apiData.bookingDate || "",
              bookingTime: (actionData && actionData.bookingTime) || apiData.bookingTime || "",
              depositPaid: (actionData && actionData.depositPaid) || apiData.depositPaid || "",
              confirmationStatus: (actionData && actionData.confirmationStatus) || apiData.confirmationStatus || "",
              callSuccessful: (actionData && actionData.callSuccessful) || apiData.callSuccessful || "",
              purpose: (actionData && actionData.purpose) || apiData.purpose || "",
              actionId: String((actionData && actionData.actionId) || apiData.actionId || apiData.id || ""),
              location: (actionData && actionData.location) || apiData.location || "",
              createdAt: (actionData && actionData.createdAt) || apiData.createdAt || "",
              time: (actionData && actionData.time) || apiData.time || "",
              quantity: (actionData && actionData.quantity) || apiData.quantity || "",
              type: (actionData && actionData.type) || apiData.type || "",
            };
          }
        } catch (e) {
          console.warn("Live single call details GET API failed, falling back to dynamic simulated data:", e);
        }

        if (apiData) {
          setData(apiData);
        } else {
          setError("Call details not found in API.");
        }
      } catch (err: any) {
        console.error("Failed to load call details:", err);
        setError("Failed to load call details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId]);

  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const leftColContentRef = useRef<HTMLDivElement | null>(null);
  const dummyScrollRef = useRef<HTMLDivElement | null>(null);

  const [leftScrollHeight, setLeftScrollHeight] = useState(0);

  const handleLeftScroll = () => {
    const leftCol = leftColRef.current;
    const dummy = dummyScrollRef.current;
    if (!leftCol || !dummy) return;
    if (Math.abs(dummy.scrollTop - leftCol.scrollTop) > 1) {
      dummy.scrollTop = leftCol.scrollTop;
    }
  };

  const handleDummyScroll = () => {
    const leftCol = leftColRef.current;
    const dummy = dummyScrollRef.current;
    if (!leftCol || !dummy) return;
    if (Math.abs(leftCol.scrollTop - dummy.scrollTop) > 1) {
      leftCol.scrollTop = dummy.scrollTop;
    }
  };

  useEffect(() => {
    if (loading || !data) return;
    const content = leftColContentRef.current;
    if (!content) return;

    const updateHeight = () => {
      setLeftScrollHeight(content.scrollHeight);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(content);

    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
      resizeObserver.disconnect();
    };
  }, [loading, data]);

  useEffect(() => {
    if (loading) return;
    const leftCol = leftColRef.current;
    const rightCol = rightColRef.current;
    if (!leftCol || !rightCol) return;

    const handleLeftWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = leftCol;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
      const isAtTop = scrollTop === 0;

      if (e.deltaY > 0 && isAtBottom) {
        rightCol.scrollTop += e.deltaY;
      } else if (e.deltaY < 0 && isAtTop) {
        rightCol.scrollTop += e.deltaY;
      }
    };

    const handleRightWheel = (e: WheelEvent) => {
      const { scrollTop, scrollHeight, clientHeight } = rightCol;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 2;
      const isAtTop = scrollTop === 0;

      if (e.deltaY > 0 && isAtBottom) {
        leftCol.scrollTop += e.deltaY;
      } else if (e.deltaY < 0 && isAtTop) {
        leftCol.scrollTop += e.deltaY;
      }
    };

    leftCol.addEventListener("wheel", handleLeftWheel, { passive: true });
    rightCol.addEventListener("wheel", handleRightWheel, { passive: true });

    return () => {
      leftCol.removeEventListener("wheel", handleLeftWheel);
      rightCol.removeEventListener("wheel", handleRightWheel);
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center bg-[#070709]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400 opacity-60" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center gap-3 text-muted-foreground bg-[#070709]">
        <Phone className="h-10 w-10 opacity-40" />
        <p className="text-sm font-semibold">{error || "Call detail data not found."}</p>
        <button
          onClick={() => router.push("/calls")}
          className="mt-2 border border-zinc-800 bg-[#121214] rounded-full px-4 py-1.5 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
        >
          Back to Calls
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen text-white font-sans select-none bg-[#070709] overflow-hidden">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #222226;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #8e8e93;
          border-radius: 9999px;
          border: 3px solid #222226;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a1a1aa;
        }
        .custom-scrollbar::-webkit-scrollbar-button {
          display: none;
        }
        .custom-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #8e8e93 #222226;
        }
      `}</style>
      {/* Dynamic Detail Header Bar */}
      <header className="h-[52px] border-b border-[#121216] px-4 flex justify-between items-center bg-[#070709] flex-shrink-0 select-none">
        {/* Left: Breadcrumbs & Back Navigation */}
        <div className="flex items-center gap-4 select-none">
          <button
            onClick={() => router.push("/calls")}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-900/50 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2 text-sm select-none text-zinc-400 font-medium">
            <span>Calls</span>
            <span className="text-zinc-600 font-light select-none">→</span>
            <span className="text-white font-bold select-text">
              {isNameValid(data.guestName)
                ? data.guestName
                : isNameValid(urlCallerRef.current)
                  ? urlCallerRef.current
                  : data.maskedPhone}
            </span>
          </div>
        </div>

        {/* Right: Meta Details */}
        <div className="flex items-center gap-4 text-sm select-none text-zinc-400 pr-1">
          <div className="flex items-center gap-1.5 select-text">
            <Phone size={16} className="text-zinc-400" />
            <span className="lowercase font-medium">{data.direction.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1.5 select-text">
            <Clock size={15} className="text-zinc-500" />
            <span className="font-medium">{data.durationStr}</span>
          </div>
          <span className="bg-[#121214] border border-zinc-800 rounded-full px-3.5 py-1 text-xs font-bold text-white lowercase select-text">
            {data.status.toLowerCase()}
          </span>
        </div>
      </header>



      {/* ── MOBILE single-column view ── */}
      <div className="flex-1 overflow-y-auto min-h-0 lg:hidden">
        <div className="relative">
          <div className="sticky top-0 z-10 bg-[#070709] px-4 pt-4 pb-3">
            <RecordingCard
              durationSeconds={data.durationSeconds}
              durationStr={data.durationStr}
              recordingUrl={data.recordingUrl}
              transcriptCount={data.transcript.length}
            />
          </div>
          <div className="px-4 pb-4">
            <TranscriptCard transcript={data.transcript} />
          </div>
        </div>

        {/* Section B: AI Insights + Reservation (recording scrolls away here) */}
        <div className="px-4 pb-6 space-y-4 border-t border-[#1a1a1e]">
          <AiInsightsCard
            category={data.category}
            subCategory={data.subCategory}
            bookingCategory={data.bookingCategory}
            summary={data.summary}
            sentiment={data.sentiment}
            insufficientData={data.insufficientData}
            specialNotes={data.specialNotes}
            allergies={data.allergies}
            topQueries={data.topQueries}
            keyInsights={data.keyInsights}
          />
          <ReservationDetailsCard
            guestName={data.guestName}
            requestType={data.requestType}
            issueSummary={data.issueSummary}
            description={data.description}
            partySize={data.partySize}
            bookingDate={data.bookingDate}
            bookingTime={data.bookingTime}
            depositPaid={data.depositPaid}
            confirmationStatus={data.confirmationStatus}
            purpose={data.purpose}
            actionId={data.actionId}
            callId={data.id}
            callSuccessful={data.callSuccessful}
            name={data.guestName}
            location={data.location}
            createdAt={data.createdAt}
            time={data.time}
            quantity={data.quantity}
            type={data.type}
            sentiment={data.sentiment}
            hasLinkedActions={!!(data.linkedActions && data.linkedActions.length > 0)}
            category={data.category}
          />
          {data.linkedActions && data.linkedActions.length > 0 && (
            <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-4">
              <p className="text-xs text-zinc-200 font-extrabold uppercase tracking-widest">
                Linked Actions
              </p>
              <div className="space-y-3">
                {data.linkedActions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => router.push(`/actions/${act.id}`)}
                    className="border border-zinc-900 hover:border-zinc-500 bg-[#0f0f11] rounded-xl p-4.5 space-y-3 relative transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm text-white font-bold">
                          Action #{act.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${act.status.toLowerCase() === "resolved"
                          ? "bg-zinc-800/40 text-zinc-400 border-zinc-700"
                          : act.status.toLowerCase() === "open"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                          {act.status.charAt(0).toUpperCase() + act.status.slice(1)}
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0"
                      >
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                    </div>

                    <p className="text-xs text-zinc-400 italic font-medium">
                      {act.requestType}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold tracking-widest uppercase">
                        {act.createdAt}
                      </span>
                      <span className="text-zinc-600 text-xs select-none">•</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${act.priority.toLowerCase() === "high" || act.priority.toLowerCase() === "critical"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : act.priority.toLowerCase() === "medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-zinc-800/40 text-zinc-400 border-zinc-700"
                        }`}>
                        {act.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP 50/50 split view ── */}
      <div className="hidden lg:flex flex-1 overflow-hidden min-h-0 relative">

        {/* Left Column Wrapper */}
        <div
          ref={leftColRef}
          onScroll={handleLeftScroll}
          className="absolute left-0 top-0 w-1/2 h-full overflow-y-scroll no-scrollbar"
        >
          {/* Left Column Content */}
          <div
            ref={leftColContentRef}
            className="border-r border-[#1a1a1e] p-5 space-y-5 min-h-[calc(100vh+100px)]"
          >
            <RecordingCard
              durationSeconds={data.durationSeconds}
              durationStr={data.durationStr}
              recordingUrl={data.recordingUrl}
              transcriptCount={data.transcript.length}
            />
            <TranscriptCard transcript={data.transcript} />
          </div>
        </div>

        {/* Right Column Wrapper */}
        <div
          ref={rightColRef}
          className="absolute right-0 top-0 w-1/2 h-full overflow-y-scroll p-5 pr-[32px] space-y-5 custom-scrollbar"
        >
          <AiInsightsCard
            category={data.category}
            subCategory={data.subCategory}
            bookingCategory={data.bookingCategory}
            summary={data.summary}
            sentiment={data.sentiment}
            insufficientData={data.insufficientData}
            specialNotes={data.specialNotes}
            allergies={data.allergies}
            topQueries={data.topQueries}
            keyInsights={data.keyInsights}
          />
          <ReservationDetailsCard
            guestName={data.guestName}
            requestType={data.requestType}
            issueSummary={data.issueSummary}
            description={data.description}
            partySize={data.partySize}
            bookingDate={data.bookingDate}
            bookingTime={data.bookingTime}
            depositPaid={data.depositPaid}
            confirmationStatus={data.confirmationStatus}
            purpose={data.purpose}
            actionId={data.actionId}
            callId={data.id}
            callSuccessful={data.callSuccessful}
            name={data.guestName}
            location={data.location}
            createdAt={data.createdAt}
            time={data.time}
            quantity={data.quantity}
            type={data.type}
            sentiment={data.sentiment}
            hasLinkedActions={!!(data.linkedActions && data.linkedActions.length > 0)}
            category={data.category}
          />
          {data.linkedActions && data.linkedActions.length > 0 && (
            <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-4">
              <p className="text-xs text-zinc-200 font-extrabold uppercase tracking-widest">
                Linked Actions
              </p>
              <div className="space-y-3">
                {data.linkedActions.map((act) => (
                  <div
                    key={act.id}
                    onClick={() => router.push(`/actions/${act.id}`)}
                    className="border border-zinc-900 hover:border-zinc-500 bg-[#0f0f11] rounded-xl p-4.5 space-y-3 relative transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm text-white font-bold">
                          Action #{act.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${act.status.toLowerCase() === "resolved"
                          ? "bg-zinc-800/40 text-zinc-400 border-zinc-700"
                          : act.status.toLowerCase() === "open"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                          {act.status.charAt(0).toUpperCase() + act.status.slice(1)}
                        </span>
                      </div>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0"
                      >
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                    </div>

                    <p className="text-xs text-zinc-400 italic font-medium">
                      {act.requestType}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-extrabold tracking-widest uppercase">
                        {act.createdAt}
                      </span>
                      <span className="text-zinc-600 text-xs select-none">•</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${act.priority.toLowerCase() === "high" || act.priority.toLowerCase() === "critical"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : act.priority.toLowerCase() === "medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-zinc-800/40 text-zinc-400 border-zinc-700"
                        }`}>
                        {act.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dummy Scrollbar for Left Column */}
        <div
          ref={dummyScrollRef}
          onScroll={handleDummyScroll}
          className="absolute right-[14px] top-0 bottom-0 w-[14px] overflow-y-scroll custom-scrollbar z-20"
        >
          <div style={{ height: leftScrollHeight }} />
        </div>

      </div>
    </div>
  );
}
