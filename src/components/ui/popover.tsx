import * as React from "react"
import { cn } from "@/lib/utils"

type PopoverContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const PopoverContext = React.createContext<PopoverContextType | undefined>(undefined)

export function Popover({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setOpen = isControlled ? onOpenChange! : setInternalOpen

  return (
    <PopoverContext.Provider value={{ open: isOpen, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverTrigger must be used within a Popover")

  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: (e: any) => {
      context.setOpen(!context.open)
      if ((children as any).props.onClick) {
        (children as any).props.onClick(e)
      }
    }
  })
}

export function PopoverContent({
  className,
  children,
  align = "center",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error("PopoverContent must be used within a Popover")
  if (!context.open) return null

  const alignStyles = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  }

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={() => context.setOpen(false)} />
      <div
        className={cn(
          "absolute z-50 overflow-hidden rounded-md border border-zinc-800 bg-[#0c0c0e] text-foreground shadow-md animate-in fade-in-80 slide-in-from-top-1 mt-2",
          alignStyles[align],
          className
        )}
        {...props}
      >
        <div className="p-2">{children}</div>
      </div>
    </>
  )
}
