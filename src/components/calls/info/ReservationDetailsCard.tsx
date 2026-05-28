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
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
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
}: Props) {
  // Determine which fields to show based on what has real data
  const hasReservationFields =
    partySize || bookingDate || bookingTime || depositPaid || confirmationStatus;

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-5">

      {/* ── Header ── */}
      <p className="text-[10px] text-zinc-200 font-extrabold uppercase tracking-widest">
        Reservation Details
      </p>

      {hasReservationFields ? (
        /* ── Structured reservation fields from live API ── */
        <div className="space-y-4">

          {partySize && (
            <div className="space-y-0.5">
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Party Size</p>
              <p className="text-[13px] text-zinc-200 font-semibold">{partySize}</p>
            </div>
          )}

          {bookingDate && (
            <div className="space-y-0.5">
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Booking Date</p>
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-zinc-200 font-semibold">{bookingDate}</p>
                <CopyButton text={bookingDate} />
              </div>
            </div>
          )}

          {bookingTime && (
            <div className="space-y-0.5">
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Booking Time</p>
              <p className="text-[13px] text-zinc-200 font-semibold">{bookingTime}</p>
            </div>
          )}

          {depositPaid && (
            <div className="space-y-1">
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Deposit Paid</p>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border ${
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
              <p className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Confirmation Status</p>
              <p className="text-[13px] text-zinc-200 font-semibold">{confirmationStatus}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Fallback: guest name / request type / issue / description ── */
        <div className="space-y-4">
          {[
            { label: "Guest Name", value: guestName },
            { label: "Request Type", value: requestType },
            { label: "Issue Summary", value: issueSummary },
            { label: "Description", value: description },
          ].map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <p className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">
                {item.label}
              </p>
              <p className="text-[12px] text-zinc-200 font-medium leading-relaxed">
                {item.value || "N/A"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
