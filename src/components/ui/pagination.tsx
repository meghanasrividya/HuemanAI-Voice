"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationControlsProps {
    pagination: { page: number; limit: number; total: number };
    onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const current = pagination.page;

    if (totalPages <= 1) return null;

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 mt-2">
            <div className="text-xs sm:text-sm text-zinc-400">
                Showing page {current} of {totalPages} ({pagination.total} total results)
            </div>

            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(current - 1)}
                    disabled={current <= 1}
                    className="gap-1 hover:bg-zinc-900 text-zinc-300 font-medium px-3 h-9 text-xs"
                >
                    <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>

                {pageNumbers.map((page) => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={cn(
                            "h-8 w-8 flex items-center justify-center rounded-full text-xs font-semibold transition-all cursor-pointer",
                            current === page
                                ? "bg-white text-black font-bold shadow-sm"
                                : "hover:bg-zinc-900 text-zinc-400"
                        )}
                    >
                        {page}
                    </button>
                ))}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPageChange(current + 1)}
                    disabled={current >= totalPages}
                    className="gap-1 hover:bg-zinc-900 text-zinc-300 font-medium px-3 h-9 text-xs"
                >
                    Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    );
}
