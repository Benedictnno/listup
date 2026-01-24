'use client';

import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

/**
 * Engagement Tracker Component
 * Tracks referral clicks and qualifies them after 10 seconds
 */
export default function ReferralEngagementTracker() {
    const [qualified, setQualified] = useState(false);

    useEffect(() => {
        // Check for referral click cookie
        const clickId = Cookies.get('ref_click_id');

        if (!clickId || qualified) return;

        // Wait 10 seconds, then qualify the click
        const timer = setTimeout(async () => {
            try {
                const response = await fetch('/api/referrals/qualify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ clickId }),
                });

                if (response.ok) {
                    setQualified(true);
                    console.log('✅ Referral click qualified');
                    // Optionally remove the cookie after qualification
                    Cookies.remove('ref_click_id');
                }
            } catch (error) {
                console.error('Failed to qualify referral click:', error);
            }
        }, 10000); // 10 seconds

        return () => clearTimeout(timer);
    }, [qualified]);

    // This component renders nothing - it's purely for tracking
    return null;
}
