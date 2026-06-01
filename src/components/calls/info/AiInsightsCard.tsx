"use client";

import React from "react";
import { AlertCircle, XCircle } from "lucide-react";

interface Props {
  category: string;
  subCategory: string;
  bookingCategory?: string;
  summary: string;
  sentiment: string;
  insufficientData?: boolean;
  specialNotes?: string;
  allergies?: string;
  topQueries?: string[];
  keyInsights?: { label: string; value: string }[];
}

export default function AiInsightsCard({
  category,
  subCategory,
  bookingCategory,
  summary,
  sentiment,
  insufficientData = false,
  specialNotes,
  allergies,
  topQueries = [],
  keyInsights = [],
}: Props) {
  // Sentiment bar
  const getSentiment = (s: string) => {
    const l = s ? s.toLowerCase() : "";
    if (l === "positive") return { width: "80%", color: "#22c55e", label: "Positive" };
    if (l === "negative") return { width: "20%", color: "#ef4444", label: "Negative" };
    if (insufficientData || l.includes("unknown")) return { width: "50%", color: "#f59e0b", label: "Unknown (Neutral)" };
    return { width: "50%", color: "#f59e0b", label: "Neutral" };
  };
  const sent = getSentiment(sentiment);

  // Build key insight rows — prefer API keyInsights, fallback to category/subCategory/bookingCategory
  const insightRows: { label: string; value: string }[] =
    keyInsights.length > 0
      ? keyInsights
      : [
        ...(subCategory && subCategory !== "N/A"
          ? [{ label: "Reservation Type", value: subCategory }]
          : []),
        ...(bookingCategory && bookingCategory !== "N/A"
          ? [{ label: "Booking Category", value: bookingCategory }]
          : []),
        ...(category && category !== "N/A" && !subCategory
          ? [{ label: "Category", value: category }]
          : []),
      ];

  // Summary bullet points — split on ". " for multi-sentence
  const bullets: string[] = (() => {
    if (!summary || summary === "N/A") return [];
    // Split on period+space that starts a new sentence, keep the original full stops
    const parts = summary.split(/(?<=\.)(?=\s[A-Z])/g).map((s) => s.trim()).filter(Boolean);
    return parts.length > 1 ? parts : [summary];
  })();

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-5">

      {/* ── Header ── */}
      <div className="space-y-4">
        <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
          AI Insights
        </p>
        {insufficientData && (
          <div className="space-y-4">
            <div className="border-b border-zinc-800/60" />
            <div className="flex items-center gap-2 text-[#ef4444] text-sm font-semibold">
              <XCircle size={14} className="text-[#ef4444]" />
              <span>Insufficient data or insights</span>
            </div>
            <div className="border-b border-zinc-800/60" />
          </div>
        )}
      </div>

      {/* ── Key Insights ── */}
      {insightRows.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
            Key Insights
          </p>
          <div className="space-y-2">
            {insightRows.map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-zinc-800/60 bg-[#0f0f11] rounded-lg px-4 py-2.5"
              >
                <span className="text-sm text-zinc-200 font-semibold select-text cursor-text">{row.label}</span>
                {row.value && row.value.toLowerCase().includes("cancel") ? (
                  <span className="text-xs sm:text-sm font-bold border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] px-3.5 py-1 rounded-full select-text cursor-text">
                    {row.value}
                  </span>
                ) : (
                  <span className="text-sm text-white font-bold select-text cursor-text">{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Special Notes & Requests ── */}
      {(specialNotes || allergies) && (
        <div className="space-y-3">
          <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
            Special Notes &amp; Requests
          </p>
          {allergies && (
            <div className="space-y-1.5">
              <div className="text-xs text-[#ef4444] font-extrabold uppercase tracking-wider">ALLERGIES:</div>
              <div className="inline-flex border border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full select-text cursor-text">
                {allergies}
              </div>
            </div>
          )}
          {specialNotes && (
            <div className="space-y-1">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">Notes:</div>
              <p className="text-sm text-zinc-200 font-medium leading-relaxed pl-0.5 select-text cursor-text">
                {specialNotes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Summary ── */}
      {bullets.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
            Summary
          </p>
          <ul className="space-y-2">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-300 leading-relaxed">
                <span className="text-zinc-500 mt-0.5 flex-shrink-0">•</span>
                <span className="select-text cursor-text">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Sentiment Meter ── */}
      <div className="space-y-2">
        <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
          Sentiment Meter
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-[#1e1e24] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: sent.width, backgroundColor: sent.color }}
            />
          </div>
          <span className="text-xs font-bold text-white w-20 text-right">{sent.label}</span>
        </div>
      </div>

      {/* ── Top Queries ── */}
      {topQueries.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs text-[#00c4b4] font-extrabold uppercase tracking-widest">
            Top Queries
          </p>
          <div className="flex flex-wrap gap-2">
            {topQueries.map((q, i) => (
              <span
                key={i}
                className="border border-[#3b82f6]/50 bg-[#3b82f6]/5 text-[#60a5fa] text-xs font-semibold px-3 py-1 rounded-full"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
