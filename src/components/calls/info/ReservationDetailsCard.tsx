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
  category?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className={`text-zinc-500 hover:text-zinc-300 cursor-pointer flex-shrink-0 transition-opacity duration-150 ${
        copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
      }`}
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
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
  category,
}: Props) {
  // Determine if this is a Feedback Category view
  const isFeedback = category && category.toLowerCase() === "feedback";

  // Determine if this has Reservation specific fields
  const hasReservationFields =
    partySize || bookingDate || bookingTime || depositPaid || confirmationStatus;

  // Check if this is an Enquiry / Action view
  const isEnquiryOrAction = type && type !== "" && type !== "N/A";

  // Check if sentiment is Neutral
  const shouldShowAllFields = isEnquiryOrAction || (sentiment && sentiment.toLowerCase() === "neutral");

  // Card Title
  const cardTitle = isFeedback
    ? "Feedback Details"
    : hasReservationFields || shouldShowAllFields
      ? "Reservation Details"
      : "Details";

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

    if (isFeedback) {
      // In Feedback view, map "Call Successful" label to "AI Processing Success" and only show AI Processing Success and Created At
      const allowedFeedbackLabels = ["AI Processing Success", "Created At"];
      return allFields
        .map(item => {
          if (item.label === "Call Successful") {
            return { ...item, label: "AI Processing Success" };
          }
          return item;
        })
        .filter(item => 
          allowedFeedbackLabels.includes(item.label) &&
          item.value !== undefined && 
          item.value !== null && 
          item.value !== "" && 
          item.value !== "N/A"
        );
    }

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
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-4">

      {/* ── Header ── */}
      <p className="text-xs text-white font-extrabold uppercase tracking-widest">
        {cardTitle}
      </p>

      {hasReservationFields && !isFeedback ? (
        /* ── Structured reservation fields from live API ── */
        <div className="space-y-4">

          {partySize && (
            <div className="space-y-1 group">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Party Size</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-100 font-medium select-text cursor-text">{partySize}</p>
                <CopyButton text={partySize} />
              </div>
            </div>
          )}

          {bookingDate && (
            <div className="space-y-1 group">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Booking Date</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-100 font-medium select-text cursor-text">{bookingDate}</p>
                <CopyButton text={bookingDate} />
              </div>
            </div>
          )}

          {bookingTime && (
            <div className="space-y-1 group">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Booking Time</p>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-100 font-medium select-text cursor-text">{bookingTime}</p>
                <CopyButton text={bookingTime} />
              </div>
            </div>
          )}

          {depositPaid && (
            <div className="space-y-1 group">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Deposit Paid</p>
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border select-text cursor-text ${
                    depositPaid.toLowerCase() === "yes"
                      ? "bg-[#051c11] text-[#22c55e] border-[#14532d]"
                      : "bg-[#1a1a1e] text-zinc-300 border-zinc-700"
                  }`}
                >
                  {depositPaid}
                </span>
                <CopyButton text={depositPaid} />
              </div>
            </div>
          )}


          <div className="space-y-1 group">
            <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Confirmation Status</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-100 font-medium select-text cursor-text">
                {confirmationStatus || "N/A"}
              </p>
              <CopyButton text={confirmationStatus || "N/A"} />
            </div>
          </div>

        </div>
      ) : (
        /* ── Fallback: dynamic action / feedback record details ── */
        <div className="space-y-4">
          {fallbackFields.map((item, idx) => (
            <div key={idx} className="space-y-1 group">
              <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
                {item.label}
              </p>
              {item.isBadge ? (
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold border select-text cursor-text ${
                      String(item.value).toLowerCase() === "yes"
                        ? (isFeedback
                            ? "bg-white text-black border-white font-extrabold"
                            : "bg-[#051c11] text-[#22c55e] border-[#14532d]")
                        : "bg-[#1a1a1e] text-zinc-300 border-zinc-700"
                    }`}
                  >
                    {item.value}
                  </span>
                  <CopyButton text={String(item.value)} />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-100 font-medium leading-relaxed select-text cursor-text">
                    {item.value || "N/A"}
                  </p>
                  <CopyButton text={item.value || "N/A"} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
