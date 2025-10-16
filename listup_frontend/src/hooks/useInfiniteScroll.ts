import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchListings } from '@/lib/api/listing';

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

  const loadListings = useCallback(async (page: number, append = false) => {
    // Prevent multiple simultaneous calls
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const data = await fetchListings();
      
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
      
      console.log('API response structure:', JSON.stringify(data).substring(0, 200) + '...');
      
      if (append) {
        setListings(prev => [...prev, ...items]);
      } else {
        setListings(items);
      }

      // Check if there are more pages - handle both pagination formats
      const hasMorePages = data.page && data.pages ? (data.page < data.pages) : false;
      setHasMore(hasMorePages);
      setCurrentPage(data.page || page);

    } catch (err) {
      console.error('Error loading listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [limit]);

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

  // Initial load - only run once on mount
  useEffect(() => {
    loadListings(initialPage, false);
  }, []); // Empty dependency array to run only once

  return {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}
