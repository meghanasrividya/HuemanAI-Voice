"use client";

import React, { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Check } from "lucide-react";
import { fetchCampaignById, fetchCampaignContacts, updateCampaignStatus } from "@/lib/api/campaigns";
import PageContainer from "@/components/layout/PageContainer";

type CampaignDetailPageProps = {
  params: Promise<{ campaignId: string }>;
};

export default function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { campaignId } = use(params);
  const router = useRouter();

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
      if (data) setCampaign(data);
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

  useEffect(() => { loadCampaign(); }, [campaignId]);
  useEffect(() => { loadContacts(); }, [campaignId, contactsPage]);

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
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      }
    } catch {}
    return dateStr;
  };

  const capitalize = (str: string) => {
    if (!str) return "-";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <PageContainer>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => router.push("/outbound_campaign")}
          className="text-zinc-400 hover:text-white transition flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-900 active:scale-95"
        >
          <ArrowLeft size={16} />
        </button>
        <button
          onClick={() => router.push("/outbound_campaign")}
          className="text-zinc-500 hover:text-white font-semibold text-xs ml-1 select-none transition"
        >
          Outbound
        </button>
        <span className="text-zinc-600 select-none text-xs mx-1">/</span>
        <span className="text-zinc-300 font-semibold text-xs select-none truncate max-w-[200px]">
          {campaignLoading ? "Loading..." : campaign?.name || "Campaign Details"}
        </span>
      </div>

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
                <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                  Campaign ID: {campaign.id}
                </p>
              </div>

              <div ref={dropdownRef} className="relative self-start sm:self-auto">
                <button
                  onClick={() => !updatingStatus && setIsDropdownOpen(!isDropdownOpen)}
                  disabled={updatingStatus}
                  className={`inline-flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer select-none active:scale-[0.98] ${
                    isDropdownOpen
                      ? "border-amber-500/80 bg-[#0c0c0e] text-amber-500"
                      : "border-border bg-card text-foreground hover:border-muted-foreground"
                  } ${updatingStatus ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {updatingStatus ? (
                    <>
                      <span className="animate-spin h-3.5 w-3.5 border-2 border-muted-foreground border-t-transparent rounded-full mr-1" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <span>{capitalize(campaign.status)}</span>
                      <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-amber-500" : ""}`} />
                    </>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-border bg-card p-1.5 shadow-lg z-50">
                    {["draft", "running", "paused", "completed"].map((status) => {
                      const isSelected = campaign.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border border-border bg-muted text-foreground"
                              : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          {isSelected ? <Check size={12} className="shrink-0" /> : <span className="w-3 shrink-0" />}
                          <span>{capitalize(status)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Summary Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-4 border-b border-border">
                Campaign Summary
              </h2>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">SCRIPT USED</p>
                  <p className="mt-1.5 text-sm font-bold truncate" title={campaign.agent_id}>{campaign.agent_id || "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">CREATED AT</p>
                  <p className="mt-1.5 text-sm font-bold">{formatSummaryDate(campaign.created_at)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">TOTAL CONTACTS</p>
                  <p className="mt-1.5 text-sm font-bold">{campaign.total_contacts !== null ? campaign.total_contacts : "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">MAX ATTEMPTS</p>
                  <p className="mt-1.5 text-sm font-bold">1</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">SCHEDULE TYPE</p>
                  <p className="mt-1.5 text-sm font-bold">{capitalize(campaign.schedule_type)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">STATUS</p>
                  <p className="mt-1.5 text-sm font-bold">{capitalize(campaign.status)}</p>
                </div>
              </div>
            </div>

            {/* Campaign Contact List Card */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm overflow-hidden flex flex-col">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground pb-4 border-b border-border">
                Campaign Contact List
              </h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="text-left text-[10px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border">
                    <tr>
                      <th className="px-6 py-4 font-semibold">NAME</th>
                      <th className="px-6 py-4 font-semibold">NUMBER</th>
                      <th className="px-6 py-4 font-semibold">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactsLoading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                          <div className="flex items-center justify-center gap-2">
                            <span className="animate-spin h-4 w-4 border-2 border-foreground border-t-transparent rounded-full" />
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
                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                          No contacts in this campaign.
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-semibold">{contact.name || "-"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{contact.phone_number || "-"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full border border-border bg-muted px-3.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
                              {capitalize(contact.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!contactsLoading && !contactsError && contactsPagination.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border mt-6">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Showing page <span className="font-semibold text-foreground">{contactsPage}</span> of{" "}
                    <span className="font-semibold text-foreground">{contactsPagination.totalPages || 1}</span> (
                    <span className="font-semibold text-foreground">{contactsPagination.total}</span> total contacts)
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setContactsPage((p) => Math.max(1, p - 1))}
                      disabled={!contactsPagination.hasPreviousPage}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      &lt; Previous
                    </button>
                    {[...Array(contactsPagination.totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setContactsPage(i + 1)}
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition ${
                          contactsPage === i + 1
                            ? "bg-foreground text-background"
                            : "border border-border bg-card text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setContactsPage((p) => Math.min(contactsPagination.totalPages, p + 1))}
                      disabled={!contactsPagination.hasNextPage}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-border bg-card text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition"
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
    </PageContainer>
  );
}
