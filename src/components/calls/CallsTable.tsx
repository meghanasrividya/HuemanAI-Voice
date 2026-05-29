import React from "react";
import { useRouter } from "next/navigation";
import {
  PhoneCall,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";

interface Call {
  id: string;
  startTime: string;
  caller: string;
  phone: string;
  category: string;
  subCategory: string;
  duration: string;
  sentiment: string;
  direction: string;
}

interface CallsTableProps {
  displayedCalls: Call[];
  unmaskedCallers: Record<string, boolean>;
  toggleMask: (id: string) => void;
  maskPhone: (phone: string, isUnmasked: boolean) => string;
  loading: boolean;
  onClearFilters?: () => void;
}

export default function CallsTable({
  displayedCalls,
  unmaskedCallers,
  toggleMask,
  maskPhone,
  loading,
  onClearFilters
}: CallsTableProps) {
  const router = useRouter();

  // Pill Styling Helpers matching the screenshots exactly
  const getCategoryClass = (cat: string) => {
    if (cat === "N/A" || !cat) {
      return "bg-transparent text-zinc-400 border border-zinc-800/60";
    }
    return "bg-[#18181b] text-zinc-300 border border-zinc-800/80";
  };

  const getSubCategoryClass = (sub: string) => {
    if (sub === "Table Booking" || sub === "Table Rescheduling" || sub === "Enquiry") {
      return "bg-[#0c1932] text-[#4f90ff] border border-[#1e3660]/40";
    } else if (sub === "Table Cancellation") {
      return "bg-[#270c10] text-[#ff4f64] border border-[#581c24]/40";
    }
    // Default blue for any other subcategory
    return "bg-[#0c1932] text-[#4f90ff] border border-[#1e3660]/40";
  };

  const getSentimentClass = (sent: string) => {
    const s = sent ? sent.trim().toLowerCase() : "";
    if (s === "positive") {
      return "bg-[#051c11] text-[#22c55e] border border-[#14532d]";
    } else if (s === "neutral") {
      return "bg-[#1b1509] text-[#eab308] border border-[#ca8a04]/50";
    } else if (s === "negative") {
      return "bg-[#20080c] text-[#ef4444] border border-[#7f1d1d]";
    }
    return "bg-[#18181b] text-zinc-400 border border-zinc-800";
  };

  const formatSentimentLabel = (sent: string) => {
    const s = sent ? sent.trim().toLowerCase() : "";
    if (s === "positive") return "Positive";
    if (s === "neutral") return "Neutral";
    if (s === "negative") return "Negative";
    return "N/A";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-64 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-purple-400 opacity-80" />
        <p className="text-zinc-500 text-[10px] sm:text-[11px] font-medium tracking-wide">
          Loading calls...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col">
      {/* 1. DESKTOP VIEW (Table layout) */}
      <div className="hidden md:block overflow-x-auto w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1f1f23] text-xs font-bold text-zinc-500 uppercase tracking-widest bg-[#18181c]">
              <th className="py-5 px-6 font-bold tracking-widest text-xs">Call Start Time</th>
              <th className="py-5 px-6 font-bold tracking-widest text-xs">Caller</th>
              <th className="py-5 px-6 font-bold tracking-widest text-xs">Category</th>
              <th className="py-5 px-6 font-bold tracking-widest text-xs">Sub Category</th>
              <th className="py-5 px-6 font-bold tracking-widest text-xs text-center">Duration</th>
              <th className="py-5 px-6 font-bold tracking-widest text-xs text-center">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#18181b]/50">
            {displayedCalls.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center select-none">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <span className="text-zinc-400 text-sm font-semibold">No calls found</span>
                    {onClearFilters && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClearFilters();
                        }}
                        className="border border-zinc-800 bg-[#0a0a0c] rounded-full px-5 py-2 text-xs font-bold text-white hover:border-zinc-700 hover:bg-zinc-900/10 transition-all cursor-pointer"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedCalls.map((call) => {
                const isUnmasked = !!unmaskedCallers[call.id];
                return (
                  <tr
                    key={call.id}
                    onClick={() => router.push(`/calls/${call.id}?caller=${encodeURIComponent(call.caller)}&phone=${encodeURIComponent(call.phone)}`)}
                    className="hover:bg-[#222226]/50 transition-colors duration-150 border-b border-[#18181b]/60 cursor-pointer select-text"
                  >
                    {/* Call Start Time */}
                    <td className="py-6 px-6 text-sm text-zinc-300 font-semibold">
                      <div className="flex items-center gap-2.5">
                        <PhoneCall size={16} className="text-zinc-500" />
                        <span>{call.startTime}</span>
                      </div>
                    </td>

                    {/* Caller Info */}
                    <td className="py-5 px-6 select-text">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-base font-bold text-white select-text">{call.caller}</span>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                          <span className="select-text">{maskPhone(call.phone, isUnmasked)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMask(call.id);
                            }}
                            className="text-zinc-600 hover:text-zinc-400 transition-colors p-0.5 rounded cursor-pointer"
                          >
                            {isUnmasked ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Category pill */}
                    <td className="py-6 px-6 text-sm">
                      <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getCategoryClass(call.category)}`}>
                        {call.category}
                      </span>
                    </td>

                    {/* Sub Category pill */}
                    <td className="py-6 px-6 text-sm">
                      {call.subCategory === "N/A" || !call.subCategory ? (
                        <span className="text-zinc-400 font-medium pl-3 text-xs">N/A</span>
                      ) : (
                        <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide ${getSubCategoryClass(call.subCategory)}`}>
                          {call.subCategory}
                        </span>
                      )}
                    </td>

                    {/* Duration */}
                    <td className="py-6 px-6 text-sm text-white font-bold text-center">
                      {call.duration}
                    </td>

                    {/* Sentiment pill */}
                    <td className="py-6 px-6 text-sm text-center">
                      <span className={`inline-flex px-3.5 py-1 rounded-full text-xs font-bold tracking-wide ${getSentimentClass(call.sentiment)}`}>
                        {formatSentimentLabel(call.sentiment)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE RESPONSIVE VIEW (Card layout) */}
      <div className="block md:hidden w-full">
        {displayedCalls.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 select-none">
            <span className="text-zinc-400 text-xs font-semibold">No calls found</span>
            {onClearFilters && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                className="border border-zinc-800 bg-[#0a0a0c] rounded-full px-5 py-2 text-xs font-bold text-white hover:border-zinc-700 hover:bg-zinc-900/10 transition-all cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          displayedCalls.map((call) => {
            const isUnmasked = !!unmaskedCallers[call.id];
            return (
              <div
                key={call.id}
                onClick={() => router.push(`/calls/${call.id}?caller=${encodeURIComponent(call.caller)}&phone=${encodeURIComponent(call.phone)}`)}
                className="p-4 space-y-3 hover:bg-[#222226]/40 transition-colors duration-150 border-b border-zinc-900/20 cursor-pointer select-text"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs text-zinc-300 font-semibold">
                    <PhoneCall size={13} className="text-zinc-500" />
                    <span>{call.startTime}</span>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${getSentimentClass(call.sentiment)}`}>
                    {formatSentimentLabel(call.sentiment)}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-white">{call.caller}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
                    <span>{maskPhone(call.phone, isUnmasked)}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMask(call.id);
                      }}
                      className="text-zinc-600 hover:text-zinc-355 transition-colors p-0.5 rounded cursor-pointer"
                    >
                      {isUnmasked ? <EyeOff size={11} /> : <Eye size={11} />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide ${getCategoryClass(call.category)}`}>
                      {call.category}
                    </span>
                    {call.subCategory === "N/A" || !call.subCategory ? (
                      <span className="text-zinc-400 text-[9px] font-medium px-2 py-0.5">N/A</span>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide ${getSubCategoryClass(call.subCategory)}`}>
                        {call.subCategory}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-white font-semibold">
                    {call.duration}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
