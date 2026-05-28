"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";

interface Turn {
  speaker: "Bot" | "Caller";
  time: string;
  text: string;
}

interface Props {
  transcript: Turn[];
}

export default function TranscriptCard({ transcript }: Props) {
  const [searchQuery, setSearchQuery] = useState("");

  // Highlight matched query text
  const renderHighlighted = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const regex = new RegExp(
      `(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark
              key={i}
              className="bg-yellow-400/25 text-yellow-200 rounded px-0.5 font-semibold"
            >
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const filtered = transcript.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl flex flex-col overflow-hidden">

      {/* ── Fixed header: title + search ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 space-y-3">
        <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">
          Transcript
        </p>

        {/* Search bar — rounded, white border glow on focus */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search size={14} className="text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Find in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border border-zinc-700/60 rounded-full py-2.5 pl-9 pr-4 text-[12px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/50 transition-colors"
          />
        </div>
      </div>

      {/* ── Scrollable message list — scrollbar only here ── */}
      <div
        className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 space-y-2"
        style={{ maxHeight: "420px" }}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-zinc-500 text-[11px]">
            No results found.
          </div>
        ) : (
          filtered.map((turn, idx) => {
            const isBot = turn.speaker === "Bot";
            return (
              <div
                key={idx}
                className={`rounded-xl px-4 py-3 space-y-1.5 border ${isBot
                  ? "bg-[#1c1c20] border-[#2a2a30]"
                  : "bg-[#17171b] border-[#252528]"
                  }`}
              >
                {/* Speaker badge + time */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md tracking-wide ${isBot
                      ? "bg-[#2a2a32] text-zinc-300"
                      : "bg-[#222228] text-zinc-300"
                      }`}
                  >
                    {turn.speaker}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold">
                    {turn.time}
                  </span>
                </div>

                {/* Message text */}
                <p
                  className={`text-[13px] leading-relaxed font-medium select-text ${isBot ? "text-white" : "text-[#5aaeff]"
                    }`}
                >
                  {renderHighlighted(turn.text, searchQuery)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
