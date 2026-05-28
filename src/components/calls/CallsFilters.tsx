import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  minWidth?: string;
}

function CustomDropdown({ value, onChange, options, minWidth = "120px" }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative flex-grow sm:flex-initial" style={{ minWidth }} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between bg-[#121214] rounded-full py-2 pl-4 pr-10 text-xs font-semibold text-zinc-200 cursor-pointer w-full text-left transition-all focus:outline-none ${
          isOpen
            ? "border border-white ring-2 ring-white ring-offset-2 ring-offset-black"
            : "border border-zinc-800/80 hover:border-zinc-700"
        }`}
      >
        <span className="truncate">{selectedOption.label}</span>
        <span className="absolute inset-y-0 right-3.5 flex items-center text-zinc-400 pointer-events-none">
          <ChevronDown size={13} className="opacity-90" />
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-[#121214] border border-[#2a2a30] rounded-xl overflow-hidden shadow-xl select-none">
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isLast = idx === options.length - 1;
            return (
              <div
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`px-4 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                  isLast ? "" : "border-b border-[#2a2a30]"
                } ${
                  isSelected
                    ? "bg-[#7cb6ff] text-black"
                    : "text-zinc-300 hover:bg-[#7cb6ff] hover:text-black"
                }`}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface CallsFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  directionFilter: string;
  setDirectionFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: string;
  setSortOrder: (val: string) => void;
  setCurrentPage: (page: number) => void;
}

export default function CallsFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  directionFilter,
  setDirectionFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setCurrentPage
}: CallsFiltersProps) {
  return (
    <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between w-full select-none">
      {/* Search Input */}
      <div className="relative flex-grow max-w-full xl:max-w-[420px]">
        <span className="absolute inset-y-0 left-3.5 flex items-center text-zinc-500">
          <Search size={14} className="opacity-70" />
        </span>
        <input
          type="text"
          placeholder="Search calls by number, site, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[#121214] border border-zinc-800/60 rounded-full py-2 pl-10 pr-4 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all"
        />
      </div>

      {/* Dropdowns Filters Row */}
      <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center w-full xl:w-auto justify-start sm:justify-end">
        {/* Category Dropdown */}
        <CustomDropdown
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: "All", label: "All Categories" },
            { value: "Reservation", label: "Reservation" }
          ]}
          minWidth="140px"
        />

        {/* Direction Dropdown */}
        <CustomDropdown
          value={directionFilter}
          onChange={(val) => {
            setDirectionFilter(val);
            setCurrentPage(1);
          }}
          options={[
            { value: "All", label: "All Directions" },
            { value: "Inbound", label: "Inbound" },
            { value: "Outbound", label: "Outbound" }
          ]}
          minWidth="130px"
        />

        {/* Sort By Section */}
        <div className="flex gap-3 items-center flex-1 sm:flex-initial">
          <span className="text-zinc-500 text-xs font-semibold whitespace-nowrap">Sort by:</span>
          <CustomDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "Call Date", label: "Call Date" }
            ]}
            minWidth="120px"
          />
        </div>

        {/* Sort Order Dropdown */}
        <CustomDropdown
          value={sortOrder}
          onChange={(val) => setSortOrder(val)}
          options={[
            { value: "Descending", label: "Descending" },
            { value: "Ascending", label: "Ascending" }
          ]}
          minWidth="120px"
        />
      </div>
    </div>
  );
}
