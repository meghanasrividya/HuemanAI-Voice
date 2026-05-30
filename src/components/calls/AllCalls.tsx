"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Download, RotateCw, X, Calendar, ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
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
    if (directionFilter !== "Outbound" && categoryFilter === "Feedback") {
      setCategoryFilter("All");
    }
    if (categoryFilter !== "Reservation") {
      setSubCategoryFilter("All");
    }
  }, [categoryFilter, directionFilter, subCategoryFilter]);

  // Unmasking state (which phone numbers are visible)
  const [unmaskedCallers, setUnmaskedCallers] = useState<Record<string, boolean>>({});

  // Loading animation state for simulated refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Export Calls Modal & Custom DatePicker states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalStartDate, setModalStartDate] = useState("2026-04-29");
  const [modalEndDate, setModalEndDate] = useState("2026-05-29");
  const [modalCategory, setModalCategory] = useState("All Categories");
  const [modalDirection, setModalDirection] = useState("All Directions");
  const [modalStatus, setModalStatus] = useState("Ended");
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDirectionDropdown, setShowDirectionDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [startCalendarMonthDate, setStartCalendarMonthDate] = useState(new Date(2026, 3, 29)); // April 2026
  const [endCalendarMonthDate, setEndCalendarMonthDate] = useState(new Date(2026, 4, 29)); // May 2026

  // Automatically open the Start Date calendar popup when modal is triggered
  useEffect(() => {
    if (isExportModalOpen) {
      setShowStartCalendar(true);
      setShowEndCalendar(false);
      setShowCategoryDropdown(false);
      setShowDirectionDropdown(false);
      setShowStatusDropdown(false);
      setStartCalendarMonthDate(new Date(2026, 3, 29)); // April 2026
      setEndCalendarMonthDate(new Date(2026, 4, 29)); // May 2026
    }
  }, [isExportModalOpen]);

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
          let sentimentVal = "N/A";
          if (c.sentiment !== undefined && c.sentiment !== null && String(c.sentiment).trim() !== "") {
            const rawVal = c.sentiment;
            const parsedNum = Number(rawVal);
            if (!isNaN(parsedNum) && typeof rawVal !== "boolean" && String(rawVal).trim() !== "") {
              if (parsedNum >= 0 && parsedNum <= 0.34) {
                sentimentVal = "Negative";
              } else if ((parsedNum >= 0.35 && parsedNum <= 0.74) || (parsedNum >= 3.5 && parsedNum <= 7.4)) {
                sentimentVal = "Neutral";
              } else if (parsedNum >= 0.75 || parsedNum >= 7.5) {
                sentimentVal = "Positive";
              } else {
                sentimentVal = "Neutral";
              }
            } else {
              const strSent = String(rawVal).trim();
              if (strSent.toLowerCase() === "n/a") {
                sentimentVal = "N/A";
              } else {
                sentimentVal = strSent.charAt(0).toUpperCase() + strSent.slice(1).toLowerCase();
              }
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
    setIsExportModalOpen(true);
  };

  const executeExport = async () => {
    setIsExporting(true);
    try {
      // Only send startDate and endDate — exactly what the API accepts
      const payload = {
        startDate: modalStartDate,
        endDate: modalEndDate
      };

      console.log("Calling export CSV endpoint with payload:", payload);

      // Call the dedicated CSV export endpoint — returns blob
      const response = await apiClient.post("/calls/export/csv", payload, {
        responseType: "blob"
      });

      // Trigger browser download
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `calls_export_${modalStartDate}_to_${modalEndDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setIsExporting(false);
      setIsExportModalOpen(false);
    }
  };

  const handleStartDateChange = (val: string) => {
    setModalStartDate(val);
    const parts = val.split("-");
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12 && d > 0 && d <= 31) {
        const parsedDate = new Date(y, m, d);
        if (!isNaN(parsedDate.getTime())) {
          setStartCalendarMonthDate(parsedDate);
        }
      }
    }
  };

  const handleEndDateChange = (val: string) => {
    setModalEndDate(val);
    const parts = val.split("-");
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d) && m >= 0 && m < 12 && d > 0 && d <= 31) {
        const parsedDate = new Date(y, m, d);
        if (!isNaN(parsedDate.getTime())) {
          setEndCalendarMonthDate(parsedDate);
        }
      }
    }
  };

  const renderCustomCalendar = (type: "start" | "end") => {
    const currentMonthDate = type === "start" ? startCalendarMonthDate : endCalendarMonthDate;
    const setMonthDate = type === "start" ? setStartCalendarMonthDate : setEndCalendarMonthDate;
    const selectedStr = type === "start" ? modalStartDate : modalEndDate;
    const setSelectedStr = type === "start" ? setModalStartDate : setModalEndDate;

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);

    const days = [];

    // Prev month filler
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
        isCurrentMonth: false
      });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    // Next month filler
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(nextYear, nextMonth, i),
        isCurrentMonth: false
      });
    }

    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMonthDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMonthDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (dayDate: Date, e: React.MouseEvent) => {
      e.stopPropagation();
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      setSelectedStr(dateStr);
      if (type === "start") {
        setShowStartCalendar(false);
      } else {
        setShowEndCalendar(false);
      }
    };

    const isSelected = (dayDate: Date) => {
      const y = dayDate.getFullYear();
      const m = String(dayDate.getMonth() + 1).padStart(2, "0");
      const d = String(dayDate.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}` === selectedStr;
    };

    return (
      <div className="select-none text-white font-sans w-full">
        {/* Month Heading */}
        <div className="flex items-center justify-between mb-3.5 px-0.5">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-800/60 flex items-center justify-center"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-bold tracking-wide">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-zinc-800/60 flex items-center justify-center"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {weekdays.map((wd) => (
            <span key={wd} className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider py-1">
              {wd}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, idx) => {
            const selected = isSelected(day.date);
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDayClick(day.date, e)}
                className={`w-7.5 h-7.5 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer mx-auto ${selected
                  ? "bg-white text-black font-extrabold"
                  : day.isCurrentMonth
                    ? "text-zinc-200 hover:bg-zinc-800/60"
                    : "text-zinc-600 hover:bg-zinc-800/30"
                  }`}
              >
                {day.date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
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
          onClearFilters={handleResetFilters}
        />
      </div>

      {/* Pagination Sub-Component placed OUTSIDE the table card container */}
      <CallsPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        totalCallsCount={totalCallsCount}
      />

      {/* Export Calls Modal overlay */}
      {isExportModalOpen && (
        <div
          onClick={() => {
            setShowStartCalendar(false);
            setShowEndCalendar(false);
            setShowCategoryDropdown(false);
            setShowDirectionDropdown(false);
            setShowStatusDropdown(false);
            setIsExportModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setShowStartCalendar(false);
              setShowEndCalendar(false);
              setShowCategoryDropdown(false);
              setShowDirectionDropdown(false);
              setShowStatusDropdown(false);
            }}
            className="bg-[#070709] border border-zinc-800 rounded-2xl w-full max-w-[480px] flex flex-col shadow-2xl relative overflow-visible"
          >
            {/* Scrollable Container */}
            <div className="p-6 space-y-6 relative z-10">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Export Calls</h2>
                  <p className="text-zinc-500 text-xs mt-1">Select filters to export calls data as CSV</p>
                </div>
                <button
                  onClick={() => setIsExportModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-zinc-900/40 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Start Date Field */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-zinc-300">Start Date *</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStartCalendar(!showStartCalendar);
                    setShowEndCalendar(false);
                    setShowCategoryDropdown(false);
                    setShowDirectionDropdown(false);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full bg-[#0a0a0c] border rounded-xl py-3 px-4 flex justify-between items-center text-zinc-200 cursor-text transition-all duration-200 ${showStartCalendar ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black font-medium" : "border-zinc-800/80 hover:border-zinc-700 font-medium"
                    }`}
                >
                  <input
                    type="text"
                    value={modalStartDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStartCalendar(true);
                      setShowEndCalendar(false);
                      setShowCategoryDropdown(false);
                      setShowDirectionDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                    className="bg-transparent text-[13px] font-medium text-zinc-200 focus:outline-none w-full cursor-text"
                  />
                  <Calendar size={16} className="text-zinc-400 ml-2 flex-shrink-0 cursor-pointer" />
                </div>

                {/* Custom Calendar Dropdown for Start Date */}
                {showStartCalendar && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-[78px] left-0 w-[328px] z-50 bg-[#121214] border border-zinc-800 rounded-2xl p-4 shadow-2xl"
                  >
                    {renderCustomCalendar("start")}
                  </div>
                )}
              </div>

              {/* End Date Field */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-zinc-300">End Date *</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEndCalendar(!showEndCalendar);
                    setShowStartCalendar(false);
                    setShowCategoryDropdown(false);
                    setShowDirectionDropdown(false);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full bg-[#0a0a0c] border rounded-xl py-3 px-4 flex justify-between items-center text-zinc-200 cursor-text transition-all duration-200 ${showEndCalendar ? "border-white ring-2 ring-white ring-offset-2 ring-offset-black font-medium" : "border-zinc-800/80 hover:border-zinc-700 font-medium"
                    }`}
                >
                  <input
                    type="text"
                    value={modalEndDate}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEndCalendar(true);
                      setShowStartCalendar(false);
                      setShowCategoryDropdown(false);
                      setShowDirectionDropdown(false);
                      setShowStatusDropdown(false);
                    }}
                    className="bg-transparent text-[13px] font-medium text-zinc-200 focus:outline-none w-full cursor-text"
                  />
                  <Calendar size={16} className="text-zinc-400 ml-2 flex-shrink-0 cursor-pointer" />
                </div>

                {/* Custom Calendar Dropdown for End Date */}
                {showEndCalendar && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-[78px] left-0 w-[328px] z-50 bg-[#121214] border border-zinc-800 rounded-2xl p-4 shadow-2xl"
                  >
                    {renderCustomCalendar("end")}
                  </div>
                )}
              </div>

              {/* Category Field */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-zinc-300">Category</label>
                <div className="relative">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCategoryDropdown(!showCategoryDropdown);
                      setShowDirectionDropdown(false);
                      setShowStatusDropdown(false);
                      setShowStartCalendar(false);
                      setShowEndCalendar(false);
                    }}
                    className="w-full bg-[#0a0a0c] border border-zinc-800/80 hover:border-zinc-700 rounded-xl py-3 px-4 flex justify-between items-center text-zinc-200 cursor-pointer transition-all duration-200 font-medium"
                  >
                    <span className="text-[13px] font-medium">{modalCategory}</span>
                    <ChevronDown size={16} className="text-zinc-400" />
                  </div>

                  {showCategoryDropdown && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[52px] left-0 w-full z-50 bg-[#121214] border border-zinc-800 rounded-xl p-1.5 shadow-2xl space-y-1"
                    >
                      {["All Categories", "Reservation"].map((opt) => {
                        const selected = modalCategory === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setModalCategory(opt);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer ${selected
                              ? "bg-zinc-800/60 text-white"
                              : "text-zinc-300 hover:text-white hover:bg-zinc-800/30"
                              }`}
                          >
                            <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                              {selected && <Check size={14} className="text-white" />}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Call Direction Field */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-zinc-300">Call Direction</label>
                <div className="relative">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDirectionDropdown(!showDirectionDropdown);
                      setShowCategoryDropdown(false);
                      setShowStatusDropdown(false);
                      setShowStartCalendar(false);
                      setShowEndCalendar(false);
                    }}
                    className="w-full bg-[#0a0a0c] border border-zinc-800/80 hover:border-zinc-700 rounded-xl py-3 px-4 flex justify-between items-center text-zinc-200 cursor-pointer transition-all duration-200 font-medium"
                  >
                    <span className="text-[13px] font-medium">{modalDirection}</span>
                    <ChevronDown size={16} className="text-zinc-400" />
                  </div>

                  {showDirectionDropdown && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[52px] left-0 w-full z-50 bg-[#121214] border border-zinc-800 rounded-xl p-1.5 shadow-2xl space-y-1"
                    >
                      {["All Directions", "Inbound", "Outbound"].map((opt) => {
                        const selected = modalDirection === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setModalDirection(opt);
                              setShowDirectionDropdown(false);
                            }}
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer ${selected
                              ? "bg-zinc-800/60 text-white"
                              : "text-zinc-300 hover:text-white hover:bg-zinc-800/30"
                              }`}
                          >
                            <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                              {selected && <Check size={14} className="text-white" />}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Call Status Field */}
              <div className="space-y-2 relative">
                <label className="text-xs font-bold text-zinc-300">Call Status</label>
                <div className="relative">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusDropdown(!showStatusDropdown);
                      setShowCategoryDropdown(false);
                      setShowDirectionDropdown(false);
                      setShowStartCalendar(false);
                      setShowEndCalendar(false);
                    }}
                    className="w-full bg-[#0a0a0c] border border-zinc-800/80 hover:border-zinc-700 rounded-xl py-3 px-4 flex justify-between items-center text-zinc-200 cursor-pointer transition-all duration-200 font-medium"
                  >
                    <span className="text-[13px] font-medium">{modalStatus}</span>
                    <ChevronDown size={16} className="text-zinc-400" />
                  </div>

                  {showStatusDropdown && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-[52px] left-0 w-full z-50 bg-[#121214] border border-zinc-800 rounded-xl p-1.5 shadow-2xl space-y-1"
                    >
                      {["Ended", "Active", "All"].map((opt) => {
                        const selected = modalStatus === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setModalStatus(opt);
                              setShowStatusDropdown(false);
                            }}
                            className={`w-full text-left py-1.5 px-3 rounded-lg text-[13px] font-medium transition-all flex items-center gap-2 cursor-pointer ${selected
                              ? "bg-zinc-800/60 text-white"
                              : "text-zinc-300 hover:text-white hover:bg-zinc-800/30"
                              }`}
                          >
                            <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                              {selected && <Check size={14} className="text-white" />}
                            </div>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer Buttons Row */}
            <div className="p-6 bg-[#070709] flex justify-end items-center gap-3 rounded-b-2xl relative z-0">
              <button
                onClick={() => setIsExportModalOpen(false)}
                disabled={isExporting}
                className="border border-zinc-800 bg-[#121214] text-zinc-300 hover:text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={executeExport}
                disabled={isExporting}
                className="bg-white text-black hover:bg-zinc-200 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download size={15} />
                    <span>Export</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
