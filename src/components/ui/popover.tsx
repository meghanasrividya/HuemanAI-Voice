import * as React from "react";
import { cn } from "@/lib/utils";

const Popover = ({ children }: any) => {
  const [trigger, content] = React.Children.toArray(children);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && <div className="absolute left-0 mt-2 z-50">{content}</div>}
    </div>
  );
};

const PopoverTrigger = ({ children, asChild, ...props }: any) => <>{children}</>;

const PopoverContent = ({ children, className, ...props }: any) => (
  <div
    className={cn(
      "w-auto p-0 bg-[#0f0f0f] border border-zinc-800 rounded-xl shadow-2xl z-50",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export { Popover, PopoverTrigger, PopoverContent };
