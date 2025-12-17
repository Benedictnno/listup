"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/utils/axios';

type FeatureFlags = Record<string, boolean>;

interface FeatureFlagContextType {
    flags: FeatureFlags;
    isLoading: boolean;
    isEnabled: (key: string) => boolean;
    refreshFlags: () => Promise<void>;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
    const [flags, setFlags] = useState<FeatureFlags>({});
    const [isLoading, setIsLoading] = useState(true);

    // Set default fallbacks if API fails or during initial load
    // True by default for now to avoid breaking existing flows unless explicitly disabled in DB
    const defaults: FeatureFlags = {
        'kyc_system': true,
        'referral_system': true,
    };

    const refreshFlags = async () => {
        try {
            const { data } = await api.get('/features');
            if (data.success) {
                setFlags({ ...defaults, ...data.data });
            }
        } catch (error) {
            console.error('Failed to fetch feature flags:', error);
            // Fallback to defaults
            setFlags(defaults);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshFlags();
    }, []);

    const isEnabled = (key: string) => {
        // Return flag value if it exists, otherwise define default behavior specific to unknown flags (usually false, but here maybe true/false based on risk)
        // For safety, if it's in our known defaults use that, otherwise false.
        return flags[key] ?? defaults[key] ?? false;
    };

    return (
        <FeatureFlagContext.Provider value={{ flags, isLoading, isEnabled, refreshFlags }}>
            {children}
        </FeatureFlagContext.Provider>
    );
}

export function useFeatureFlag() {
    const context = useContext(FeatureFlagContext);
    if (context === undefined) {
        throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
    }
    return context;
}
