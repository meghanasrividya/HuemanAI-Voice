import Link from "next/link";
import { ArrowRight, AudioLines } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-sans selection:bg-zinc-800">
      
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AudioLines className="text-white w-6 h-6 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-white select-none">
            HuemanAI
          </span>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-zinc-400 hover:text-white transition-colors py-1.5 px-4 rounded-full border border-zinc-800 hover:border-zinc-700 bg-zinc-950"
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        {/* Decorative subtle ambient glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/[0.02] rounded-full blur-[100px]" />
        
        <div className="relative z-10 max-w-3xl flex flex-col items-center gap-6">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500 bg-zinc-950 border border-zinc-900 px-3 py-1 rounded-full">
            Next Generation Voice AI
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-2xl leading-none">
            Human-grade voice agents for your workflow.
          </h1>
          
          <p className="text-zinc-400 text-base sm:text-lg max-w-lg leading-relaxed mt-2">
            Build, deploy, and scale state-of-the-art interactive conversational agents with unparalleled neural audio intelligence.
          </p>
          
          <div className="flex gap-4 mt-6">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-full hover:bg-zinc-200 transition-all shadow-lg hover:shadow-white/5"
            >
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900/80 py-6 text-center text-xs text-zinc-600 select-none">
        &copy; {new Date().getFullYear()} HuemanAI. All rights reserved.
      </footer>

    </div>
  );
}

