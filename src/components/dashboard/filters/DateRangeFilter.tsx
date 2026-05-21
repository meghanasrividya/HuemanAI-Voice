"use client";

import {
    CalendarDays,
    ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
    label?: string;
    value?: string;
    onClick?: () => void;
};

export default function DateRangeFilter({
                                            label = "Date Range",
                                            value,
                                            onClick,
                                        }: Props) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className="h-10 gap-2 rounded-xl"
        >
            <CalendarDays className="h-4 w-4" />

            <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {value || label}
        </span>

                <ChevronDown className="h-4 w-4 opacity-60" />
            </div>
        </Button>
    );
}