"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ListingCard from "@/components/ListingCard";
import SearchBar from "@/components/SearchBar";
import { Filter, SortAsc, SortDesc, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useFilterStore } from "@/store/useFilterStore";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  location: string;
  condition: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  seller: {
    id: string;
    name: string;
  };
}

interface FilterState {
  search: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
  condition: string;
  location: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

function ListingsPageContent() {
  const searchParams = useSearchParams();
  const { search, minPrice, maxPrice, setSearch } = useFilterStore();
  
  // Use infinite scroll hook
  const { 
    listings, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = useInfiniteScroll(1, 20);

  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    minPrice: null,
    maxPrice: null,
    condition: '',
    location: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Intersection observer for infinite scroll
  const loadMoreRef = useIntersectionObserver(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, { threshold: 0.1, rootMargin: '100px' });

  // Handle URL query parameters for search
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearch(query);
    }
  }, [searchParams, setSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault();
        // Focus the search input in SearchBar component
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply filters whenever filters or listings change
  useEffect(() => {
    let filtered = [...listings];

    // Search filter (from global store)
    if (search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.description.toLowerCase().includes(search.toLowerCase()) ||
        listing.location.toLowerCase().includes(search.toLowerCase())
      );
    }



    // Price range filter (from global store)
    if (minPrice !== null) {
      const validMinPrice = Math.max(minPrice, 10); // Ensure minimum is at least 10
      filtered = filtered.filter(listing => listing.price >= validMinPrice);
    }
    if (maxPrice !== null) {
      filtered = filtered.filter(listing => listing.price <= maxPrice);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      if (filters.sortBy === 'price') {
        aValue = a.price;
        bValue = b.price;
      } else if (filters.sortBy === 'createdAt') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = String(a[filters.sortBy as keyof Listing] || '');
        bValue = String(b[filters.sortBy as keyof Listing] || '');
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredListings(filtered);
  }, [listings, filters, search, minPrice, maxPrice]);

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      minPrice: null,
      maxPrice: null,
      condition: '',
      location: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    // Clear global filters
    setSearch('');
    // Reset min/max to null so inputs clear and filtering resets
    useFilterStore.getState().setMinPrice(null);
    useFilterStore.getState().setMaxPrice(null);
  };

  const hasActiveFilters = () => {
    // Consider search, minPrice or maxPrice as active filters
    const hasSearch = typeof search === 'string' && search.trim().length > 0;
    return hasSearch || minPrice !== null || maxPrice !== null;
  };

  // Show error state
  if (error && listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Failed to Load Listings
          </h1>
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          <Button onClick={refresh} className="bg-lime-500 hover:bg-lime-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state only for initial load
  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading listings...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!loading && listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            No Listings Available
          </h1>
          <p className="text-gray-600 mb-6">
            There are currently no listings available. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Listings</h1>
          <SearchBar />
          <div className="mt-2 text-xs text-gray-500 text-center">
            💡 Tip: Use Ctrl+F to quickly search, or click the filter button to refine results
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Filter Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Filter size={16} />
              Filters
                             {hasActiveFilters() && (
                 <Badge variant="secondary" className="ml-2">
                   {[search, minPrice, maxPrice]
                     .filter(v => v !== '' && v !== null).length}
                 </Badge>
               )}
            </div>
            
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Clear all filters"
              >
                <X size={16} className="mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3">
            <Select
              value={filters.sortBy}
              onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(prev => ({ 
                ...prev, 
                sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
              }))}
              className="px-3"
              aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
            </Button>
          </div>
        </div>

                {/* Enhanced Filter Section */}
        <div className="mb-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Filter Header */}
          <div className="bg-gradient-to-r from-lime-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                <Filter size={18} className="text-lime-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Price Range Filter</h3>
                <p className="text-sm text-gray-600">Set your budget range to find the perfect items</p>
              </div>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Min Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Minimum Price
                  <span className="text-lime-600 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₦
                  </span>
                  <Input
                    type="number"
                    min="10"
                    placeholder="10"
                    value={minPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      if (value !== null && value < 10) {
                        useFilterStore.getState().setMinPrice(10);
                      } else {
                        useFilterStore.getState().setMinPrice(value);
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      if (value !== null && value < 10) {
                        useFilterStore.getState().setMinPrice(10);
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Minimum price is ₦10</p>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Maximum Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                    ₦
                  </span>
                  <Input
                    type="number"
                    min={minPrice || 10}
                    placeholder="No limit"
                    value={maxPrice || ''}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : null;
                      if (value !== null && minPrice !== null && value < minPrice) {
                        useFilterStore.getState().setMaxPrice(minPrice);
                      } else {
                        useFilterStore.getState().setMaxPrice(value);
                      }
                    }}
                    className="w-full pl-8 pr-4 py-3 border-gray-200 focus:border-lime-500 focus:ring-lime-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Leave empty for no limit</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={clearFilters}
                  className="w-full bg-lime-500 hover:bg-lime-600 text-white border-0 shadow-sm"
                  disabled={!hasActiveFilters()}
                >
                  <X size={16} className="mr-2" />
                  Clear All
                </Button>
                
                {hasActiveFilters() && (
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-100 text-lime-800 text-xs font-medium rounded-full">
                      <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></div>
                      Active Filters
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Range Preview */}
            {(minPrice !== null || maxPrice !== null) && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Current Price Range:</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ₦{minPrice || 10} - ₦{maxPrice || '∞'}
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-lime-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${maxPrice ? ((maxPrice - (minPrice || 10)) / (maxPrice * 2)) * 100 : 50}%`,
                      marginLeft: `${minPrice ? ((minPrice - 10) / (maxPrice || 1000)) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>



        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredListings.length} of {listings.length} listings
            {hasActiveFilters() && (
              <span className="ml-2 text-lime-600">
                (filtered results)
              </span>
            )}
          </div>
          
          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Active filters:</span>
              {search && (
                <Badge variant="secondary" className="text-xs">
                  Search: &quot;{search}&quot;
                </Badge>
              )}
                             {(minPrice !== null || maxPrice !== null) && (
                 <Badge variant="secondary" className="text-xs">
                   Price: ₦{minPrice || 10} - ₦{maxPrice || '∞'}
                 </Badge>
               )}
            </div>
          )}
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        {/* Infinite Scroll Trigger and Loading States */}
        {hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more listings...</span>
              </div>
            ) : (
              <Button 
                onClick={loadMore} 
                variant="outline"
                className="bg-white hover:bg-gray-50"
              >
                Load More
              </Button>
            )}
          </div>
        )}

        {/* End of results indicator */}
        {!hasMore && listings.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              You've reached the end of the listings
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredListings.length === 0 && hasActiveFilters() && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-600 mb-4">
              {search ? `No results found for &quot;${search}&quot;` : 'No results match your current filters'}
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Try:</p>
              <div className="flex flex-wrap justify-center gap-2">
                                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => setSearch('')}
                 >
                   Clear search
                 </Button>
                
                                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => {
                     useFilterStore.getState().setMinPrice(10);
                     useFilterStore.getState().setMaxPrice(null);
                   }}
                 >
                   Clear price range
                 </Button>
                <Button variant="outline" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsPageContent />
    </Suspense>
  );
}
