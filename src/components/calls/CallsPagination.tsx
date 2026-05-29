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
  // Generate the page numbers sequence: e.g. 1, 2, ..., 110
  const renderPageNumbers = () => {
    const pages = [];
    
    // Always include page 1
    pages.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer border ${
          currentPage === 1
            ? "bg-white border-white text-black font-extrabold"
            : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700"
        }`}
      >
        1
      </button>
    );

    // Render left dots if current page is far from beginning
    if (currentPage > 3) {
      pages.push(
        <span key="dots-left" className="w-7 h-7 flex items-center justify-center text-zinc-600 text-xs font-bold select-none">
          ...
        </span>
      );
    } else if (totalPages > 2 && currentPage === 3 && currentPage !== totalPages) {
      pages.push(
        <button
          key={2}
          onClick={() => setCurrentPage(2)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer border border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700"
        >
          2
        </button>
      );
    } else if (totalPages > 2 && currentPage === 1) {
      // Show page 2 if we are on page 1 for smooth transition
      pages.push(
        <button
          key={2}
          onClick={() => setCurrentPage(2)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
        >
          2
        </button>
      );
    }

    // Render middle current page if it is not page 1 or totalPages
    if (currentPage > 1 && currentPage < totalPages) {
      if (currentPage !== 2) {
        pages.push(
          <button
            key={currentPage}
            className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-extrabold bg-white border border-white text-black transition-all"
          >
            {currentPage}
          </button>
        );
      } else {
        pages.push(
          <button
            key={2}
            className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-extrabold bg-white border border-white text-black transition-all"
          >
            2
          </button>
        );
      }
    }

    // Render right dots if current page is far from end
    if (currentPage < totalPages - 2) {
      pages.push(
        <span key="dots-right" className="w-7 h-7 flex items-center justify-center text-zinc-600 text-xs font-bold select-none">
          ...
        </span>
      );
    } else if (currentPage === totalPages - 2 && totalPages > 3) {
      const penUltimate = totalPages - 1;
      pages.push(
        <button
          key={penUltimate}
          onClick={() => setCurrentPage(penUltimate)}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer border ${
            currentPage === penUltimate
              ? "bg-white border-white text-black font-extrabold"
              : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700"
          }`}
        >
          {penUltimate}
        </button>
      );
    } else if (currentPage === totalPages && totalPages > 2) {
      // Show second to last page if we are on the last page
      const secondToLast = totalPages - 1;
      pages.push(
        <button
          key={secondToLast}
          onClick={() => setCurrentPage(secondToLast)}
          className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold border border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
        >
          {secondToLast}
        </button>
      );
    }

    // Always include last page if totalPages > 1
    if (totalPages > 1) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all cursor-pointer border ${
            currentPage === totalPages
              ? "bg-white border-white text-black font-extrabold"
              : "border-[#1f1f23] bg-[#0a0a0c] text-zinc-400 hover:text-white hover:border-zinc-700"
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

      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold">
        {/* Previous Page Button */}
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p: number) => Math.max(p - 1, 1))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1f1f23] text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none bg-[#0a0a0c] cursor-pointer text-xs"
        >
          <span>&lt; Previous</span>
        </button>

        {/* Dynamic page numbers */}
        <div className="flex items-center gap-0.5">
          {renderPageNumbers()}
        </div>

        {/* Next Page Button */}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p: number) => Math.min(p + 1, totalPages))}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#1f1f23] text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors disabled:opacity-30 disabled:pointer-events-none bg-[#0a0a0c] cursor-pointer text-xs"
        >
          <span>Next &gt;</span>
        </button>
      </div>
    </div>
  );
}
