"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFilterStore } from "@/store/useFilterStore";
import SearchBar from "@/components/SearchBar";
import Link from "next/link";
import { Search, X, Filter, RotateCcw, MapPin, Calendar } from "lucide-react";

interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  condition: string;
  images: string[];
  category: string;
  createdAt?: string;
}

interface FilterState {
  categoryId: string;
  minPrice: string;
  maxPrice: string;
  location: string;
  search: string;
  sort: string;
  page: number;
  limit: number;
}

const INITIAL_FILTERS: FilterState = {
  categoryId: "",
  minPrice: "",
  maxPrice: "",
  location: "",
  search: "",
  sort: "recent",
  page: 1,
  limit: 12,
};

const CATEGORIES = [
  { id: "", name: "All Categories" },
  { id: "1", name: "Phones" },
  { id: "2", name: "Electronics" },
  { id: "3", name: "Fashion" },
  { id: "4", name: "Home & Garden" },
  { id: "5", name: "Vehicles" },
  { id: "6", name: "Books & Media" },
  { id: "7", name: "Sports & Outdoors" },
  { id: "8", name: "Toys & Games" },
  { id: "9", name: "Health & Wellness" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "lowToHigh", label: "Price: Low to High" },
  { value: "highToLow", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

export default function Marketplace() {
  // State management
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Filter store
  const { search, setSearch } = useFilterStore();

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return filters.categoryId || filters.minPrice || filters.maxPrice || filters.location || filters.search;
  }, [filters]);

  const hasNonSearchFilters = useMemo(() => {
    return filters.categoryId || filters.minPrice || filters.maxPrice || filters.location;
  }, [filters]);

  // Search effect - only update when search changes from external source
  useEffect(() => {
    if (search !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search,
        page: 1
      }));
    }
  }, [search, filters.search]);

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [filters.categoryId, filters.minPrice, filters.maxPrice, filters.location, filters.sort, filters.page, filters.search]);

  // Initial load and URL search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const searchQuery = urlParams.get('q');
      
      if (searchQuery && !filters.search) {
        setSearch(searchQuery);
        setFilters(prev => ({
          ...prev,
          search: searchQuery
        }));
      } else if (!searchQuery && !filters.search) {
        fetchListings();
      }
    }
  }, []);

  // API functions
  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filter parameters
      if (filters.search) params.append("q", filters.search);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.location) params.append("location", filters.location);
      if (filters.sort) params.append("sort", filters.sort);
      params.append("page", filters.page.toString());
      params.append("limit", filters.limit.toString());

      const response = await fetch(
        `http://localhost:4000/api/listings/search?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setListings(data.items || []);
      setTotalPages(data.pages || 1);

      // Update URL if search is present
      if (filters.search) {
        const url = new URL(window.location.href);
        url.searchParams.set('q', filters.search);
        window.history.replaceState({}, '', url);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      setListings([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Filter actions
  const updateFilter = useCallback((key: keyof FilterState, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearch("");
    setShowFilters(false);
    
    // Clear URL search params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }
  }, [setSearch]);

  const clearSearch = useCallback(() => {
    setSearch("");
    setFilters(prev => ({
      ...prev,
      search: "",
      page: 1
    }));
    
    // Clear URL search params
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }
  }, [setSearch]);

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  // Render functions
  const renderFilterBar = () => (
    <div className="hidden lg:grid grid-cols-5 gap-4 mb-6">
      <select
        className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
        value={filters.categoryId}
        onChange={(e) => updateFilter('categoryId', e.target.value)}
      >
        {CATEGORIES.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      
      <input
        type="number"
        placeholder="Min Price"
        className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
        value={filters.minPrice}
        onChange={(e) => updateFilter('minPrice', e.target.value)}
      />
      
      <input
        type="number"
        placeholder="Max Price"
        className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
        value={filters.maxPrice}
        onChange={(e) => updateFilter('maxPrice', e.target.value)}
      />
      
      <input
        type="text"
        placeholder="Location"
        className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
        value={filters.location}
        onChange={(e) => updateFilter('location', e.target.value)}
      />
      
      <select
        className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
        value={filters.sort}
        onChange={(e) => updateFilter('sort', e.target.value)}
      >
        {SORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );

  const renderMobileFilterDrawer = () => (
    <AnimatePresence>
      {showFilters && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setShowFilters(false)}
            className="fixed inset-0 bg-black z-40"
          />

          {/* Sidebar */}
          <motion.div
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 w-72 h-full bg-white shadow-lg p-4 z-50 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search listings..."
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                      filters.categoryId === cat.id
                        ? "bg-lime-400 text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                    onClick={() => updateFilter('categoryId', cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Price Range</h3>
              <div className="flex gap-3">
                <div className="w-1/2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                  <input
                    type="number"
                    placeholder="Min"
                    className="w-full border border-slate-300 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                  />
                </div>
                <div className="w-1/2 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                  <input
                    type="number"
                    placeholder="Max"
                    className="w-full border border-slate-300 rounded-xl pl-7 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition"
                    value={filters.minPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Location</h3>
              <input
                type="text"
                placeholder="Enter location"
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition"
                value={filters.location}
                onChange={(e) => updateFilter('location', e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Sort By</h3>
              <select
                className="w-full border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition appearance-none bg-white"
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                className="w-full rounded-xl bg-lime-400 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200"
                onClick={() => setShowFilters(false)}
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button
                  className="w-full rounded-xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  const renderFilterIndicators = () => (
    <>
      {/* Search indicator */}
      {filters.search && (
        <div className="mb-4 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <Search size={16} className="text-slate-500" />
          <span className="text-sm text-slate-700">
            Search results for <span className="font-medium">"{filters.search}"</span>
          </span>
          <button 
            onClick={clearSearch}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition"
          >
            <X size={14} />
            Clear
          </button>
        </div>
      )}

      {/* Active filters indicator */}
      {hasNonSearchFilters && !filters.search && (
        <div className="mb-4 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
          <Filter size={16} className="text-blue-500" />
          <span className="text-sm text-blue-700">
            Active filters applied
          </span>
          <button 
            onClick={clearAllFilters}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition"
          >
            <RotateCcw size={14} />
            Clear All
          </button>
        </div>
      )}
    </>
  );

  const renderListings = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-400"></div>
        </div>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No listings found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            {filters.search ? (
              <>No results found for <span className="font-medium">"{filters.search}"</span>. Try different keywords or adjust your filters.</>
            ) : (
              <>Try adjusting your filter criteria to find what you're looking for.</>
            )}
          </p>
          {hasActiveFilters && (
            <button 
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition"
            >
              Clear all filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <Link href={`/listings/${listing.id}`} key={listing.id} className="block group">
            <div className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition bg-white">
              <div className="h-40 bg-slate-100 relative overflow-hidden">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-40 w-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="h-40 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="text-center">
                      <div className="text-3xl mb-2">📦</div>
                      <span className="text-slate-500 text-sm">No Image</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-lime-400 text-slate-900 font-semibold px-3 py-1 rounded-full text-sm shadow-[inset_0_-1px_0_rgba(0,0,0,0.15)]">
                  ₦{listing.price?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-lg truncate group-hover:text-lime-600 transition">
                  {listing.title}
                </h2>
                <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                  {listing.description}
                </p>
                <div className="flex items-center text-slate-500 text-xs">
                  <MapPin size={14} className="mr-1" />
                  {listing.location}
                </div>
                {listing.createdAt && (
                  <div className="flex items-center text-slate-400 text-xs mt-1">
                    <Calendar size={12} className="mr-1" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex justify-center mt-8 gap-3">
        <button
          onClick={() => goToPage(Math.max(1, filters.page - 1))}
          disabled={filters.page === 1}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          Previous
        </button>
        <span className="px-4 py-2 rounded-xl bg-lime-400 text-slate-900 font-medium text-sm shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]">
          Page {filters.page} of {totalPages}
        </span>
        <button
          onClick={() => goToPage(Math.min(totalPages, filters.page + 1))}
          disabled={filters.page === totalPages}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Marketplace</h1>
          <div className="flex gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition"
              >
                <RotateCcw size={16} />
                Clear All
              </button>
            )}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        <SearchBar />

        {/* Desktop filter bar */}
        {renderFilterBar()}

        {/* Mobile filter drawer */}
        {renderMobileFilterDrawer()}

        {/* Filter indicators */}
        {renderFilterIndicators()}

        {/* Listings */}
        {renderListings()}

        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
}
