import React from "react";
import { Search } from "lucide-react";

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

function CustomDropdown({ value, onChange, options, minWidth = "140px" }: CustomDropdownProps) {
  return (
    <div className="relative flex-grow sm:flex-initial" style={{ minWidth }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#121214] rounded-full py-2 px-4 pr-10 text-sm font-bold text-zinc-200 border border-zinc-800/80 hover:border-zinc-700 cursor-pointer focus:outline-none focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath stroke='%23a1a1aa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
          backgroundPosition: 'right 14px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px'
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#121214] text-zinc-300 font-medium py-2"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface CallsFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  subCategoryFilter: string;
  setSubCategoryFilter: (val: string) => void;
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
  subCategoryFilter,
  setSubCategoryFilter,
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
      <div className="relative flex-grow max-w-full xl:max-w-[460px]">
        <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500">
          <Search size={16} className="opacity-70" />
        </span>
        <input
          type="text"
          placeholder="Search calls by number, site, or category..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-[#121214] border border-zinc-800/60 rounded-full py-3 pl-12 pr-6 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black transition-all"
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
            ...(directionFilter === "Outbound" ? [{ value: "Feedback", label: "Feedback" }] : []),
            { value: "Reservation", label: "Reservation" }
          ]}
          minWidth="160px"
        />

        {/* Reservation Outcomes Dropdown - Shows only when Reservation category is selected */}
        {categoryFilter === "Reservation" && (
          <CustomDropdown
            value={subCategoryFilter}
            onChange={(val) => {
              setSubCategoryFilter(val);
              setCurrentPage(1);
            }}
            options={[
              { value: "All", label: "All Reservation Outcomes" },
              { value: "Booking Secured", label: "Booking Secured" },
              { value: "Enquiry Handled", label: "Enquiry Handled" },
              { value: "Large Party Bookings", label: "Large Party Bookings" },
              { value: "Promotional / Offer", label: "Promotional / Offer" },
              { value: "Transferred to Staff", label: "Transferred to Staff" },
              { value: "Booking Cancelled", label: "Booking Cancelled" },
              { value: "General Assistance", label: "General Assistance" },
              { value: "Calls After Hours", label: "Calls After Hours" },
              { value: "Successful Upsells", label: "Successful Upsells" }
            ]}
            minWidth="230px"
          />
        )}

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
          minWidth="150px"
        />

        {/* Sort By Section */}
        <div className="flex gap-3 items-center flex-1 sm:flex-initial">
          <span className="text-zinc-400 text-sm font-semibold whitespace-nowrap">Sort by:</span>
          <CustomDropdown
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: "Call Date", label: "Call Date" }
            ]}
            minWidth="140px"
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
          minWidth="140px"
        />
      </div>
    </div>
  );
}
