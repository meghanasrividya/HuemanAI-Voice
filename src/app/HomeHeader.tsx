"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";

export default function HomeHeader() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-10">
        <Image src="/logo.png" alt="HuëmanAI" width={280} height={80} className="h-16 w-auto object-contain" />

        {isAuthenticated && user ? (
          <div className="flex items-center gap-14 text-base">
            <span className="text-white/60">
              Welcome, <span className="text-white/80">{user.first_name || user.email}</span>
            </span>
            <Link href="/dashboard" className="font-semibold text-white">
              Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/80 transition hover:text-white">
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
