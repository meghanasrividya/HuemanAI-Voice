import React from "react";

interface CallsPaginationProps {
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  totalCallsCount: number;
}

export default function CallsPagination({
  currentPage,
  setCurrentPage,
  totalPages,
  totalCallsCount
}: CallsPaginationProps) {
  // Generate the page numbers sequence dynamically based on current page and total pages
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always include page 1
    pages.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={`w-9 h-7 flex items-center justify-center rounded-[10px] text-xs font-bold transition-all cursor-pointer border ${
          currentPage === 1
            ? "bg-white border-white text-black font-extrabold"
            : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-300 hover:text-white hover:border-zinc-700"
        }`}
      >
        1
      </button>
    );

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    // Render left dots if start of middle range is far from page 1
    if (start > 2) {
      pages.push(
        <span key="dots-left" className="w-9 h-7 flex items-center justify-center text-zinc-600 text-xs font-bold select-none">
          ...
        </span>
      );
    }

    // Render middle pages in the sliding window range [start, end]
    for (let p = start; p <= end; p++) {
      pages.push(
        <button
          key={p}
          onClick={() => setCurrentPage(p)}
          className={`w-9 h-7 flex items-center justify-center rounded-[10px] text-xs font-bold transition-all cursor-pointer border ${
            currentPage === p
              ? "bg-white border-white text-black font-extrabold"
              : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-300 hover:text-white hover:border-zinc-700"
          }`}
        >
          {p}
        </button>
      );
    }

    // Render right dots if end of middle range is far from last page
    if (end < totalPages - 1) {
      pages.push(
        <span key="dots-right" className="w-9 h-7 flex items-center justify-center text-zinc-600 text-xs font-bold select-none">
          ...
        </span>
      );
    }

    // Always include last page if totalPages > 1
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`w-9 h-7 flex items-center justify-center rounded-[10px] text-xs font-bold transition-all cursor-pointer border ${
            currentPage === totalPages
              ? "bg-white border-white text-black font-extrabold"
              : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-300 hover:text-white hover:border-zinc-700"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="h-[60px] px-2 sm:px-4 flex justify-between items-center bg-transparent select-none flex-shrink-0 mt-2">
      <span className="text-[10px] sm:text-[11px] font-bold text-zinc-500 tracking-wide select-text truncate max-w-[45%]">
        Showing page {currentPage} of {totalPages} ({totalCallsCount} total results)
      </span>

      <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-bold">
        {/* Previous Page Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p: number) => Math.max(p - 1, 1))}
          className="flex items-center justify-center gap-1 px-4 h-9 rounded-full border border-zinc-800 bg-[#0a0a0c] text-white hover:text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-bold"
        >
          <span>&lt; Previous</span>
        </button>

        {/* Dynamic page numbers */}
        <div className="flex items-center gap-1.5">
          {renderPageNumbers()}
        </div>

        {/* Next Page Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p: number) => Math.min(p + 1, totalPages))}
          className="flex items-center justify-center gap-1 px-4 h-9 rounded-full border border-zinc-800 bg-[#0a0a0c] text-white hover:text-zinc-200 hover:border-zinc-700 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-xs font-bold"
        >
          <span>Next &gt;</span>
        </button>
      </div>
    </div>
  );
}
