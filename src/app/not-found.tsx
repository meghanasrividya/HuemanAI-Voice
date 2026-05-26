"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MicOff, ArrowLeft, Home, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-white overflow-hidden p-6">
      {/* Dynamic Background Grid / Glow Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        {/* Voice Soundwave Animation */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <motion.div
            className="absolute inset-0 rounded-full border border-purple-500/30 bg-purple-500/5"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border border-indigo-500/40 bg-indigo-500/10"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <MicOff className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* 404 Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-sm font-semibold tracking-widest text-indigo-400 uppercase bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm">
            404 Error
          </span>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
            Signal Lost
          </h1>
          <p className="mt-4 text-lg text-zinc-400 max-w-md mx-auto leading-relaxed">
            The voice model couldn&apos;t establish a connection to this frequency. This path might have been deleted, moved, or never existed.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto h-12 px-6 rounded-full bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto h-12 px-6 rounded-full border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-zinc-300 font-medium hover:bg-zinc-800 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>

      {/* Footer Info / Status Indicators */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs text-zinc-600 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>HuemanAI Voice Engine</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5" />
          <span>All frequencies online</span>
        </div>
      </div>
    </div>
  );
}