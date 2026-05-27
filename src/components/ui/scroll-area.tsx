import * as React from "react";
import { cn } from "@/lib/utils";

const ScrollArea = ({ children, className, ...props }: any) => {
  return (
    <div
      className={cn(
        "overflow-y-auto pr-2 [scrollbar-color:#333_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#333]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { ScrollArea };
