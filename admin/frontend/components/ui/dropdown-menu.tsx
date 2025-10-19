import React, { createContext, useContext, useEffect, useRef, useState } from "react";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within <DropdownMenu>");
  return ctx;
}

export function DropdownMenu({ children, className = "" }: React.HTMLAttributes<HTMLDivElement>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={`relative inline-block ${className}`}>{children}</div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: any) => {
        (children as any).props?.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      className={`inline-flex items-center justify-center ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useDropdownMenu();
  if (!open) return null;
  return (
    <div
      role="menu"
      className={`absolute right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-3 py-2 text-xs font-medium text-muted-foreground ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`my-1 h-px bg-border ${className}`} {...props} />;
}

export function DropdownMenuItem({ children, className = "", onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 hover:bg-muted transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}