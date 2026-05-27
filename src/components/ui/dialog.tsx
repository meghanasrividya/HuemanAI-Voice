import * as React from "react";
import { cn } from "@/lib/utils";

const Dialog = ({ open, onOpenChange, children }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Content wrapper */}
      {children}
    </div>
  );
};

const DialogContent = ({ children, className, ...props }: any) => (
  <div
    className={cn(
      "relative z-50 w-full max-w-[500px] rounded-xl border border-zinc-800 bg-[#0d0d0f] p-6 shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const DialogHeader = ({ className, ...props }: any) => (
  <div className={cn("flex flex-col space-y-1.5 text-left mb-5", className)} {...props} />
);

const DialogTitle = ({ className, ...props }: any) => (
  <h2 className={cn("text-base font-bold text-white tracking-tight", className)} {...props} />
);

const DialogTrigger = ({ children }: any) => <>{children}</>;

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle };
