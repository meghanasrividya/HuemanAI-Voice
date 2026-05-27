import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type DialogContextType = {
  open: boolean
  setOpen: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextType | undefined>(undefined)

export function Dialog({
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
    <DialogContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export function DialogTrigger({
  children,
}: {
  children: React.ReactNode
}) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within a Dialog")
  
  return React.cloneElement(children as React.ReactElement<any>, {
    onClick: (e: any) => {
      context.setOpen(true)
      if ((children as any).props.onClick) {
        (children as any).props.onClick(e)
      }
    }
  })
}

export function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function DialogOverlay({ className }: { className?: string }) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogOverlay must be used within a Dialog")
  if (!context.open) return null
  return (
    <div
      onClick={() => context.setOpen(false)}
      className={cn(
        "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-all animate-in fade-in-0 duration-200",
        className
      )}
    />
  )
}

export function DialogContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogContent must be used within a Dialog")
  if (!context.open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <DialogOverlay />
      <div
        className={cn(
          "relative z-50 grid w-full max-w-lg gap-4 border border-zinc-800 bg-[#0c0c0e] p-6 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 rounded-xl text-foreground",
          className
        )}
        {...props}
      >
        {children}
        <button
          onClick={() => context.setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4 text-zinc-400" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-white",
        className
      )}
      {...props}
    />
  )
}
