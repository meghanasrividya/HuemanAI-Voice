"use client";

import {
    Building2,
} from "lucide-react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Props = {
    value: string;

    onChange: (
        value: string
    ) => void;

    hotels: string[];
};

export default function HotelFilter({
                                        value,
                                        onChange,
                                        hotels,
                                    }: Props) {
    return (
        <Select
            value={value}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-[220px]">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 opacity-60" />

                    <SelectValue placeholder="Hotel" />
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">
                    All Hotels
                </SelectItem>

                {hotels.map((hotel) => (
                    <SelectItem
                        key={hotel}
                        value={hotel}
                    >
                        {hotel}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}