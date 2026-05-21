"use client";

import {
    PhoneCall,
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
};

const callTypes = [
    "Inbound",
    "Outbound",
    "Reservation",
    "Support",
    "Sales",
];

export default function CallTypeFilter({
                                           value,
                                           onChange,
                                       }: Props) {
    return (
        <Select
            value={value}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-[180px]">
                <div className="flex items-center gap-2">
                    <PhoneCall className="h-4 w-4 opacity-60" />

                    <SelectValue placeholder="Call Type" />
                </div>
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">
                    All Call Types
                </SelectItem>

                {callTypes.map((type) => (
                    <SelectItem
                        key={type}
                        value={type.toLowerCase()}
                    >
                        {type}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}