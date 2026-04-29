'use client';

import { useEffect } from 'react';
import { getFirebaseAnalytics } from '@/lib/firebase';

export default function FirebaseAnalytics() {
  useEffect(() => {
    // Just initialize it. Firebase automatically tracks page views if configured.
    getFirebaseAnalytics().catch(console.error);
  }, []);

  return null;
}
