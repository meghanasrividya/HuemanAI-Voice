"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  PhoneCall,
  Calendar,
  Activity,
  Award,
  Settings,
  Plus,
  Eye,
  Download,
  Ban,
} from "lucide-react";
import { fetchCampaignsList } from "@/lib/api/campaigns";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

export default function OutboundCampaignsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Outbound");
  const [mounted, setMounted] = useState(false);

  // Fetch org settings to check if outbound calls are enabled
  const { settings, isLoading: settingsLoading } = useOrganisationSettings();
  const outboundEnabled = settingsLoading ? null : (settings?.enable_outbound_calls ?? true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [campaignsList, setCampaignsList] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCampaignsList(currentPage, 10);
      if (res) {
        setCampaignsList(res.data || []);
        const total = res.total || 0;
        const limit = res.limit || 10;
        const totalPages = Math.ceil(total / limit);
        setPagination({
          total,
          page: res.page || currentPage,
          limit,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        });
      }
    } catch (err: any) {
      console.error("Failed to load campaigns", err);
      setError(err.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch campaigns if outbound is explicitly enabled
    if (outboundEnabled === true) {
      loadCampaigns();
    }
  }, [currentPage, outboundEnabled]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      // Fetch a larger limit to export all campaigns
      const res = await fetchCampaignsList(1, 1000);
      if (res && res.data) {
        const campaignsToExport = res.data;
        const headers = ["Campaign Name", "Total Contacts", "Created At"];
        const rows = campaignsToExport.map((campaign: any) => {
          const campaignName = campaign.name || "";
          const totalContacts = campaign.total_contacts !== null && campaign.total_contacts !== undefined 
            ? campaign.total_contacts 
            : 0;
          
          let createdAtFormatted = "";
          if (campaign.created_at) {
            const match = campaign.created_at.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
              const [, year, month, day] = match;
              createdAtFormatted = `${day}-${month}-${year}`;
            } else {
              try {
                const d = new Date(campaign.created_at);
                if (!isNaN(d.getTime())) {
                  const day = String(d.getDate()).padStart(2, '0');
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const year = d.getFullYear();
                  createdAtFormatted = `${day}-${month}-${year}`;
                }
              } catch (e) {
                createdAtFormatted = campaign.created_at;
              }
            }
          }
          return [campaignName, totalContacts, createdAtFormatted];
        });

        const csvContent = [
          headers.join(","),
          ...rows.map((row: any) => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        
        link.setAttribute("href", url);
        link.setAttribute("download", `campaign_export_${yyyy}-${mm}-${dd}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Failed to export campaigns", err);
      alert("Failed to export campaigns");
    } finally {
      setExporting(false);
    }
  };

  if (!mounted) return null;

  // ── Outbound disabled screen ────────────────────────────────────────────
  if (!settingsLoading && outboundEnabled === false) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
        {/* Sidebar — identical to the normal page */}
        <aside style={{ width: "230px" }} className="shrink-0 border-r border-[#1e1e24] bg-[#0c0c0e] px-4 py-5 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2 py-1">
              <span className="text-[17px] font-bold tracking-tight text-white select-none">HuemanAI</span>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { setActiveTab(item.name); router.push(item.href); }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                    activeTab === item.name ? "bg-[#1d1d22] text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
              <div className="mt-3 rounded-2xl border border-[#29292f] bg-white/5 px-3 py-3">
                <div className="flex items-center gap-3 text-zinc-400">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#a855f7]" />
                  <span className="text-xs font-semibold tracking-wide">Netra AI</span>
                </div>
                <p className="mt-1 text-[9px] text-purple-400 font-semibold uppercase tracking-[0.3em] ml-7">Coming Soon</p>
              </div>
              <button
                onClick={() => { setActiveTab("Admin"); router.push("/admin"); }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                  activeTab === "Admin" ? "bg-[#1d1d22] text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                <Settings size={15} />
                <span>Admin</span>
              </button>
            </nav>
          </div>
          <div className="mt-6 border-t border-[#18181b]/60 pt-5">
            <div 
              onClick={() => router.push("/profile")}
              className="flex items-center gap-3 px-1.5 cursor-pointer hover:opacity-80 transition-all"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] border border-zinc-800 text-xs font-extrabold text-zinc-300">F</div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-bold text-white truncate">Fredrick</p>
                <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-[#29292f] bg-[#101118] px-3 py-3 text-[11px] font-semibold text-zinc-400 transition hover:text-white hover:border-white/10"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Disabled content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/60 border border-zinc-700/40">
              <Ban size={32} className="text-zinc-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Outbound Calls Disabled</h2>
              <p className="text-sm text-zinc-500 mt-1">This feature has been disabled from the Admin Panel.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // ────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-white">
      {/* Sidebar */}
      <aside style={{ width: "230px" }} className="shrink-0 border-r border-[#1e1e24] bg-[#0c0c0e] px-4 py-5 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="text-[17px] font-bold tracking-tight text-white select-none">HuemanAI</span>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  router.push(item.href);
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                  activeTab === item.name
                    ? "bg-[#1d1d22] text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </button>
            ))}

            <div className="mt-3 rounded-2xl border border-[#29292f] bg-white/5 px-3 py-3">
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="h-3.5 w-3.5 rounded-full bg-[#a855f7]" />
                <span className="text-xs font-semibold tracking-wide">Netra AI</span>
              </div>
              <p className="mt-1 text-[9px] text-purple-400 font-semibold uppercase tracking-[0.3em] ml-7">
                Coming Soon
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab("Admin");
                router.push("/admin");
              }}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold tracking-wide transition-all text-left ${
                activeTab === "Admin"
                  ? "bg-[#1d1d22] text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
              }`}
            >
              <Settings size={15} />
              <span>Admin</span>
            </button>
          </nav>
        </div>

        <div className="mt-6 border-t border-[#18181b]/60 pt-5">
          <div 
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 px-1.5 cursor-pointer hover:opacity-80 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18181b] border border-zinc-800 text-xs font-extrabold text-zinc-300">
              F
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">Fredrick</p>
              <p className="text-[9px] text-zinc-500 truncate">fredrick@huemanai.co.uk</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="mt-4 flex w-full items-center gap-2.5 rounded-xl border border-[#29292f] bg-[#101118] px-3 py-3 text-[11px] font-semibold text-zinc-400 transition hover:text-white hover:border-white/10"
          >
            Logout
          </button>

          <div className="mt-4 flex justify-start px-2 text-zinc-600 transition-colors hover:text-zinc-400">
            <span className="text-xl">&lt;</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <main className="flex h-full flex-col overflow-hidden p-6">
          <div className="flex flex-col h-full min-h-0 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Outbound Campaigns
                </h1>
                <p className="text-xs text-zinc-400 uppercase tracking-[0.2em]">
                  Manage and track automated outbound calling campaigns
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/outbound_campaign/new")}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  New Outbound Campaign
                </button>
              </div>
            </div>

            {/* Campaign List Card */}
            <div className="flex-1 flex flex-col min-h-0 rounded-3xl border border-[#232327] bg-[#0c0c0f] p-5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between pb-4">
                <h2 className="text-lg font-semibold text-white">
                  Campaign List Performance
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => loadCampaigns()}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0c0c0f] px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 active:scale-95 transition-all"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0c0c0f] px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {exporting ? (
                      <span className="animate-spin h-3.5 w-3.5 border border-zinc-300 border-t-transparent rounded-full" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    {exporting ? "Exporting..." : "Export"}
                  </button>
                </div>
              </div>

              {/* Table wrapper */}
              <div className="flex-grow overflow-auto min-h-0">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-[#08080a] text-left text-[10px] uppercase tracking-[0.22em] text-zinc-500 border-b border-[#232327]/60">
                    <tr>
                      <th className="px-6 py-4 font-semibold">CAMPAIGN NAME</th>
                      <th className="px-6 py-4 font-semibold">TOTAL CONTACTS</th>
                      <th className="px-6 py-4 font-semibold">STATUS</th>
                      <th className="px-6 py-4 font-semibold">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                          <div className="flex items-center justify-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Loading campaigns...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-rose-400 font-semibold">
                          Error: {error}
                        </td>
                      </tr>
                    ) : campaignsList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                          No campaigns found.
                        </td>
                      </tr>
                    ) : (
                      campaignsList.map((campaign) => (
                        <tr
                          key={campaign.id}
                          className="border-b border-[#232327]/30 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-6 py-4 font-semibold text-white">
                            {campaign.name}
                          </td>
                          <td className="px-6 py-4 text-zinc-300">
                            {campaign.total_contacts !== null ? campaign.total_contacts : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] border ${
                                campaign.status === "draft"
                                  ? "bg-[#18181b]/50 text-zinc-400 border-zinc-800"
                                  : "bg-[#1d273a] text-blue-400 border-blue-900/60"
                              }`}
                            >
                              {campaign.status ? campaign.status : "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => router.push(`/outbound_campaign/${campaign.id}`)}
                              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0c0c0f] px-4 py-1.5 text-xs font-semibold text-zinc-300 hover:bg-white/5 hover:text-white hover:border-zinc-700 active:scale-95 cursor-pointer transition-all duration-150"
                            >
                              <Eye className="h-3.5 w-3.5 text-zinc-400" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              {!loading && !error && pagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#08080a] border-t border-[#232327]/60 rounded-b-3xl mt-4">
                  <div className="text-xs sm:text-sm text-zinc-400">
                    Showing page <span className="font-semibold text-white">{currentPage}</span> of{" "}
                    <span className="font-semibold text-white">{pagination.totalPages || 1}</span> (
                    <span className="font-semibold text-white">{pagination.total}</span> total results)
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      &lt; Previous
                    </button>
                    {pagination.totalPages > 1 &&
                      [...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                            currentPage === i + 1
                              ? "bg-white text-black"
                              : "border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24]"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    {pagination.totalPages <= 1 && (
                      <button className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-white text-black cursor-default select-none">
                        1
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={!pagination.hasNextPage}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24] disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      Next &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
