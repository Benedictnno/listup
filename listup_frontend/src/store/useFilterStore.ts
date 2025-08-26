import { create } from "zustand";

interface FilterState {
  search: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  isOpen: boolean;
  setSearch: (val: string) => void;
  setCategory: (val: string) => void;
  setMinPrice: (val: number | null) => void;
  setMaxPrice: (val: number | null) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  isOpen: false,
  setSearch: (val) => set({ search: val }),
  setCategory: (val) => set({ category: val }),
  setMinPrice: (val) => set({ minPrice: val }),
  setMaxPrice: (val) => set({ maxPrice: val }),
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  closeSidebar: () => set({ isOpen: false }),
}));
