"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface Props {
  durationSeconds: number;
  durationStr: string;
  recordingUrl?: string;
}

// Seeded PRNG — returns a function that gives 0–1 each call, deterministic from seed
function makeRand(seed: number) {
  let s = (seed * 1664525 + 1013904223) >>> 0;
  return () => {
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0);
    s = (Math.imul(s ^ (s >>> 16), 0x45d9f3b) >>> 0);
    return (s >>> 0) / 0xffffffff;
  };
}

export default function RecordingCard({ durationSeconds, durationStr, recordingUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set up real audio element if recordingUrl is provided
  useEffect(() => {
    if (recordingUrl) {
      const audio = new Audio(recordingUrl);
      audio.preload = "none";
      audioRef.current = audio;

      const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => { setIsPlaying(false); setCurrentTime(0); };

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

  // Sync play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch((e) => console.warn("Audio playback failed:", e));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  // Sync mute
  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
  }, [isMuted]);

  // Simulated playback (no real audio)
  useEffect(() => {
    if (recordingUrl) return;
    let id: NodeJS.Timeout | null = null;
    if (isPlaying) {
      id = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.1 * playbackRate;
          if (next >= durationSeconds) { setIsPlaying(false); return durationSeconds; }
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
  // 90 tightly-packed bars seeded from durationSeconds.
  // Pattern: gentle ramp, sustained wavy mid-section, soft fade — matches real call recordings.
  const waveformBars = useMemo(() => {
    const COUNT = 90;
    const rand = makeRand(durationSeconds || 1);

    // Max peak height scales with duration
    const peak =
      durationSeconds <= 15  ? 42 :
      durationSeconds <= 60  ? 42 + ((durationSeconds - 15) / 45) * 28 :
      durationSeconds <= 180 ? 70 + ((durationSeconds - 60) / 120) * 18 :
      Math.min(96, 88 + ((durationSeconds - 180) / 120) * 8);

    // Keep bars UNIFORM: minH is high relative to peak (looks dense and full)
    const minH = Math.max(10, peak * 0.28);

    return Array.from({ length: COUNT }, (_, i) => {
      const r = rand();
      const pos = i / COUNT;
      // Envelope: ramp up 0-10%, sustained wavy 10-90%, gentle fade 90-100%
      const envelope =
        pos < 0.10 ? 0.3 + (pos / 0.10) * 0.7 :
        pos < 0.90 ? 0.55 + 0.45 * Math.sin(pos * Math.PI * 5.2 + 0.6) :
        0.3 + (1 - pos) / 0.10 * 0.5;
      const h = minH + (peak - minH) * (0.28 * r + 0.72 * Math.max(0.12, envelope));
      return Math.round(Math.min(peak, Math.max(minH, h)));
    });
  }, [durationSeconds]);

  // ── Dynamic mini-pillars (bottom row) ─────────────────────────────────────
  // 60 bars, medium gray, rounded top, bottom-aligned, fairly uniform.
  const miniPillars = useMemo(() => {
    const COUNT = 60;
    const rand = makeRand((durationSeconds || 1) * 31 + 7);

    const maxH =
      durationSeconds <= 20  ? 35 :
      durationSeconds <= 90  ? 35 + ((durationSeconds - 20) / 70) * 25 :
      durationSeconds <= 300 ? 60 + ((durationSeconds - 90) / 210) * 25 :
      Math.min(92, 85 + ((durationSeconds - 300) / 300) * 7);

    // Keep mini-pillars fairly uniform (high minH)
    const minH = Math.max(12, maxH * 0.35);

    return Array.from({ length: COUNT }, (_, i) => {
      const r = rand();
      const env = 0.5 + 0.5 * Math.sin((i / COUNT) * Math.PI * 4.0 + 1.0);
      const h = minH + (maxH - minH) * (0.30 * r + 0.70 * Math.max(0.15, env));
      return Math.round(Math.min(maxH, Math.max(minH, h)));
    });
  }, [durationSeconds]);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = pct * durationSeconds;
    setCurrentTime(target);
    if (audioRef.current) audioRef.current.currentTime = target;
  };

  const progressPct = durationSeconds > 0 ? (currentTime / durationSeconds) * 100 : 0;

  return (
    <div className="border border-[#1e1e24]/60 bg-[#121214] rounded-xl p-5 space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Recording</p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Play + Speed */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full border border-zinc-700/60 bg-[#070709] flex items-center justify-center text-white hover:border-zinc-500 hover:bg-[#18181b] transition-all cursor-pointer flex-shrink-0"
          >
            {isPlaying
              ? <Pause size={17} className="text-white" strokeWidth={2} />
              : <Play  size={17} className="text-white ml-0.5" strokeWidth={2} />
            }
          </button>

          <div className="flex gap-2">
            {[1, 1.25, 1.5].map((speed) => {
              const active = playbackRate === speed;
              return (
                <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={`text-xs font-bold px-4.5 py-2 rounded-full border transition-all cursor-pointer ${
                    active
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

        {/* Time + Mute */}
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
        className="relative h-[132px] bg-[#0a0a0c] rounded-xl border border-zinc-900/50 flex items-center gap-[1.5px] cursor-pointer select-none overflow-hidden px-2"
      >
        {/* Playhead line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white pointer-events-none z-10 transition-[left] duration-75"
          style={{ left: `${progressPct}%` }}
        />

        {/* Waveform bars — centered vertically, tightly packed */}
        {waveformBars.map((h, i) => {
          const barPct = (i / waveformBars.length) * 100;
          const played = barPct <= progressPct;
          return (
            <div
              key={i}
              className="flex-1 rounded-full"
              style={{
                height: `${h}%`,
                backgroundColor: played ? "#ffffff" : "#454550",
                maxHeight: "90%",
                minHeight: "5%",
                transition: "background-color 0.08s",
              }}
            />
          );
        })}
      </div>

      {/* ── Dynamic Mini-Pillars (bottom row) ── */}
      {/* Medium gray, rounded top, bottom-aligned, height scales with duration */}
      {recordingUrl && durationSeconds > 0 && (
        <div className="flex items-end gap-[1.5px] h-10 w-full">
          {miniPillars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                backgroundColor: "#5a5a62",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
