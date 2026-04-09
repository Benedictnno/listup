"use client";

import { CheckCircle2, Loader2, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function BuyListingsSuccessPage() {
    const router = useRouter();
    const { user, initializeAuth } = useAuthStore();

    useEffect(() => {
        // Refresh the user's profile to get the new listingLimit
        initializeAuth();

        // Automatically redirect to the dashboard after 15 seconds
        const timer = setTimeout(() => {
            router.push("/dashboard/create-list");
        }, 15000);
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
                        You now have <span className="font-extrabold text-lime-600">{user?.listingLimit || 'more'}</span> premium listing slots available!
                    </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <div className="flex items-center gap-3 text-left">
                        <div className="bg-lime-100 p-3 rounded-xl shrink-0">
                            <Zap size={24} className="text-lime-600 fill-current" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Next Steps</h3>
                            <p className="text-sm text-gray-600 font-medium mt-1">
                                Your account capacity is fully upgraded. Now is the perfect time to post those items you've been waiting to sell!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex flex-col gap-4">
                    <Button 
                        onClick={() => router.push("/dashboard/create-list")}
                        className="w-full bg-lime-500 hover:bg-lime-600 text-white py-8 text-xl font-black rounded-2xl shadow-xl shadow-lime-100"
                    >
                        Create a New Listing
                        <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-400 text-sm font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Redirecting to create listing in 15 seconds...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
