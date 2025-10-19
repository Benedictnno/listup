import React, { createContext, useContext, useState } from "react";

interface TooltipContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  );
}

function useTooltip() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
}

export function TooltipTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) {
  const { setOpen } = useTooltip();
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as any, {
      onMouseEnter: (e: any) => {
        children.props?.onMouseEnter?.(e);
        setOpen(true);
      },
      onMouseLeave: (e: any) => {
        children.props?.onMouseLeave?.(e);
        setOpen(false);
      },
    });
  }
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>{children}</div>
  );
}

export function TooltipContent({ children, side = "top", className = "" }: { children: React.ReactNode; side?: "top" | "right" | "bottom" | "left"; className?: string }) {
  const { open } = useTooltip();
  if (!open) return null;
  const sideClass = side === "right" ? "left-full ml-2" : side === "left" ? "right-full mr-2" : side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
  return (
    <div className={`absolute ${sideClass} whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm ${className}`}>
      {children}
    </div>
  );
}