"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchActionById } from "@/lib/api/actions"; // adjust path if needed

type ActionDetailPageProps = {
  params: {
    actionId: string;
  };
};

export default function ActionDetailPage({ params }: ActionDetailPageProps) {
  const [action, setAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAction = async () => {
      try {
        const data = await fetchActionById(params.actionId);
        setAction(data);
      } catch (err) {
        console.error("Failed to fetch action", err);
      } finally {
        setLoading(false);
      }
    };

    loadAction();
  }, [params.actionId]);

  if (loading) {
    return <div className="text-white p-6">Loading...</div>;
  }

  if (!action) {
    return <div className="text-red-500 p-6">No data found</div>;
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-8 text-white">
      {/* HEADER */}
      <div className="mb-8">
        <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
          Action Center
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Manage and track guest follow-ups
        </h1>
      </div>

      {/* BACK BUTTON */}
      <div className="mb-6">
        <Link
          href="/actions"
          className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Actions
        </Link>
      </div>

      {/* MAIN CARD */}
      <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Action Details</h2>
            <p className="mt-1 text-sm text-zinc-400">
              ID: {action.id}
            </p>
          </div>

          <span className="rounded-full bg-emerald-500/10 px-4 py-1 text-sm text-emerald-400 border border-emerald-500/20">
            {action.status}
          </span>
        </div>

        {/* INFO GRID */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="card">
            <p className="label">Guest</p>
            <p className="value">{action.guest_name}</p>
          </div>

          <div className="card">
            <p className="label">Phone</p>
            <p className="value">{action.phone_number}</p>
          </div>

          <div className="card">
            <p className="label">Priority</p>
            <p className="value">{action.priority}</p>
          </div>

          <div className="card">
            <p className="label">Due</p>
            <p className="value">
              {action.is_overdue ? "Overdue" : "On Time"}
            </p>
          </div>
        </div>

        {/* NOTES */}
        <div className="mt-8 rounded-2xl border border-[#29292f] bg-[#111118] p-5">
          <p className="text-xs text-zinc-400 uppercase tracking-wide">
            Notes
          </p>
          <p className="mt-3 text-sm text-zinc-300">
            {action.notes}
          </p>
        </div>
      </div>
    </div>
  );
}