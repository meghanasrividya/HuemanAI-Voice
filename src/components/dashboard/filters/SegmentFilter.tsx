"use client";

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

    options: string[];

    placeholder?: string;
};

export default function SegmentFilter({
                                          value,
                                          onChange,
                                          options,
                                          placeholder = "Segment",
                                      }: Props) {
    return (
        <Select
            value={value}
            onValueChange={onChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue
                    placeholder={
                        placeholder
                    }
                />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value="all">
                    All Segments
                </SelectItem>

                {options.map((option) => (
                    <SelectItem
                        key={option}
                        value={option}
                    >
                        {option}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}