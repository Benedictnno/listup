import { ArrowRight } from "lucide-react";


export function PrimaryButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200">
      {children}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}

export function GhostButton({ children }: { children: React.ReactNode }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10">
      {children}
    </button>
  );
}

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-300/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-lime-400"></span>
      {children}
    </span>
  );
}

// Safe localStorage utilities for Next.js
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(key);
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  },
  
  removeItem: (key: string): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(key);
    }
  },
  
  clear: (): void => {
    if (typeof window !== "undefined") {
      localStorage.clear();
    }
  }
};