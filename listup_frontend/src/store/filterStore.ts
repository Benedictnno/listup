import { create } from "zustand";

interface FilterState {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  closeFilter: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  isFilterOpen: false,
  toggleFilter: () => set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  closeFilter: () => set({ isFilterOpen: false }),
}));
