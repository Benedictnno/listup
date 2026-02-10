"use client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

interface QueryProviderProps {
    children: ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
    // Create a client instance with optimal caching settings
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Cache data for 5 minutes
                staleTime: 5 * 60 * 1000,
                // Keep unused data in cache for 10 minutes
                gcTime: 10 * 60 * 1000,
                // Retry failed requests once
                retry: 1,
                // Don't refetch on window focus in production
                refetchOnWindowFocus: false,
                // Don't refetch on mount if data is still fresh
                refetchOnMount: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
