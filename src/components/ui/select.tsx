"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectCtx = {
    open: boolean;
    setOpen: (open: boolean) => void;
    value: string;
    setValue: (value: string) => void;
};

const SelectContext =
    React.createContext<SelectCtx | null>(
        null
    );

function useSelectContext() {
    const ctx = React.useContext(SelectContext);
    if (!ctx) {
        throw new Error(
            "Select components must be used inside Select"
        );
    }
    return ctx;
}

export function Select({
    value,
    onValueChange,
    children,
}: {
    value: string;
    onValueChange: (value: string) => void;
    children: React.ReactNode;
}) {
    const [open, setOpen] =
        React.useState(false);

    return (
        <SelectContext.Provider
            value={{
                open,
                setOpen,
                value,
                setValue: onValueChange,
            }}
        >
            <div className="relative inline-block w-full">
                {children}
            </div>
        </SelectContext.Provider>
    );
}

export function SelectTrigger({
    className,
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    const { open, setOpen } =
        useSelectContext();

    return (
        <button
            type="button"
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
                className
            )}
            onClick={() => setOpen(!open)}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
}

export function SelectValue({
    placeholder,
}: {
    placeholder?: string;
}) {
    const { value } = useSelectContext();
    return (
        <span className="line-clamp-1">
            {value || placeholder || ""}
        </span>
    );
}

export function SelectContent({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const { open, setOpen } =
        useSelectContext();
    const ref = React.useRef<HTMLDivElement>(
        null
    );

    React.useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(
                    e.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        if (open) {
            document.addEventListener(
                "mousedown",
                onDocClick
            );
        }
        return () =>
            document.removeEventListener(
                "mousedown",
                onDocClick
            );
    }, [open, setOpen]);

    if (!open) return null;

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                className
            )}
        >
            {children}
        </div>
    );
}

export function SelectItem({
    value,
    className,
    children,
}: {
    value: string;
    className?: string;
    children: React.ReactNode;
}) {
    const {
        value: selected,
        setValue,
        setOpen,
    } = useSelectContext();

    return (
        <button
            type="button"
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent",
                selected === value &&
                    "bg-accent",
                className
            )}
            onClick={() => {
                setValue(value);
                setOpen(false);
            }}
        >
            {children}
        </button>
    );
}
