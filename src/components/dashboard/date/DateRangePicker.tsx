"use client";

import { useState } from "react";

import { format } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

import { Calendar } from "./Calendar";

import { cn } from "@/lib/utils";

type Props = {
    value?: DateRange;
    onChange?: (
        value: DateRange | undefined
    ) => void;
};

export default function DateRangePicker({
                                            value,
                                            onChange,
                                        }: Props) {
    const [open, setOpen] =
        useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start text-left font-normal min-w-[260px]",
                        !value &&
                        "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />

                    {value?.from ? (
                        value.to ? (
                            <>
                                {format(
                                    value.from,
                                    "LLL dd, y"
                                )}{" "}
                                -{" "}
                                {format(
                                    value.to,
                                    "LLL dd, y"
                                )}
                            </>
                        ) : (
                            format(
                                value.from,
                                "LLL dd, y"
                            )
                        )
                    ) : (
                        <span>
              Pick a date range
            </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-auto p-0"
                align="start"
            >
                <Calendar
                    mode="range"
                    defaultMonth={value?.from}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={2}
                />
            </PopoverContent>
        </Popover>
    );
}