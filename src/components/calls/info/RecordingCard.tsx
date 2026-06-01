"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface Props {
  durationSeconds: number;
  durationStr: string;
  recordingUrl?: string;
  transcriptCount?: number;
}

function makeRand(seed: number) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0);
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0);
    return (s >>> 0) / 0xffffffff;
  };
}

export default function RecordingCard({ durationSeconds, durationStr, recordingUrl, transcriptCount }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialise status
    window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: 0 }));

    const handleSeek = (e: Event) => {
      const targetTime = (e as CustomEvent).detail;
      setCurrentTime(targetTime);
      if (audioRef.current) {
        audioRef.current.currentTime = targetTime;
      }
    };

    window.addEventListener("recording-seek", handleSeek);
    return () => {
      window.removeEventListener("recording-seek", handleSeek);
    };
  }, []);

  useEffect(() => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.preload = "none";
      audioRef.current = audio;

      const handleTimeUpdate = () => {
        const t = audio.currentTime;
        setCurrentTime(t);
        window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: t }));
      };
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: 0 }));
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);

      return () => {
        audio.pause();
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
        audioRef.current = null;
      };
    }
  }, [recordingUrl]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch((e) => console.warn("Audio playback failed:", e));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (recordingUrl) return;
    let id: NodeJS.Timeout | null = null;
    if (isPlaying) {
      id = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackRate;
          if (next >= durationSeconds) {
            setIsPlaying(false);
            window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: durationSeconds }));
            return durationSeconds;
          }
          window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: next }));
          return next;
        });
      }, 100);
    }
    return () => { if (id) clearInterval(id); };
  }, [isPlaying, playbackRate, durationSeconds, recordingUrl]);

  const togglePlay = () => setIsPlaying((p) => !p);
  const toggleMute = () => setIsMuted((m) => !m);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Dynamic waveform bars (main scrubber) ──────────────────────────────────
  // CHANGED: 120 bars (was 90), higher variance, sharper peaks, lower minH for spiky look
  const waveformBars = useMemo(() => {
    const COUNT = 120; // more bars = thinner/denser like the image
    const rand = makeRand(durationSeconds || 1);

    const peak =
      durationSeconds <= 15 ? 42 :
        durationSeconds <= 60 ? 42 + ((durationSeconds - 15) / 45) * 28 :
          durationSeconds <= 180 ? 70 + ((durationSeconds - 60) / 120) * 18 :
            Math.min(96, 88 + ((durationSeconds - 180) / 120) * 8);

    // CHANGED: lower minH for sharper contrast between short/tall bars
    const minH = Math.max(4, peak * 0.08);

    return Array.from({ length: COUNT }, (_, i) => {
      const r = rand();
      const pos = i / COUNT;
      // CHANGED: increased rand weight (0.65 vs 0.28) for more randomness/spikiness
      const envelope =
        pos < 0.10 ? 0.3 + (pos / 0.10) * 0.7 :
          pos < 0.90 ? 0.55 + 0.45 * Math.sin(pos * Math.PI * 5.2 + 0.6) :
            0.3 + (1 - pos) / 0.10 * 0.5;
      const h = minH + (peak - minH) * (0.65 * r + 0.35 * Math.max(0.08, envelope));
      return Math.round(Math.min(peak, Math.max(minH, h)));
    });
  }, [durationSeconds]);

  // ── Bottom Pill Segments Row (uniform layout matching transcript count) ────
  const miniPillarsCount = useMemo(() => {
    return transcriptCount !== undefined && transcriptCount > 0 ? transcriptCount : 80;
  }, [transcriptCount]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pct * durationSeconds;
    setCurrentTime(target);
    if (audioRef.current) audioRef.current.currentTime = target;
    window.dispatchEvent(new CustomEvent("recording-timeupdate", { detail: target }));
  };

  const progressPct = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#2a2a32] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Recording</p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full border border-zinc-700/60 bg-[#070709] flex items-center justify-center text-white hover:border-zinc-500 hover:bg-[#18181b] transition-all cursor-pointer flex-shrink-0"
          >
            {isPlaying
              ? <Pause size={17} className="text-white" strokeWidth={2} />
              : <Play size={17} className="text-white ml-0.5" strokeWidth={2} />
            }
          </button>

          <div className="flex gap-2">
            {[1, 1.25, 1.5].map((speed) => {
              const active = playbackRate === speed;
              return (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`text-xs font-bold px-4.5 py-2 rounded-full border transition-all cursor-pointer ${active
                      ? "bg-white border-white text-black"
                      : "bg-[#070709] border-zinc-700/60 text-zinc-300 hover:text-white hover:border-zinc-500"
                    }`}
                >
                  {speed}×
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold text-zinc-400">
          <span className="tabular-nums">{formatTime(currentTime)} / {durationStr}</span>
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </div>

      {/* ── Main Waveform Scrubber ── */}
      <div
        onClick={handleWaveformClick}
        className="relative h-[120px] bg-[#0e0e10] rounded-2xl border border-zinc-800/70 flex items-center gap-[1.5px] cursor-pointer select-none overflow-hidden px-3"

      >
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10 transition-[left] duration-75"
          style={{ left: `${progressPct}%` }}
        />

        {waveformBars.map((h, i) => {
          const barPct = (i / waveformBars.length) * 100;
          const played = barPct <= progressPct;
          return (
            <div
              key={i}
              className="flex-1 rounded-sm" // CHANGED: rounded-sm (was rounded-full) — sharper bar tops like image
              style={{
                height: `${h}%`,
                backgroundColor: played ? "#d4d4d8" : "#3f3f46",
                maxHeight: "88%",
                minHeight: "3%", // CHANGED: 3% (was 6%) — allows very short bars
                transition: "background-color 0.08s",
              }}
            />
          );
        })}
      </div>

      {/* ── Bottom Pill Segments Row ── */}
      <div className="flex items-end gap-[2px] h-9 w-full overflow-visible">
        {/* CHANGED: gap-[2px] (was gap-[3px]) — tighter packing */}
        {Array.from({ length: miniPillarsCount }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-[8px] relative group cursor-pointer"
            style={{
              height: "88%", // Taller height to fill the row like the second image
              backgroundColor: "#52525b", // Medium grey tone matching the second image
            }}
          >
            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 text-[10px] font-bold text-zinc-200 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-xl z-20">
              Confidence: 100 %
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}