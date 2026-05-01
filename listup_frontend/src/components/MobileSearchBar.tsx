"use client";

import React from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFilterStore } from "@/store/useFilterStore";

export default function MobileSearchBar() {
  const router = useRouter();
  const setSearch = useFilterStore((state) => state.setSearch);

  return (
    <div className="md:hidden mb-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const searchInput = e.currentTarget.querySelector("input");
          const searchValue = searchInput?.value || "";
          if (searchValue.trim()) {
            setSearch(searchValue.trim());
            router.push(
              `/listings?q=${encodeURIComponent(searchValue.trim())}`,
            );
          }
        }}
        className="flex w-full items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-14 shadow-2xl"
      >
        <div className="pl-4">
          <Search className="h-5 w-4 text-slate-500" />
        </div>
        <input
          type="text"
          placeholder="Search listings..."
          className="flex-1 bg-transparent text-white outline-none px-3 font-montserrat text-sm"
        />
        <button
          type="submit"
          className="h-full px-4 bg-lime-400 text-slate-950 font-bold font-montserrat hover:bg-lime-300 transition-colors"
        >
          Search
        </button>
      </form>
    </div>
  );
}
