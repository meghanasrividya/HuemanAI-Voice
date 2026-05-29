"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  guestName: string;
  requestType: string;
  issueSummary: string;
  description: string;
  partySize?: string;
  bookingDate?: string;
  bookingTime?: string;
  depositPaid?: string;
  confirmationStatus?: string;
  purpose?: string;
  actionId?: string;
  callId?: string;
  callSuccessful?: string;
  name?: string;
  location?: string;
  createdAt?: string;
  time?: string;
  quantity?: string;
  type?: string;
  sentiment?: string;
  hasLinkedActions?: boolean;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer flex-shrink-0"
    >
      {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
    </button>
  );
}

export default function ReservationDetailsCard({
  guestName,
  requestType,
  issueSummary,
  description,
  partySize,
  bookingDate,
  bookingTime,
  depositPaid,
  confirmationStatus,
  purpose,
  actionId,
  callId,
  callSuccessful,
  name,
  location,
  createdAt,
  time,
  quantity,
  type,
  sentiment,
  hasLinkedActions,
}: Props) {
  // Determine which fields to show based on what has real data
  const hasReservationFields =
    partySize || bookingDate || bookingTime || depositPaid || confirmationStatus;

  // Check if this is an Enquiry / Action view
  const isEnquiryOrAction = type && type !== "" && type !== "N/A";

  // Check if sentiment is Neutral (shows all details in reservation section exactly as requested)
  const shouldShowAllFields = isEnquiryOrAction || (sentiment && sentiment.toLowerCase() === "neutral");

  // Card Title
  const cardTitle = hasReservationFields || shouldShowAllFields ? "Reservation Details" : "Details";

  // Dynamically build fields list for non-reservation / enquiry views
  const fallbackFields = (() => {
    const allFields = [
      { label: "Guest Name", value: guestName, showCopy: true },
      { label: "Request Type", value: requestType },
      { label: "Issue Summary", value: issueSummary },
      { label: "Description", value: description },
      { label: "Purpose", value: purpose },
      { label: "Id", value: actionId },
      { label: "Call Id", value: callId },
      { label: "Call Successful", value: callSuccessful, isBadge: true },
      { label: "Name", value: name, showCopy: true },
      { label: "Location", value: location },
      { label: "Created At", value: createdAt },
      { label: "Time", value: time },
      { label: "Quantity", value: quantity },
      { label: "Type", value: type },
    ];

    if (shouldShowAllFields) {
      // In Enquiry/Action view or Neutral sentiment, show all fields (including N/A)
      // and when the data is null in the "linked action" then time not showing
      return allFields.filter(item => {
        if (item.label === "Time" && !hasLinkedActions) {
          return false;
        }
        return (
          item.value !== undefined && 
          item.value !== null && 
          item.value !== "undefined"
        );
      });
    } else {
      // In basic Details view, only show Created At, Id, Call Id, and Call Successful
      const allowedLabels = ["Created At", "Id", "Call Id", "Call Successful"];
      return allFields.filter(item => 
        allowedLabels.includes(item.label) &&
        item.value !== undefined && 
        item.value !== null && 
        item.value !== "" && 
        item.value !== "N/A" && 
        item.value !== "undefined"
      );
    }
  })();

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-5">

      {/* ── Header ── */}
      <p className="text-xs text-zinc-200 font-extrabold uppercase tracking-widest">
        {cardTitle}
      </p>

      {hasReservationFields ? (
        /* ── Structured reservation fields from live API ── */
        <div className="space-y-4">

          {partySize && (
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Party Size</p>
              <p className="text-sm text-zinc-200 font-semibold">{partySize}</p>
            </div>
          )}

          {bookingDate && (
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Booking Date</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-200 font-semibold">{bookingDate}</p>
                <CopyButton text={bookingDate} />
              </div>
            </div>
          )}

          {bookingTime && (
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Booking Time</p>
              <p className="text-sm text-zinc-200 font-semibold">{bookingTime}</p>
            </div>
          )}

          {depositPaid && (
            <div className="space-y-1">
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Deposit Paid</p>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${
                  depositPaid.toLowerCase() === "yes"
                    ? "bg-[#051c11] text-[#22c55e] border-[#14532d]"
                    : "bg-[#1a1a1e] text-zinc-400 border-zinc-700"
                }`}
              >
                {depositPaid}
              </span>
            </div>
          )}

          {confirmationStatus && (
            <div className="space-y-0.5">
              <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">Confirmation Status</p>
              <p className="text-sm text-zinc-200 font-semibold">{confirmationStatus}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Fallback: dynamic action record details ── */
        <div className="space-y-4">
          {fallbackFields.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest">
                {item.label}
              </p>
              {item.isBadge ? (
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border mt-1 ${
                    String(item.value).toLowerCase() === "yes"
                      ? "bg-[#051c11] text-[#22c55e] border-[#14532d]"
                      : "bg-[#1f0d0d] text-[#ef4444] border-[#7f1d1d]"
                  }`}
                >
                  {item.value}
                </span>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-200 font-medium leading-relaxed">
                    {item.value || "N/A"}
                  </p>
                  {item.showCopy && (
                    <CopyButton text={item.value || "N/A"} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
