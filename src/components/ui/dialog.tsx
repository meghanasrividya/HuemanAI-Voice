"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface DialogContextValue {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue>({
    open: false,
    setOpen: () => {},
});

function Dialog({
    children,
    open: controlledOpen,
    onOpenChange,
}: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
}

function DialogTrigger({
    children,
    asChild,
}: {
    children: React.ReactNode;
    asChild?: boolean;
}) {
    const { setOpen } = React.useContext(DialogContext);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            onClick: () => setOpen(true),
        });
    }
    return <button onClick={() => setOpen(true)}>{children}</button>;
}

function DialogPortal({ children }: { children: React.ReactNode }) {
    const { open } = React.useContext(DialogContext);
    if (!open) return null;
    return <>{children}</>;
}

function DialogOverlay({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const { setOpen } = React.useContext(DialogContext);
    return (
        <div
            className={cn(
                "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                className
            )}
            onClick={() => setOpen(false)}
            {...props}
        />
    );
}

function DialogContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    const { setOpen } = React.useContext(DialogContext);
    return (
        <DialogPortal>
            <DialogOverlay />
            <div
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    onClick={() => setOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </DialogPortal>
    );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
    );
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
    );
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
    );
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p className={cn("text-sm text-muted-foreground", className)} {...props} />
    );
}

function DialogClose({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) {
    const { setOpen } = React.useContext(DialogContext);
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            onClick: () => setOpen(false),
        });
    }
    return <button onClick={() => setOpen(false)}>{children}</button>;
}

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
};
