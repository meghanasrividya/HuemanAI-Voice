"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Ctx = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const DropdownMenuContext =
    React.createContext<Ctx | null>(null);

function useDropdownMenuContext() {
    const ctx = React.useContext(
        DropdownMenuContext
    );

    if (!ctx) {
        throw new Error(
            "DropdownMenu components must be used inside DropdownMenu"
        );
    }

    return ctx;
}

export function DropdownMenu({
    children,
}: {
    children: React.ReactNode;
}) {
    const [open, setOpen] =
        React.useState(false);

    return (
        <DropdownMenuContext.Provider
            value={{ open, setOpen }}
        >
            <div className="relative inline-block">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
}

export function DropdownMenuTrigger({
    asChild,
    children,
}: {
    asChild?: boolean;
    children: React.ReactElement;
}) {
    const { open, setOpen } =
        useDropdownMenuContext();

    if (asChild) {
        return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            onClick: (e: React.MouseEvent<HTMLElement>) => {
                (children.props as React.HTMLAttributes<HTMLElement>).onClick?.(e);
                setOpen(!open);
            },
        });
    }

    return (
        <button
            type="button"
            onClick={() => setOpen(!open)}
        >
            {children}
        </button>
    );
}

export function DropdownMenuContent({
    children,
    className,
    align = "start",
}: {
    children: React.ReactNode;
    className?: string;
    align?: "start" | "end" | "center";
}) {
    const { open, setOpen } =
        useDropdownMenuContext();
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
                "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                align === "end" &&
                    "right-0",
                align === "start" &&
                    "left-0",
                className
            )}
        >
            {children}
        </div>
    );
}

export function DropdownMenuItem({
    className,
    onClick,
    children,
    disabled,
}: {
    className?: string;
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
}) {
    const { setOpen } =
        useDropdownMenuContext();

    return (
        <button
            type="button"
            disabled={disabled}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className
            )}
            onClick={() => {
                if (disabled) return;
                onClick?.();
                setOpen(false);
            }}
        >
            {children}
        </button>
    );
}
