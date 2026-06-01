"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const handleTimeUpdate = (e: Event) => {
      setCurrentTime((e as CustomEvent).detail);
    };
    window.addEventListener("recording-timeupdate", handleTimeUpdate);
    return () => {
      window.removeEventListener("recording-timeupdate", handleTimeUpdate);
    };
  }, []);

  const parseTimeToSeconds = (timeStr: string): number => {
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10);
      const secs = parseInt(parts[1], 10);
      if (!isNaN(mins) && !isNaN(secs)) {
        return mins * 60 + secs;
      }
    }
    return 0;
  };

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

  const turnsWithSeconds = useMemo(() => {
    return filtered.map((turn, index) => ({
      ...turn,
      seconds: parseTimeToSeconds(turn.time),
      originalIndex: index,
    }));
  }, [filtered]);

  const activeIndex = useMemo(() => {
    let lastActive = 0;
    for (let i = 0; i < turnsWithSeconds.length; i++) {
      if (currentTime >= turnsWithSeconds[i].seconds) {
        lastActive = i;
      } else {
        break;
      }
    }
    return lastActive;
  }, [turnsWithSeconds, currentTime]);

  const handleTurnClick = (timeStr: string) => {
    const secs = parseTimeToSeconds(timeStr);
    window.dispatchEvent(new CustomEvent("recording-seek", { detail: secs }));
  };

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl flex flex-col overflow-hidden">
      <style>{`
        .transcript-scrollbar::-webkit-scrollbar {
          width: 14px;
        }
        .transcript-scrollbar::-webkit-scrollbar-track {
          background: #222226;
        }
        .transcript-scrollbar::-webkit-scrollbar-thumb {
          background-color: #8e8e93; 
          border-radius: 9999px;
          border: 3px solid #222226;
        }
        .transcript-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a1a1aa;
        }
        .transcript-scrollbar {
          scrollbar-width: auto;
          scrollbar-color: #8e8e93 #222226;
        }
      `}</style>

      {/* ── Fixed header: title + search ── */}
      <div className="flex-shrink-0 px-5 pt-5 pb-3 space-y-3">
        <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">
          Transcript
        </p>

        {/* Search bar — slightly rounded rectangle matching screenshot */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
            <Search size={16} className="text-zinc-500" />
          </span>
          <input
            type="text"
            placeholder="Find in transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181b] border border-zinc-800/80 rounded-xl py-3 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* ── Scrollable message list — custom scrollbar ── */}
      <div
        className="flex-1 overflow-y-auto min-h-0 px-3 pb-4 space-y-3 transcript-scrollbar"
        style={{ maxHeight: "560px" }}
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-zinc-500 text-xs">
            No results found.
          </div>
        ) : (
          filtered.map((turn, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={idx}
                onClick={() => handleTurnClick(turn.time)}
                className={`rounded-xl px-4 py-3.5 space-y-2 border transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-[#333333] border-[#3f3f3f] ring-1 ring-zinc-700/50"
                    : "bg-[#18181a] border-[#222225] hover:border-zinc-800"
                  }`}
              >
                {/* Speaker badge + time */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive
                        ? "bg-[#52525b] text-zinc-200"
                        : "bg-[#000000] text-zinc-300"
                      }`}
                  >
                    {turn.speaker}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    {turn.time}
                  </span>
                </div>

                {/* Message text */}
                <p className="text-[15px] leading-relaxed font-normal text-zinc-100 select-text cursor-text">
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
