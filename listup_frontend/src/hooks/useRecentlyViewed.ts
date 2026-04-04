import { useCallback } from 'react';
import { Listing } from '@/types/listing';

const KEY = 'listup_recently_viewed';
const MAX = 10;

export function useRecentlyViewed() {
  const addViewed = useCallback((listing: Listing) => {
    if (typeof window === 'undefined') return;
    
    try {
      const raw = localStorage.getItem(KEY);
      const current: Listing[] = raw ? JSON.parse(raw) : [];
      
      // Remove if already present, then prepend
      const updated = [listing, ...current.filter(l => l.id !== listing.id)]
        .slice(0, MAX);
      
      localStorage.setItem(KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Error setting recently viewed list", e);
    }
  }, []);

  const getViewed = useCallback((): Listing[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Error getting recently viewed list", e);
      return [];
    }
  }, []);

  return { addViewed, getViewed };
}
