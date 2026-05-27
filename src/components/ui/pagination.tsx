"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
    pagination: { page: number; limit: number; total: number };
    onPageChange: (page: number) => void;
}

export function PaginationControls({ pagination, onPageChange }: PaginationControlsProps) {
    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const current = pagination.page;

    return (
        <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => onPageChange(current - 1)} disabled={current <= 1} className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground">Page {current} of {totalPages}</span>
            <Button variant="ghost" size="sm" onClick={() => onPageChange(current + 1)} disabled={current >= totalPages} className="gap-1">
                Next <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
