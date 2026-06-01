"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  PhoneCall,
  Calendar,
  Activity,
  Award,
  Settings,
  ArrowLeft,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { createCampaign, uploadCampaignContacts } from "@/lib/api/campaigns";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: <Layers size={15} /> },
  { name: "Calls", href: "/calls", icon: <PhoneCall size={15} /> },
  { name: "Actions", href: "/actions", icon: <Calendar size={15} /> },
  { name: "Insights", href: "/insights", icon: <Activity size={15} /> },
  { name: "Outbound", href: "/outbound_campaign", icon: <PhoneCall size={15} /> },
  { name: "Reports", href: "/reports", icon: <Award size={15} /> },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Outbound");
  const [mounted, setMounted] = useState(false);

  // Form State
  const [campaignName, setCampaignName] = useState("");
  const [selectedScript, setSelectedScript] = useState("feedback-collection");
  const [campaignStatus, setCampaignStatus] = useState("draft");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Parse State
  const [parsing, setParsing] = useState(false);
  const [fileStats, setFileStats] = useState<{ total: number; valid: number } | null>(null);
  
  // Submit State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isValidPhoneNumber = (phone: string) => {
    const cleanPhone = phone.trim().replace(/^['"]|['"]$/g, '');
    if (!cleanPhone) return false;
    // Standard phone check: allows optional +, followed by 7 to 15 digits, spaces or hyphens allowed
    return /^\+?[0-9\s-]{7,16}$/.test(cleanPhone);
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileStats(null);
      return;
    }

    setSelectedFile(file);
    setParsing(true);
    setSubmitError(null);

    try {
      const stats = await parseContactsFile(file);
      setFileStats(stats);
    } catch (err) {
      console.error("Error parsing file:", err);
      setFileStats({ total: 0, valid: 0 });
    } finally {
      setParsing(false);
    }
  };

  const parseContactsFile = async (file: File): Promise<{ total: number; valid: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (extension === "xlsx" || extension === "xls") {
        // Dynamic import of xlsx library to keep bundle size small and load on-demand
        import("xlsx").then((XLSX) => {
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              
              // We convert sheet to 2D array of rows
              const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              if (rows.length === 0) {
                resolve({ total: 0, valid: 0 });
                return;
              }

              // Let's identify the column for phone numbers.
              const headerRow = rows[0];
              let phoneIdx = -1;
              
              // Look for columns containing "phone" or "number" in header row
              if (headerRow && headerRow.length > 0) {
                phoneIdx = headerRow.findIndex(h => 
                  h && typeof h === "string" && 
                  (h.toLowerCase().includes("phone") || h.toLowerCase().includes("number"))
                );
              }

              // If no header matches, search first data row cells to find something looking like a phone
              if (phoneIdx === -1 && rows.length > 1) {
                const firstDataRow = rows[1];
                phoneIdx = firstDataRow.findIndex(cell => cell && /^\+?[0-9\s-]{7,16}$/.test(String(cell)));
              }

              // Fallback to column index 1 or index 0
              if (phoneIdx === -1) {
                phoneIdx = rows[0]?.length > 1 ? 1 : 0;
              }

              let total = 0;
              let valid = 0;

              // Check if first row is a header
              const hasHeader = headerRow && headerRow.some(h => 
                typeof h === "string" && 
                (h.toLowerCase().includes("name") || h.toLowerCase().includes("phone") || h.toLowerCase().includes("number"))
              );
              
              const startIndex = hasHeader ? 1 : 0;

              for (let i = startIndex; i < rows.length; i++) {
                const row = rows[i];
                if (!row || row.length === 0) continue;
                
                const cellValue = row[phoneIdx];
                if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== "") {
                  total++;
                  if (isValidPhoneNumber(String(cellValue))) {
                    valid++;
                  }
                }
              }
              resolve({ total, valid });
            } catch (err) {
              console.error("Error reading Excel data", err);
              resolve({ total: 0, valid: 0 });
            }
          };
          reader.readAsArrayBuffer(file);
        }).catch((err) => {
          console.error("SheetJS import failed:", err);
          // Fallback parsing as a text buffer just in case
          resolve({ total: 0, valid: 0 });
        });
      } else {
        // Parse text/csv file
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            // Split by newline and filter out empty lines
            const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length === 0) {
              resolve({ total: 0, valid: 0 });
              return;
            }

            const firstLine = lines[0];
            const hasHeader = firstLine.toLowerCase().includes("name") || 
                              firstLine.toLowerCase().includes("phone") || 
                              firstLine.toLowerCase().includes("number");
            
            const dataLines = hasHeader ? lines.slice(1) : lines;
            let total = 0;
            let valid = 0;

            dataLines.forEach(line => {
              // Parse CSV split by comma, tab, or semicolon
              const parts = line.split(/[,\t;]/).map(p => p.trim());
              if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) return;

              // Find column that matches phone validation, default to last column
              let phone = parts[parts.length - 1];
              const phoneMatch = parts.find(p => /^\+?[0-9\s-]{7,16}$/.test(p));
              if (phoneMatch) {
                phone = phoneMatch;
              }

              if (phone) {
                total++;
                if (isValidPhoneNumber(phone)) {
                  valid++;
                }
              }
            });

            resolve({ total, valid });
          } catch (err) {
            console.error("Error parsing CSV/TXT text", err);
            resolve({ total: 0, valid: 0 });
          }
        };
        reader.readAsText(file);
      }
    });
  };

  const handleDownloadSample = () => {
    const csvContent = "name,phone\nJohn Doe,+1234567890\nJane Smith,+447000000000\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "outbound_sample.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) {
      setSubmitError("Campaign name is required.");
      return;
    }
    if (!selectedFile) {
      setSubmitError("Please upload a contact list file.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // 1. Create the campaign
      const campaignResponse = await createCampaign({
        name: campaignName.trim(),
        script_id: selectedScript,
        schedule_type: "immediate",
        status: campaignStatus,
      });

      if (!campaignResponse || !campaignResponse.id) {
        throw new Error("Failed to create campaign record.");
      }

      const campaignId = campaignResponse.id;

      // 2. Upload the contact list file
      const uploadResponse = await uploadCampaignContacts(campaignId, selectedFile);
      
      setUploadResult(uploadResponse);
      setSubmitSuccess(true);
      
      // Delay navigation slightly so user sees the success state
      setTimeout(() => {
        router.push("/outbound_campaign");
      }, 2500);

    } catch (err: any) {
      console.error("Error creating campaign/uploading", err);
      // Extract error details if present
      const message = err.response?.data?.message || err.message || "An unexpected error occurred.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const getScriptName = (scriptId: string) => {
    switch (scriptId) {
      case "feedback-collection":
        return "Feedback Collection Script";
      case "reservation":
        return "Reservation Script";
      default:
        return scriptId;
    }
  };

  const formatTotalTime = (validCount: number) => {
    if (!validCount) return "~0 min";
    const totalSeconds = validCount * 45;
    const minutes = Math.ceil(totalSeconds / 60);
    return `~${minutes} min`;
  };

  if (!mounted) return null;

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
        <header className="h-[60px] shrink-0 border-b border-zinc-900 bg-[#0c0c0e] px-6 flex items-center justify-between">
          <div className="flex items-center gap-1">
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
            <span className="text-zinc-300 font-semibold text-xs select-none">
              New Campaign
            </span>
          </div>
        </header>

        {/* Scrollable content wrapper */}
        <div className="flex-1 overflow-y-auto bg-[#050505] p-6 lg:p-8">
          <div className="max-w-[1200px] mx-auto space-y-6">
            
            {/* Page Title & Breadcrumb Header */}
            <div className="space-y-1">
              <h1 className="text-[28px] font-bold tracking-tight text-white">
                Outbound Calling Module
              </h1>
              <p className="text-sm text-zinc-400 font-light">
                Upload contacts, select a script, and launch automated outbound campaigns
              </p>
            </div>

            {submitSuccess ? (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-950/10 p-8 text-center space-y-4">
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
                
                {/* Left Columns: Creation Form */}
                <div className="lg:col-span-2 space-y-6">
                  <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800/80 bg-[#0A0A0A] p-6 lg:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2.5 mb-6">
                      <Upload size={20} className="text-white" />
                      <h2 className="text-lg font-bold text-white tracking-tight">
                        Upload Phone List for Outbound Calls
                      </h2>
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

                    {/* Campaign Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 tracking-wide">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Enter campaign name"
                        className="w-full h-12 bg-[#050505] border border-zinc-800 rounded-xl px-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition"
                      />
                    </div>

                    {/* Choose Script */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 tracking-wide">
                        Choose Script
                      </label>
                      <div className="relative">
                        <select
                          value={selectedScript}
                          onChange={(e) => setSelectedScript(e.target.value)}
                          className="w-full h-12 bg-[#050505] border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-zinc-700 transition appearance-none cursor-pointer"
                        >
                          <option value="feedback-collection">Feedback Collection Script</option>
                          <option value="reservation">Reservation Script</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Campaign Status */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-300 tracking-wide">
                        Campaign Status
                      </label>
                      <div className="relative">
                        <select
                          value={campaignStatus}
                          onChange={(e) => setCampaignStatus(e.target.value)}
                          className="w-full h-12 bg-[#050505] border border-zinc-800 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-zinc-700 transition appearance-none cursor-pointer"
                        >
                          <option value="draft">Draft</option>
                          <option value="running">Running</option>
                          <option value="paused">Paused</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* File Upload Separator */}
                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-zinc-800/80"></div>
                      <span className="flex-shrink mx-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        UPLOAD CONTACT LIST
                      </span>
                      <div className="flex-grow border-t border-zinc-800/80"></div>
                    </div>

                    {/* Drag and Drop Zone */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-medium">Support .csv, .xlsx, .txt files</span>
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
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className="border border-dashed border-zinc-800 hover:border-zinc-600 bg-[#050505] hover:bg-[#070707]/60 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                          accept=".csv,.xlsx,.xls,.txt"
                          className="hidden"
                        />
                        <Upload size={32} className="text-white mb-3" />
                        <p className="text-sm font-semibold text-white">
                          Drop file here or click to upload
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          CSV, XLSX, or TXT
                        </p>
                      </div>
                    </div>

                    {/* Selected File Box */}
                    {selectedFile && (
                      <div className="flex items-center justify-between rounded-xl bg-[#050505] border border-zinc-800 px-4 h-12">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <span className="text-xs font-semibold text-white truncate max-w-[280px]">
                            {selectedFile.name}
                          </span>
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

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={submitting || parsing || !campaignName.trim() || !selectedFile}
                      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-zinc-400 hover:bg-zinc-500 text-black font-semibold text-sm transition duration-200 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed select-none active:scale-[0.98]"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Creating Campaign...
                        </>
                      ) : (
                        "Create Campaign"
                      )}
                    </button>
                  </form>
                </div>

                {/* Right Column: Campaign Summary */}
                <div className="lg:col-span-1">
                  <div className="rounded-2xl border border-zinc-800/80 bg-[#0A0A0A] p-6 lg:p-8 shadow-sm flex flex-col">
                    <div>
                      <h2 className="text-lg font-bold text-white mb-6">
                        Campaign Summary
                      </h2>

                      {!selectedFile ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                          <p className="text-xs max-w-[180px] leading-relaxed">
                            Upload a contact list to see campaign summary
                          </p>
                        </div>
                      ) : (
                        <div className="mt-6 space-y-6">
                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              List Name
                            </p>
                            <p className="mt-1 text-sm font-bold text-white truncate" title={selectedFile.name}>
                              {selectedFile.name}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              Total Numbers
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              {parsing ? (
                                <span className="inline-block animate-pulse bg-zinc-800 h-4 w-12 rounded animate-spin" />
                              ) : (
                                fileStats?.total ?? 0
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              Valid Numbers
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              {parsing ? (
                                <span className="inline-block animate-pulse bg-zinc-800 h-4 w-12 rounded animate-spin" />
                              ) : (
                                fileStats?.valid ?? 0
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              Script
                            </p>
                            <p className="mt-1 text-sm font-bold text-white truncate">
                              {getScriptName(selectedScript)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              Est. Duration
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              ~45 sec/call
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-zinc-400">
                              Total Time
                            </p>
                            <p className="mt-1 text-sm font-bold text-white">
                              {parsing ? (
                                <span className="inline-block animate-pulse bg-zinc-800 h-4 w-12 rounded" />
                              ) : (
                                formatTotalTime(fileStats?.valid ?? 0)
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
