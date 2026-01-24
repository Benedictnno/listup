"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface PageProps {
    params: {
        code: string;
    }
}

export default function ReferralRedirectPage({ params }: PageProps) {
    useEffect(() => {
        // Use the backend URL from environment or default to localhost
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        // Redirect to the backend tracking endpoint
        window.location.href = `${backendUrl}/api/referrals/r/${params.code}`;
    }, [params.code]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h1 className="text-lg font-semibold text-slate-700">Redirecting to ListUp...</h1>
            <p className="text-sm text-slate-500">Applying your referral code</p>
        </div>
    );
}
