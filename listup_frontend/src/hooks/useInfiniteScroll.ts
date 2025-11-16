import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchListingsWithFilters } from '@/lib/api/listing';
import { useFilterStore } from '@/store/useFilterStore';

interface UseInfiniteScrollReturn {
  listings: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useInfiniteScroll(
  initialPage = 1,
  limit = 20
): UseInfiniteScrollReturn {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Use ref to track if we're already loading to prevent multiple calls
  const loadingRef = useRef(false);

  // Subscribe to filter/search state from the global store so the hook reacts
  const search = useFilterStore(state => state.search);
  const minPrice = useFilterStore(state => state.minPrice);
  const maxPrice = useFilterStore(state => state.maxPrice);
  const categoryId = useFilterStore(state => state.category);

  const loadListings = useCallback(async (page: number, append = false) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Request server-side paginated & filtered data
      const data = await fetchListingsWithFilters({
        page,
        limit,
        q: search || undefined,
        minPrice: minPrice != null ? minPrice : undefined,
        maxPrice: maxPrice != null ? maxPrice : undefined,
        categoryId: categoryId || undefined,
      });

      // Defensive programming: extract items array
      const items = Array.isArray(data)
        ? data
        : data && Array.isArray(data.items)
        ? data.items
        : [];

      // Append with dedupe by id (safety net for duplicate items)
      if (append) {
        setListings(prev => {
          const map = new Map<string, any>();
          [...prev, ...items].forEach((it: any, idx: number) => {
            if (it && (it.id || it._id)) {
              map.set(String(it.id ?? it._id), it);
            } else {
              // fallback key for items without id
              map.set(`no-id-${idx}-${JSON.stringify(it)}`, it);
            }
          });
          return Array.from(map.values());
        });
      } else {
        setListings(items);
      }

      // Determine if there are more pages
      if (typeof data?.page === 'number' && typeof data?.pages === 'number') {
        setHasMore(data.page < data.pages);
        setCurrentPage(data.page || page);
      } else {
        // fallback: assume more if returned items length === limit
        setHasMore(items.length === limit);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('Error loading listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit, search, minPrice, maxPrice, categoryId]);

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

  // Initial load and whenever filters/search change: reset to page 1
  useEffect(() => {
    setListings([]);
    setCurrentPage(initialPage);
    setHasMore(true);
    loadListings(initialPage, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage, limit, search, minPrice, maxPrice, categoryId]);

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}