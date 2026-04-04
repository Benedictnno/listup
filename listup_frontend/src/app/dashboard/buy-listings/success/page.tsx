"use client";

import { CheckCircle2, Loader2, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function BuyListingsSuccessPage() {
    const router = useRouter();
    const { initializeAuth } = useAuthStore();

    useEffect(() => {
        // Refresh the user's profile to get the new listingLimit
        initializeAuth();

        // Automatically redirect to the dashboard after 5 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard/vendor-listing");
        }, 5000);
        return () => clearTimeout(timer);
    }, [router, initializeAuth]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-lime-100 rounded-full animate-ping opacity-25" />
                    <div className="relative bg-lime-50 rounded-full p-6">
                        <CheckCircle2 className="w-20 h-20 text-lime-600" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Payment Successful!</h1>
                    <p className="text-xl text-gray-600 font-medium">
                        Your listing slots have been added to your account.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                        <span>Transaction Details</span>
                        <Zap size={14} className="text-lime-500 fill-current" />
                    </div>
                    <div className="space-y-3 text-left">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className="text-lime-600 font-bold">Processed</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Activation</span>
                            <span className="text-gray-900 font-bold">Instant</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <Button 
                        onClick={() => router.push("/dashboard/vendor-listing")}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-white py-8 text-xl font-black rounded-2xl shadow-xl shadow-lime-100"
                    >
                        Go to My Listings
                        <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Redirecting automatically in 5 seconds...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
