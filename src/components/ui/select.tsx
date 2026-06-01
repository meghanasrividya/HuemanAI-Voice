import * as React from "react";
import { cn } from "@/lib/utils";

const SelectTrigger = ({ children, className, ...props }: any) => <div className={cn("contents", className)} {...props}>{children}</div>;
const SelectValue = ({ placeholder, ...props }: any) => <span>{placeholder}</span>;
const SelectContent = ({ children, ...props }: any) => <>{children}</>;
const SelectItem = ({ value, children, ...props }: any) => (
  <option value={value} className="bg-[#141414] text-zinc-300 py-2">
    {children}
  </option>
);

const getSelectMeta = (children: React.ReactNode): {
  items: React.ReactNode[];
  triggerClassName?: string;
  leadingElements: React.ReactNode[];
} => {
  let items: React.ReactNode[] = [];
  let triggerClassName = "";
  let leadingElements: React.ReactNode[] = [];

  const traverse = (node: React.ReactNode) => {
    if (!React.isValidElement(node)) return;

    const element = node as any;
    const type = element.type;

    if (type === SelectTrigger) {
      if (element.props.className) {
        triggerClassName = element.props.className;
      }
      const findLeading = (triggerNode: React.ReactNode) => {
        if (!React.isValidElement(triggerNode)) return;
        const subElement = triggerNode as any;
        const subType = subElement.type;

        if (subType === SelectValue) {
          return;
        }

        if (subType === React.Fragment || subType === "div" || subType === "span") {
          React.Children.forEach(subElement.props.children, findLeading);
        } else {
          leadingElements.push(subElement);
        }
      };
      React.Children.forEach(element.props.children, findLeading);
    } else if (type === SelectItem) {
      items.push(element);
    } else if (type === SelectContent || type === React.Fragment) {
      React.Children.forEach(element.props.children, traverse);
    } else if (element.props && element.props.children) {
      React.Children.forEach(element.props.children, traverse);
    }
  };

  React.Children.forEach(children, traverse);
  return { items, triggerClassName, leadingElements };
};

const Select = ({ children, className, value, onValueChange, ...props }: any) => {
  const { items, triggerClassName, leadingElements } = getSelectMeta(children);

  const hasLeading = leadingElements.length > 0;
  const cleanedTriggerClassName = triggerClassName ? triggerClassName.replace(/\bcontents\b/g, "") : "";

  return (
    <div className={cn("relative flex items-center", cleanedTriggerClassName)}>
      {hasLeading && (
        <div className="pointer-events-none absolute left-3 text-zinc-500 flex items-center justify-center">
          {leadingElements}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-[#141414] py-2 text-[11px] font-semibold text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-800 appearance-none cursor-pointer pr-8",
          hasLeading ? "pl-9" : "px-4",
          cleanedTriggerClassName && cleanedTriggerClassName.includes("h-") ? "h-full" : "h-9",
          className
        )}
        {...props}
      >
        {items}
      </select>
      <div className="pointer-events-none absolute right-3 text-zinc-500 flex items-center justify-center top-1/2 -translate-y-1/2">
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

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
