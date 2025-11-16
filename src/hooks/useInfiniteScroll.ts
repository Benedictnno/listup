import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchListingsWithFilters } from '@/lib/api/listing';

interface UseInfiniteScrollReturn {
  listings: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

type Filters = {
  q?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  categoryId?: string;
};

export function useInfiniteScroll(
  initialPage = 1,
  limit = 20,
  filters: Filters = {}
): UseInfiniteScrollReturn {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);
  
  // Use ref to track if we're already loading to prevent multiple calls
  const loadingRef = useRef(false);
  const filtersRef = useRef<string>(JSON.stringify(filters));

  const loadListings = useCallback(async (page: number, append = false) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Call the filtered fetch function with proper pagination
      const data = await fetchListingsWithFilters({
        q: filters.q,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        categoryId: filters.categoryId,
        page,
        limit
      });
      
      // Defensive programming: ensure data and data.items exist and are arrays
      if (!data) {
        console.error('No data returned from API');
        setError('No data returned from API');
        return;
      }
      
      // Handle different API response formats
      const items = Array.isArray(data) ? data : 
                   (data.items && Array.isArray(data.items)) ? data.items : 
                   [];
      
      // Append with dedupe by id
      if (append) {
        setListings(prev => {
          const combined = [...prev, ...items];
          const map = new Map<string, any>();
          for (const it of combined) {
            if (it && (it.id ?? it._id)) {
              map.set(String(it.id ?? it._id), it);
            } else {
              // fallback for items without id - just push with generated key
              map.set(JSON.stringify(it) + Math.random(), it);
            }
          }
          return Array.from(map.values());
        });
      } else {
        setListings(items);
      }

      // Determine hasMore:
      // Prefer explicit pagination fields from backend, fallback to items.length vs limit
      const hasMorePages = (typeof data.page === 'number' && typeof data.pages === 'number')
        ? (data.page < data.pages)
        : (items.length === limit);

      setHasMore(Boolean(hasMorePages));
      setCurrentPage(data.page || page);

    } catch (err) {
      console.error('Error loading listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit, filters.q, filters.minPrice, filters.maxPrice, filters.categoryId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore && !loadingRef.current) {
      loadListings(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, loadListings]);

  const refresh = useCallback(() => {
    setCurrentPage(initialPage);
    setHasMore(true);
    setError(null);
    loadListings(initialPage, false);
  }, [initialPage, loadListings]);

  // Initial load + reload when filters change
  useEffect(() => {
    const serialized = JSON.stringify(filters);
    // If filters changed, reset to initial page and clear previous listings
    if (filtersRef.current !== serialized) {
      filtersRef.current = serialized;
      setListings([]);
      setCurrentPage(initialPage);
      setHasMore(true);
      loadListings(initialPage, false);
      return;
    }
    // first mount
    loadListings(initialPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, loadListings]); // loadListings includes filters deps

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
