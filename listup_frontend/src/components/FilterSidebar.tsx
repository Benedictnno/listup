"use client";
import { useFilterStore } from "@/store/useFilterStore";

export default function FilterSidebar() {
  const {
    isOpen,
    toggleSidebar,
    closeSidebar,
    category,
    setCategory,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
  } = useFilterStore();

  
  return (
    <div
      className={`fixed top-0 right-0 h-full w-72 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-bold">Filters</h2>
        <button onClick={closeSidebar} className="text-gray-600">
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">All</option>
            <option value="food">Food</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-1">Min Price</label>
          <input
            type="number"
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(Number(e.target.value) || null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Max Price</label>
          <input
            type="number"
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(Number(e.target.value) || null)}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>
    </div>
  );
}
