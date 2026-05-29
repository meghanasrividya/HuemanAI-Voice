"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Download, RotateCw } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useOrganisationSettings } from "@/hooks/useOrganisationSettings";

// Import modularized components
import CallsFilters from "./CallsFilters";
import CallsTable from "./CallsTable";
import CallsPagination from "./CallsPagination";

// Shared single-instance Intl formatters and constants for maximum performance
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

const tzFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const getTzComponents = (date: Date) => {
  const parts = tzFormatter.format(date).split("/");
  return {
    day: Number(parts[0]),
    month: Number(parts[1]) - 1,
    year: Number(parts[2])
  };
};

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function AllCalls() {
  const { settings } = useOrganisationSettings();

  // Live API State
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCalls, setTotalCalls] = useState(0);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [subCategoryFilter, setSubCategoryFilter] = useState("All");
  const [directionFilter, setDirectionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Call Date");
  const [sortOrder, setSortOrder] = useState("Descending");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Debounce search term to prevent rapid API requests while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when category or direction or subcategory filters change
  useEffect(() => {
    setCurrentPage(1);
    if (categoryFilter !== "Reservation") {
      setSubCategoryFilter("All");
    }
  }, [categoryFilter, directionFilter, subCategoryFilter]);

  // Unmasking state (which phone numbers are visible)
  const [unmaskedCallers, setUnmaskedCallers] = useState<Record<string, boolean>>({});

  // Loading animation state for simulated refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle mask/unmask for a specific caller phone number
  const toggleMask = (callId: string) => {
    setUnmaskedCallers((prev) => ({
      ...prev,
      [callId]: !prev[callId],
    }));
  };

  // Mask function helper supporting dynamic unmasking of display_mobile_number
  const maskPhone = (phone: string, isUnmasked: boolean) => {
    const cleaned = phone.replace(/\s+/g, "");
    const last4 = cleaned.slice(-4);
    if (isUnmasked) {
      return `750121${last4}`;
    }
    return `******${last4}`;
  };

  // Fetch live calls from custom Next.js API proxy
  const fetchLiveCalls = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    // Only show loading spinner on initial load, not during silent background polling
    const showSpinner = !showRefreshState && calls.length === 0;
    if (showSpinner) setLoading(true);

    setError(null);
    try {
      // Map frontend sort variables to the backend payload keys
      const sort_by = sortBy === "Call Date" ? "call_start_time" : sortBy === "Duration" ? "duration" : "sentiment";
      const sort_order = sortOrder === "Descending" ? "DESC" : "ASC";

      const payload: any = {
        page: currentPage,
        limit: itemsPerPage,
        sort_by,
        sort_order
      };

      if (debouncedSearch.trim() !== "") {
        payload.search = debouncedSearch.trim();
        payload.q = debouncedSearch.trim();
        payload.query = debouncedSearch.trim();
        payload.search_term = debouncedSearch.trim();
      }

      if (categoryFilter !== "All") {
        payload.category = categoryFilter;
        payload.category_filter = categoryFilter;

        if (subCategoryFilter !== "All") {
          payload.sub_category = subCategoryFilter;
          payload.subCategory = subCategoryFilter;
          payload.reservation_outcome = subCategoryFilter;
          payload.outcome = subCategoryFilter;
        }
      }

      if (directionFilter !== "All") {
        payload.direction = directionFilter.toLowerCase();
        payload.call_direction = directionFilter.toLowerCase();
        payload.direction_filter = directionFilter.toLowerCase();
      }

      console.log("Fetching live calls from API (POST) with payload:", payload);

      const response = await apiClient.post("/calls", payload);

      // Extract dynamic total count from API response supporting nested objects, strings, and numbers
      if (response && response.data && typeof response.data === "object") {
        const dataObj = response.data;
        const potentialKeys = ["total", "count", "totalCount", "total_results", "total_calls", "total_records"];

        let foundTotal = null;

        // 1. Direct keys in response.data
        for (const key of potentialKeys) {
          if (dataObj[key] !== undefined && dataObj[key] !== null) {
            foundTotal = Number(dataObj[key]);
            if (!isNaN(foundTotal)) break;
          }
        }

        // 2. Nested keys under pagination or meta
        if (foundTotal === null) {
          const nestedContainers = ["pagination", "meta", "info", "summary"];
          for (const container of nestedContainers) {
            if (dataObj[container] && typeof dataObj[container] === "object") {
              for (const key of potentialKeys) {
                if (dataObj[container][key] !== undefined && dataObj[container][key] !== null) {
                  foundTotal = Number(dataObj[container][key]);
                  if (!isNaN(foundTotal)) break;
                }
              }
            }
            if (foundTotal !== null) break;
          }
        }

        if (foundTotal !== null && !isNaN(foundTotal)) {
          setTotalCalls(foundTotal);
        }
      }

      let fetchedCalls = [];
      if (response && response.data && Array.isArray(response.data.data)) {
        fetchedCalls = response.data.data;
      } else if (response && Array.isArray(response.data)) {
        fetchedCalls = response.data;
      } else if (response && response.data && Array.isArray(response.data.calls)) {
        fetchedCalls = response.data.calls;
      } else if (response && response.data && typeof response.data === "object") {
        const arrays = Object.values(response.data).filter(Array.isArray);
        if (arrays.length > 0) {
          fetchedCalls = arrays[0] as any[];
        }
      }

      if (fetchedCalls.length === 0) {
        setCalls([]);
      } else {
        const mapped = fetchedCalls.map((c: any, index: number) => {
          let durationStr = "0:00";
          let durationSecs = 0;

          // Parse duration or duration_seconds supporting both string and number representations
          const rawDurationVal = c.duration !== undefined && c.duration !== null ? c.duration : c.duration_seconds;
          if (rawDurationVal !== undefined && rawDurationVal !== null) {
            const parsedDuration = Number(rawDurationVal);
            if (!isNaN(parsedDuration)) {
              const mins = Math.floor(parsedDuration / 60);
              const secs = parsedDuration % 60;
              durationStr = `${mins}:${secs.toString().padStart(2, "0")}`;
              durationSecs = parsedDuration;
            } else {
              durationStr = String(rawDurationVal);
            }
          }

          let dateObj = new Date();
          let startTimeStr = "12:00";
          // Use c.time which is returned by the live POST API response
          const rawTimeVal = c.time || c.startTime || c.start_time || c.created_at || c.createdAt;
          if (rawTimeVal) {
            // Force timezone-less database date strings to be parsed as UTC
            let rawTimeStr = String(rawTimeVal).trim();
            if (!rawTimeStr.endsWith("Z") && !rawTimeStr.includes("+") && !rawTimeStr.includes("GMT")) {
              rawTimeStr = rawTimeStr.replace(" ", "T") + "Z";
            }

            dateObj = new Date(rawTimeStr);
            if (!isNaN(dateObj.getTime())) {
              // Explicitly format time using the shared Europe/London timeFormatter
              startTimeStr = timeFormatter.format(dateObj);

              // Calculate day difference dynamically under the Europe/London calendar perspective
              const today = new Date();
              const dateComp = getTzComponents(dateObj);
              const todayComp = getTzComponents(today);

              const parsedDateLocal = new Date(dateComp.year, dateComp.month, dateComp.day);
              const parsedTodayLocal = new Date(todayComp.year, todayComp.month, todayComp.day);

              const diffTime = parsedTodayLocal.getTime() - parsedDateLocal.getTime();
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

              if (diffDays === 1) {
                startTimeStr = `Yesterday ${startTimeStr}`;
              } else if (diffDays > 1) {
                startTimeStr = `${dateComp.day} ${MONTHS_SHORT[dateComp.month]}, ${startTimeStr}`;
              }
            } else {
              startTimeStr = String(rawTimeVal);
            }
          }

          // Parse dynamic sentiments from string or number
          const isReservation = String(c.category || "").trim().toLowerCase() === "reservation";
          let sentimentVal = isReservation ? "Neutral" : "N/A";

          if (c.sentiment !== undefined && c.sentiment !== null && String(c.sentiment).trim() !== "") {
            if (typeof c.sentiment === "number") {
              if (c.sentiment > 0.5) sentimentVal = "Positive";
              else if (c.sentiment < 0.5) sentimentVal = "Negative";
              else sentimentVal = isReservation ? "Neutral" : "N/A";
            } else {
              const strSent = String(c.sentiment).trim();
              const formatted = strSent.charAt(0).toUpperCase() + strSent.slice(1).toLowerCase();
              sentimentVal = formatted === "Neutral" ? (isReservation ? "Neutral" : "N/A") : formatted;
            }
          }

          return {
            id: c.id || c.call_id || `call_live_${index}`,
            startTime: startTimeStr,
            rawDate: dateObj,
            caller: c.name || c.caller || c.caller_name || "Not Provided",
            phone: c.display_mobile_number || c.phone || c.caller_number || c.phone_number || c.number || "+44 7700 900000",
            category: c.category || "N/A",
            subCategory: c.sub_category || c.subCategory || c.sub_type || "N/A",
            duration: durationStr,
            durationSeconds: durationSecs,
            sentiment: sentimentVal,
            direction: c.direction || "Inbound"
          };
        });

        setCalls(mapped);
      }
    } catch (err: any) {
      console.warn("Failed to fetch live calls:", err.message);
      setError("Failed to fetch live calls. Please try again.");
      setCalls([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Real-time dynamic auto-update: fetch initially and poll every 15 seconds in the background
  // Trigger API reload when page, sorting key, or sorting order is changed by the user
  useEffect(() => {
    fetchLiveCalls();

    const intervalId = setInterval(() => {
      fetchLiveCalls(false); // silent update in background
    }, 150000);

    return () => clearInterval(intervalId);
  }, [currentPage, sortBy, sortOrder, debouncedSearch, categoryFilter, directionFilter, subCategoryFilter]);

  const handleRefresh = () => {
    fetchLiveCalls(true);
  };

  const handleExport = () => {
    const headers = "Call ID,Date/Time,Caller,Phone,Category,Sub Category,Duration,Sentiment,Direction\n";
    const rows = calls.map(c =>
      `"${c.id}","${c.startTime}","${c.caller}","${c.phone}","${c.category}","${c.subCategory}","${c.duration}","${c.sentiment}","${c.direction}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `huemanai_all_calls_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCalls = useMemo(() => {
    return calls;
  }, [calls]);

  const sortedCalls = useMemo(() => {
    const sorted = [...filteredCalls];
    sorted.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "Call Date") {
        const timeA = a.rawDate instanceof Date ? a.rawDate.getTime() : 0;
        const timeB = b.rawDate instanceof Date ? b.rawDate.getTime() : 0;
        comparison = timeA - timeB;
      } else if (sortBy === "Duration") {
        comparison = (a.durationSeconds || 0) - (b.durationSeconds || 0);
      } else if (sortBy === "Sentiment") {
        comparison = (a.sentiment || "").localeCompare(b.sentiment || "");
      }

      return sortOrder === "Descending" ? -comparison : comparison;
    });
    return sorted;
  }, [filteredCalls, sortBy, sortOrder]);

  const totalCallsCount = useMemo(() => {
    return totalCalls;
  }, [totalCalls]);

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil(totalCalls / itemsPerPage), 1);
  }, [totalCalls, itemsPerPage]);

  const displayedCalls = useMemo(() => {
    return sortedCalls;
  }, [sortedCalls]);

  // Check if any filters are currently active/applied
  const hasFiltersApplied = useMemo(() => {
    return (
      searchTerm !== "" ||
      categoryFilter !== "All" ||
      subCategoryFilter !== "All" ||
      directionFilter !== "All" ||
      sortBy !== "Call Date" ||
      sortOrder !== "Descending"
    );
  }, [searchTerm, categoryFilter, subCategoryFilter, directionFilter, sortBy, sortOrder]);

  // Reset all filters to default state
  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("All");
    setSubCategoryFilter("All");
    setDirectionFilter("All");
    setSortBy("Call Date");
    setSortOrder("Descending");
    setCurrentPage(1);
  };

  return (
    <div className="flex-grow flex flex-col h-full bg-[#050505] p-4 sm:p-6 space-y-6 overflow-y-auto select-none">

      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white select-text">All Calls</h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-1 select-text">
            {totalCallsCount} calls found
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reset Filters Button */}
          {hasFiltersApplied && (
            <button
              onClick={handleResetFilters}
              className="border border-zinc-800/80 bg-[#121214] rounded-full px-5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="border border-zinc-800/80 bg-[#121214] rounded-full px-5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="border border-zinc-800/80 bg-[#121214] rounded-full px-5 py-2.5 flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/30 transition-all cursor-pointer"
          >
            <RotateCw size={15} className={isRefreshing ? "animate-spin text-purple-400" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters Sub-Component */}
      <CallsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
        directionFilter={directionFilter}
        setDirectionFilter={setDirectionFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        setCurrentPage={setCurrentPage}
      />

      {/* Table & Cards Sub-Component */}
      <div
        className="border border-zinc-900/90 rounded-xl overflow-hidden flex flex-col flex-shrink-0"
        style={{ backgroundColor: "#121214" }}
      >
        <CallsTable
          displayedCalls={displayedCalls}
          unmaskedCallers={unmaskedCallers}
          toggleMask={toggleMask}
          maskPhone={maskPhone}
          loading={loading || isRefreshing}
        />
      </div>

      {/* Pagination Sub-Component placed OUTSIDE the table card container */}
      <CallsPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalCallsCount={totalCallsCount}
      />

    </div>
  );
}
