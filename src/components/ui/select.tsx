import * as React from "react";
import { cn } from "@/lib/utils";

const Select = ({ children, className, value, onValueChange, ...props }: any) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#141414] px-4 py-2 text-[11px] font-semibold text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800 appearance-none cursor-pointer pr-8",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-3 top-2.5 text-zinc-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="rotate-90"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </div>
    </div>
  );
};

const SelectTrigger = ({ children, className, ...props }: any) => <div className={cn("contents", className)} {...props}>{children}</div>;
const SelectValue = ({ placeholder, ...props }: any) => <span>{placeholder}</span>;
const SelectContent = ({ children, ...props }: any) => <>{children}</>;
const SelectItem = ({ value, children, ...props }: any) => (
  <option value={value} className="bg-[#141414] text-zinc-300 py-2">
    {children}
  </option>
);

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
