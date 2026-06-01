"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Download, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createCampaign, uploadCampaignContacts } from "@/lib/api/campaigns";
import { useQueryClient } from "@tanstack/react-query";

export default function NewCampaignPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [campaignName, setCampaignName] = useState("");
  const [selectedScript, setSelectedScript] = useState("feedback-collection");
  const [campaignStatus, setCampaignStatus] = useState("draft");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [parsing, setParsing] = useState(false);
  const [fileStats, setFileStats] = useState<{ total: number; valid: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidPhoneNumber = (phone: string) => {
    const cleanPhone = phone.trim().replace(/^['"]|['"]$/g, "");
    if (!cleanPhone) return false;
    return /^\+?[0-9\s-]{7,16}$/.test(cleanPhone);
  };

  const parseContactsFile = async (file: File): Promise<{ total: number; valid: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "xlsx" || extension === "xls") {
        import("xlsx").then((XLSX) => {
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              if (rows.length === 0) { resolve({ total: 0, valid: 0 }); return; }

              const headerRow = rows[0];
              let phoneIdx = headerRow?.findIndex((h: any) =>
                h && typeof h === "string" &&
                (h.toLowerCase().includes("phone") || h.toLowerCase().includes("number"))
              ) ?? -1;
              if (phoneIdx === -1 && rows.length > 1) {
                phoneIdx = rows[1].findIndex((cell: any) => cell && /^\+?[0-9\s-]{7,16}$/.test(String(cell)));
              }
              if (phoneIdx === -1) phoneIdx = rows[0]?.length > 1 ? 1 : 0;

              const hasHeader = headerRow?.some((h: any) =>
                typeof h === "string" && (h.toLowerCase().includes("name") || h.toLowerCase().includes("phone") || h.toLowerCase().includes("number"))
              );
              let total = 0, valid = 0;
              for (let i = hasHeader ? 1 : 0; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;
                const cellValue = row[phoneIdx];
                if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== "") {
                  total++;
                  if (isValidPhoneNumber(String(cellValue))) valid++;
                }
              }
              resolve({ total, valid });
            } catch { resolve({ total: 0, valid: 0 }); }
          };
          reader.readAsArrayBuffer(file);
        }).catch(() => resolve({ total: 0, valid: 0 }));
      } else {
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
            if (lines.length === 0) { resolve({ total: 0, valid: 0 }); return; }
            const hasHeader = lines[0].toLowerCase().includes("name") || lines[0].toLowerCase().includes("phone") || lines[0].toLowerCase().includes("number");
            let total = 0, valid = 0;
            (hasHeader ? lines.slice(1) : lines).forEach((line) => {
              const parts = line.split(/[,\t;]/).map((p) => p.trim());
              if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) return;
              const phone = parts.find((p) => /^\+?[0-9\s-]{7,16}$/.test(p)) ?? parts[parts.length - 1];
              if (phone) { total++; if (isValidPhoneNumber(phone)) valid++; }
            });
            resolve({ total, valid });
          } catch { resolve({ total: 0, valid: 0 }); }
        };
        reader.readAsText(file);
      }
    });
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) { setSelectedFile(null); setFileStats(null); return; }
    setSelectedFile(file);
    setParsing(true);
    setSubmitError(null);
    try {
      setFileStats(await parseContactsFile(file));
    } catch {
      setFileStats({ total: 0, valid: 0 });
    } finally {
      setParsing(false);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob(["name,phone\nJohn Doe,+1234567890\nJane Smith,+447000000000\n"], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "outbound_sample.csv";
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) { setSubmitError("Campaign name is required."); return; }
    if (!selectedFile) { setSubmitError("Please upload a contact list file."); return; }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const campaignResponse = await createCampaign({
        name: campaignName.trim(),
        script_id: selectedScript,
        schedule_type: "immediate",
        status: campaignStatus,
      });
      if (!campaignResponse?.id) throw new Error("Failed to create campaign record.");

      const uploadResponse = await uploadCampaignContacts(campaignResponse.id, selectedFile);
      setUploadResult(uploadResponse);
      
      // Invalidate the campaigns query cache to auto-refresh the list page
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });

      setSubmitSuccess(true);
      setTimeout(() => router.push("/outbound_campaign"), 2500);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const getScriptName = (scriptId: string) => {
    if (scriptId === "feedback-collection") return "Feedback Collection Script";
    if (scriptId === "reservation") return "Reservation Script";
    return scriptId;
  };

  const formatTotalTime = (validCount: number) => {
    if (!validCount) return "~0 min";
    return `~${Math.ceil((validCount * 45) / 60)} min`;
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="w-full px-[32px] pt-[32px] pb-8 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => router.push("/outbound_campaign")}
            className="text-zinc-500 hover:text-zinc-300 transition flex items-center justify-center p-1.5 rounded-full hover:bg-zinc-900 active:scale-95"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/outbound_campaign")}
            className="text-zinc-500 hover:text-zinc-300 font-semibold text-xs ml-1 select-none transition"
          >
            Outbound
          </button>
          <span className="text-zinc-700 select-none text-xs mx-1">/</span>
          <span className="text-white font-semibold text-xs select-none">New Campaign</span>
        </div>

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-white">Outbound Calling Module</h1>
          <p className="text-sm text-zinc-400 font-light">
            Upload contacts, select a script, and launch automated outbound campaigns
          </p>
        </div>

        {submitSuccess ? (
          <div className="rounded-[12px] border border-emerald-500/20 bg-emerald-950/10 p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white">Campaign Created Successfully!</h2>
            <div className="text-sm text-zinc-400 max-w-md mx-auto space-y-2">
              <p>Your outbound campaign has been registered, and the contact file parsed successfully.</p>
              {uploadResult && (
                <div className="bg-emerald-500/10 rounded-xl p-3 border border-emerald-500/20 font-semibold text-emerald-400 text-xs">
                  Added: {uploadResult.added} contacts | Skipped: {uploadResult.skipped} contacts
                </div>
              )}
            </div>
            <div className="pt-4">
              <span className="animate-spin inline-block h-5 w-5 border-2 border-emerald-500 border-t-transparent rounded-full mr-2 align-middle" />
              <span className="text-xs text-zinc-500">Redirecting to campaign list...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="rounded-[12px] border border-zinc-800 bg-[#0f0f0f] p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 mb-6 text-white">
                  <Upload size={20} />
                  <h2 className="text-lg font-bold tracking-tight">Upload Phone List for Outbound Calls</h2>
                </div>

                {submitError && (
                  <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4 text-sm text-rose-400 flex items-start gap-3">
                    <AlertCircle className="shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <p className="font-semibold">Failed to create campaign</p>
                      <p className="text-xs text-rose-400/80">{submitError}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Enter campaign name"
                    className="w-full h-12 bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide">Choose Script</label>
                  <div className="relative">
                    <select
                      value={selectedScript}
                      onChange={(e) => setSelectedScript(e.target.value)}
                      className="w-full h-12 bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-zinc-500 transition appearance-none cursor-pointer"
                    >
                      <option value="feedback-collection" className="bg-[#0f0f0f]">Feedback Collection Script</option>
                      <option value="reservation" className="bg-[#0f0f0f]">Reservation Script</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 tracking-wide">Campaign Status</label>
                  <div className="relative">
                    <select
                      value={campaignStatus}
                      onChange={(e) => setCampaignStatus(e.target.value)}
                      className="w-full h-12 bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-zinc-500 transition appearance-none cursor-pointer"
                    >
                      <option value="draft" className="bg-[#0f0f0f]">Draft</option>
                      <option value="running" className="bg-[#0f0f0f]">Running</option>
                      <option value="paused" className="bg-[#0f0f0f]">Paused</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-800" />
                  <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">UPLOAD CONTACT LIST</span>
                  <div className="flex-grow border-t border-zinc-800" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Support .csv, .xlsx, .txt files</span>
                    <button
                      type="button"
                      onClick={handleDownloadSample}
                      className="flex items-center gap-1.5 font-semibold text-zinc-400 hover:text-white transition"
                    >
                      <Download size={13} />
                      Download sample file
                    </button>
                  </div>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-[#0a0a0a] rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                      accept=".csv,.xlsx,.xls,.txt"
                      className="hidden"
                    />
                    <Upload size={32} className="mb-3 text-zinc-500" />
                    <p className="text-sm font-semibold text-white">Drop file here or click to upload</p>
                    <p className="text-xs text-zinc-500 mt-1">CSV, XLSX, or TXT</p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="flex items-center justify-between rounded-xl bg-[#0a0a0a] border border-zinc-800 px-4 h-12">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xs font-semibold truncate max-w-[280px] text-white">{selectedFile.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium uppercase shrink-0">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileChange(null)}
                      className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white transition"
                    >
                      Clear File
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || parsing || !campaignName.trim() || !selectedFile}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-white text-black font-semibold text-sm transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.98] hover:bg-zinc-200"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin text-black" size={16} />
                      Creating Campaign...
                    </>
                  ) : (
                    "Create Campaign"
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-[12px] border border-zinc-800 bg-[#0f0f0f] p-6 lg:p-8 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-white">Campaign Summary</h2>
                {!selectedFile ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                    <p className="text-xs max-w-[180px] leading-relaxed">Upload a contact list to see campaign summary</p>
                  </div>
                ) : (
                  <div className="mt-6 space-y-6">
                    {[
                      { label: "List Name", value: selectedFile.name },
                      { label: "Total Numbers", value: parsing ? null : (fileStats?.total ?? 0) },
                      { label: "Valid Numbers", value: parsing ? null : (fileStats?.valid ?? 0) },
                      { label: "Script", value: getScriptName(selectedScript) },
                      { label: "Est. Duration", value: "~45 sec/call" },
                      { label: "Total Time", value: parsing ? null : formatTotalTime(fileStats?.valid ?? 0) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                         <p className="text-xs font-semibold text-zinc-500">{label}</p>
                         <p className="mt-1 text-sm font-bold truncate text-white">
                          {value === null ? (
                            <span className="inline-block animate-pulse bg-zinc-800 h-4 w-12 rounded" />
                          ) : (
                            value
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
