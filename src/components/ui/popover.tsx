"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface PopoverContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextValue>({
    open: false,
    setOpen: () => {},
});

function Popover({
    children,
    open: controlledOpen,
    onOpenChange,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = (value: boolean) => {
        setInternalOpen(value);
        onOpenChange?.(value);
    };
    return (
        <PopoverContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block">{children}</div>
        </PopoverContext.Provider>
    );
}

function PopoverTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const { setOpen, open } = React.useContext(PopoverContext);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setOpen(!open);
            },
        });
    }
    return (
        <button type="button" onClick={() => setOpen(!open)}>
            {children}
        </button>
    );
}

function PopoverContent({
    children,
    className,
    align = "center",
    sideOffset = 4,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    align?: "start" | "center" | "end";
    sideOffset?: number;
}) {
    const { open, setOpen } = React.useContext(PopoverContext);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [open, setOpen]);

    if (!open) return null;

    const alignClass = align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                alignClass,
                className
            )}
            style={{ top: `calc(100% + ${sideOffset}px)` }}
            {...props}
        >
            {children}
        </div>
    );
}

export { Popover, PopoverTrigger, PopoverContent };
