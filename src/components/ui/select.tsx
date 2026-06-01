import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

type SelectContextType = {
  value?: string
  onValueChange?: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined)

export function Select({
  children,
  value,
  onValueChange,
}: {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectTrigger must be used within a Select")
  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-zinc-800 bg-[#0c0c0e] px-3 py-2 text-xs sm:text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50 text-zinc-500 shrink-0 ml-2" />
    </button>
  )
}

export function SelectValue({
  placeholder,
  className,
}: {
  placeholder?: string
  className?: string
}) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectValue must be used within a Select")
  return (
    <span className={cn("block truncate text-xs sm:text-sm text-foreground", className)}>
      {context.value || placeholder}
    </span>
  )
}

export function SelectContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectContent must be used within a Select")
  if (!context.open) return null
  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-zinc-800 bg-[#0c0c0e] text-foreground shadow-md animate-in fade-in-80 slide-in-from-top-1 w-full mt-1 max-h-60 overflow-y-auto",
          className
        )}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    </>
  )
}

export function SelectItem({
  className,
  value,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error("SelectItem must be used within a Select")
  const isSelected = context.value === value
  return (
    <div
      onClick={() => {
        context.onValueChange?.(value)
        context.setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-xs sm:text-sm outline-none hover:bg-zinc-900 hover:text-white transition-colors",
        isSelected && "bg-zinc-800 text-white font-medium",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
