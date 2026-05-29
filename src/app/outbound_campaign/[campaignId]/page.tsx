"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  PhoneCall,
  Calendar,
  Activity,
  Award,
  Settings,
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { fetchCampaignById, fetchCampaignContacts, updateCampaignStatus } from "@/lib/api/campaigns";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

type CampaignDetailPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Outbound");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [campaign, setCampaign] = useState<any>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [campaignError, setCampaignError] = useState<string | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign || newStatus === campaign.status) {
      setIsDropdownOpen(false);
      return;
    }
    setUpdatingStatus(true);
    try {
      const updatedCampaign = await updateCampaignStatus(campaignId, newStatus);
      if (updatedCampaign && updatedCampaign.status) {
        setCampaign(updatedCampaign);
      } else {
        setCampaign((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      console.error("Failed to update campaign status:", err);
      alert(err.response?.data?.message || err.message || "Failed to update campaign status");
    } finally {
      setUpdatingStatus(false);
      setIsDropdownOpen(false);
    }
  };

  const [contacts, setContacts] = useState<any[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contactsPage, setContactsPage] = useState(1);
  const [contactsPagination, setContactsPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const loadCampaign = async () => {
    setCampaignLoading(true);
    setCampaignError(null);
    try {
      const data = await fetchCampaignById(campaignId);
      if (data) {
        setCampaign(data);
      }
    } catch (err: any) {
      console.error("Failed to load campaign details", err);
      setCampaignError(err.message || "Failed to load campaign details");
    } finally {
      setCampaignLoading(false);
    }
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    setContactsError(null);
    try {
      const res = await fetchCampaignContacts(campaignId, contactsPage, 10);
      if (res) {
        setContacts(res.data || []);
        const total = res.total || 0;
        const limit = res.limit || 10;
        const totalPages = Math.ceil(total / limit);
        setContactsPagination({
          total,
          page: res.page || contactsPage,
          limit,
          totalPages,
          hasNextPage: contactsPage < totalPages,
          hasPreviousPage: contactsPage > 1,
        });
      }
    } catch (err: any) {
      console.error("Failed to load campaign contacts", err);
      setContactsError(err.message || "Failed to load contacts");
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  useEffect(() => {
    loadContacts();
  }, [campaignId, contactsPage]);

  if (!mounted) return null;

  const formatSummaryDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}/${month}/${year}`;
    }
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
      }
    } catch (e) {}
    return dateStr;
  };

  const capitalize = (str: string) => {
    if (!str) return "-";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-[60px] shrink-0 border-b border-[#1e1e24] bg-[#0c0c0e] px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => router.push("/outbound_campaign")}
              className="text-zinc-400 hover:text-white transition flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-900 active:scale-95"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-zinc-500 font-semibold text-xs ml-2 select-none">Outbound</span>
            <span className="text-zinc-600 select-none text-xs mx-1">/</span>
            <span className="text-zinc-300 font-semibold text-xs select-none truncate max-w-[200px]">
              {campaignLoading ? "Loading..." : campaign?.name || "Campaign Details"}
            </span>
          </div>
        </header>

        {/* Scrollable content wrapper */}
        <div className="flex-1 overflow-y-auto bg-[#050505] p-6">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {campaignLoading ? (
              <div className="flex items-center justify-center py-24 text-zinc-500">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Loading campaign details...
              </div>
            ) : campaignError || !campaign ? (
              <div className="text-center py-24 text-rose-400 font-semibold">
                Error loading campaign: {campaignError || "Campaign not found"}
              </div>
            ) : (
              <>
                {/* Header Title with Status Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                      {campaign.name}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider font-semibold">
                      Campaign ID: {campaign.id}
                    </p>
                  </div>

                  <div ref={dropdownRef} className="relative self-start sm:self-auto">
                    {/* Status Badge Dropdown */}
                    <button
                      onClick={() => !updatingStatus && setIsDropdownOpen(!isDropdownOpen)}
                      disabled={updatingStatus}
                      className={`inline-flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none active:scale-[0.98] ${
                        isDropdownOpen
                          ? "border-amber-500/80 bg-[#0c0c0e] text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : "border-[#29292f] bg-[#0c0c0e] text-zinc-300 hover:border-zinc-500 hover:text-white"
                      } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {updatingStatus ? (
                        <>
                          <span className="animate-spin h-3.5 w-3.5 border-2 border-zinc-400 border-t-transparent rounded-full mr-1" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <span>{capitalize(campaign.status)}</span>
                          <ChevronDown
                            size={13}
                            className={`text-zinc-500 transition-transform duration-200 ${
                              isDropdownOpen ? "rotate-180 text-amber-500" : ""
                            }`}
                          />
                        </>
                      )}
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-[#232327] bg-[#0c0c0f] p-1.5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        {["draft", "running", "paused", "completed"].map((status) => {
                          const isSelected = campaign.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(status)}
                              className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border border-white bg-[#16161b] text-white"
                                  : "border border-transparent text-zinc-400 hover:text-white hover:bg-white/5"
                              }`}
                            >
                              {isSelected ? (
                                <Check size={12} className="text-white shrink-0" />
                              ) : (
                                <span className="w-3 shrink-0" />
                              )}
                              <span>{capitalize(status)}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Campaign Summary Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-4 border-b border-[#1d1d22]">
                    Campaign Summary
                  </h2>

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        SCRIPT USED
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white truncate" title={campaign.agent_id}>
                        {campaign.agent_id || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        CREATED AT
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white">
                        {formatSummaryDate(campaign.created_at)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        TOTAL CONTACTS
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white">
                        {campaign.total_contacts !== null ? campaign.total_contacts : "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        MAX ATTEMPTS
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white">
                        1
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        SCHEDULE TYPE
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white">
                        {capitalize(campaign.schedule_type)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-500">
                        STATUS
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-white">
                        {capitalize(campaign.status)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Campaign Contact List Card */}
                <div className="rounded-3xl border border-[#232327] bg-[#0c0c0f] p-6 shadow-sm overflow-hidden flex flex-col">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 pb-4 border-b border-[#1d1d22]">
                    Campaign Contact List
                  </h2>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead className="bg-[#08080a] text-left text-[10px] uppercase tracking-[0.22em] text-zinc-500 border-b border-[#232327]/60">
                        <tr>
                          <th className="px-6 py-4 font-semibold">NAME</th>
                          <th className="px-6 py-4 font-semibold">NUMBER</th>
                          <th className="px-6 py-4 font-semibold">STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contactsLoading ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                              <div className="flex items-center justify-center gap-2">
                                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                Loading contacts...
                              </div>
                            </td>
                          </tr>
                        ) : contactsError ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-rose-400 font-semibold">
                              Error: {contactsError}
                            </td>
                          </tr>
                        ) : contacts.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                              No contacts in this campaign.
                            </td>
                          </tr>
                        ) : (
                          contacts.map((contact) => (
                            <tr
                              key={contact.id}
                              className="border-b border-[#232327]/30 hover:bg-white/5 transition-colors"
                            >
                              <td className="px-6 py-4 font-semibold text-white">
                                {contact.name || "-"}
                              </td>
                              <td className="px-6 py-4 text-zinc-300">
                                {contact.phone_number || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex rounded-full border border-zinc-800 bg-[#111214] px-3.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-300">
                                  {capitalize(contact.status)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination footer for contacts */}
                  {!contactsLoading && !contactsError && contactsPagination.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#08080a] border-t border-[#232327]/60 rounded-b-3xl mt-6">
                      <div className="text-xs sm:text-sm text-zinc-400">
                        Showing page <span className="font-semibold text-white">{contactsPage}</span> of{" "}
                        <span className="font-semibold text-white">{contactsPagination.totalPages || 1}</span> (
                        <span className="font-semibold text-white">{contactsPagination.total}</span> total contacts)
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => setContactsPage((p) => Math.max(1, p - 1))}
                          disabled={!contactsPagination.hasPreviousPage}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24] disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          &lt; Previous
                        </button>
                        {contactsPagination.totalPages > 1 &&
                          [...Array(contactsPagination.totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setContactsPage(i + 1)}
                              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                                contactsPage === i + 1
                                  ? "bg-white text-black"
                                  : "border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24]"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        {contactsPagination.totalPages <= 1 && (
                          <button className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold bg-white text-black cursor-default select-none">
                            1
                          </button>
                        )}
                        <button
                          onClick={() => setContactsPage((p) => Math.min(contactsPagination.totalPages, p + 1))}
                          disabled={!contactsPagination.hasNextPage}
                          className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#2a2a30] bg-[#141416] text-zinc-300 hover:bg-[#1f1f24] disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          Next &gt;
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
