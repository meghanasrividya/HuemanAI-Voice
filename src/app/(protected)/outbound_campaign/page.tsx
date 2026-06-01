"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Download, Ban } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCampaignsList } from "@/lib/api/campaigns";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";

interface Campaign {
  id: string | number;
  name: string;
  total_contacts: number | null;
  status: string;
  created_at?: string;
}

interface CampaignsResponse {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export default function OutboundCampaignsPage() {
  const router = useRouter();
  const { settings, isLoading: settingsLoading } = useOrganisationSettings();
  const outboundEnabled = settingsLoading ? null : (settings?.enable_outbound_calls ?? true);

  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<CampaignsResponse>({
    queryKey: ["campaigns", currentPage],
    queryFn: () => fetchCampaignsList(currentPage, 10),
    enabled: outboundEnabled === true,
  });

  const campaignsList = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const pagination = {
    total,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res: CampaignsResponse = await fetchCampaignsList(1, 1000);
      if (res?.data) {
        const headers = ["Campaign Name", "Total Contacts", "Created At"];
        const rows = res.data.map((campaign) => {
          let createdAt = "";
          if (campaign.created_at) {
            const match = campaign.created_at.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              createdAt = `${match[3]}-${match[2]}-${match[1]}`;
            } else {
              try {
                const d = new Date(campaign.created_at);
                if (!isNaN(d.getTime())) {
                  createdAt = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
                }
              } catch {}
            }
          }
          return [campaign.name ?? "", campaign.total_contacts ?? 0, createdAt];
        });
        const csv = [headers, ...rows]
          .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
          .join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const now = new Date();
        link.href = url;
        link.download = `campaign_export_${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}.csv`;
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      alert("Failed to export campaigns");
    } finally {
      setExporting(false);
    }
  };

  if (!settingsLoading && outboundEnabled === false) {
    return (
      <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
            <Ban size={32} className="text-zinc-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Outbound Calls Disabled</h2>
            <p className="text-sm text-zinc-400 mt-1">This feature has been disabled from the Admin Panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="w-full px-[32px] pt-[32px] pb-8">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight mb-1.5 text-white">
              Outbound Campaigns
            </h1>
            <p className="text-zinc-400 text-[13px] tracking-wide">
              Manage and track automated outbound calling campaigns
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/outbound_campaign/new")}
            className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold transition hover:bg-zinc-200 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            New Outbound Campaign
          </button>
        </div>

        {/* Campaign List Card */}
        <div className="rounded-[12px] border border-zinc-800 bg-[#0f0f0f] overflow-hidden">

          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <h2 className="text-[16px] font-bold text-white">Campaign List Performance</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void refetch()}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-transparent px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                type="button"
                onClick={() => void handleExport()}
                disabled={exporting}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-transparent px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all disabled:opacity-50"
              >
                {exporting ? (
                  <span className="animate-spin h-3.5 w-3.5 border border-zinc-400 border-t-transparent rounded-full" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )}
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="text-left text-[10px] uppercase tracking-[0.22em] text-zinc-500 border-b border-zinc-800 bg-[#0a0a0a]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Campaign Name</th>
                  <th className="px-6 py-3.5 font-semibold">Total Contacts</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center text-zinc-500">
                      <div className="flex items-center justify-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Loading campaigns...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center text-rose-400 font-semibold">
                      Error: {(error as Error).message ?? "Failed to load campaigns"}
                    </td>
                  </tr>
                ) : campaignsList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center text-zinc-500">
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaignsList.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className="border-b border-zinc-800/60 hover:bg-zinc-900/40 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-white">{campaign.name}</td>
                      <td className="px-6 py-4 text-zinc-400">
                        {campaign.total_contacts !== null ? campaign.total_contacts : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] border ${
                            campaign.status === "draft"
                              ? "bg-zinc-900/50 text-zinc-400 border-zinc-700"
                              : "bg-blue-950/30 text-blue-400 border-blue-900/60"
                          }`}
                        >
                          {campaign.status || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => router.push(`/outbound_campaign/${campaign.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-transparent px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all duration-150"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && !error && total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-zinc-800 bg-[#0a0a0a]">
              <p className="text-xs text-zinc-500">
                Page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                <span className="font-semibold text-white">{totalPages}</span>{" "}
                &mdash; <span className="font-semibold text-white">{total}</span> total
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  &lt; Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                      currentPage === i + 1
                        ? "bg-white text-black"
                        : "border border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!pagination.hasNextPage}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-zinc-700 bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
