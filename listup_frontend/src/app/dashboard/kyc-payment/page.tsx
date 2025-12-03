"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { CheckCircle, XCircle, Loader2, CreditCard } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

export default function KYCPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const user = useAuthStore((state) => state.user);

    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState<any>(null);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchPaymentStatus();

        // Check if returning from Paystack
        const shouldVerify = searchParams.get("verify");
        const reference = searchParams.get("reference");

        if (shouldVerify === "true" && reference) {
            verifyPayment(reference);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPaymentStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/kyc-payment/status`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch payment status");

            const data = await res.json();
            setPaymentStatus(data.data);
        } catch (err: any) {
            console.error("Payment status error:", err);
            setError(err.message || "Failed to load payment status");
        } finally {
            setLoading(false);
        }
    };

    const initializePayment = async () => {
        try {
            setProcessing(true);
            setError("");

            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/kyc-payment/initialize`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Failed to initialize payment");
            }

            const data = await res.json();

            // Load Paystack inline
            if (typeof window !== "undefined" && (window as any).PaystackPop) {
                const handler = (window as any).PaystackPop.setup({
                    key: PAYSTACK_PUBLIC_KEY,
                    email: user?.email || "",
                    amount: data.data.amount * 100, // Convert to kobo
                    currency: "NGN",
                    ref: data.data.reference,
                    onClose: function () {
                        setProcessing(false);
                    },
                    callback: function (response: any) {
                        verifyPayment(response.reference);
                    },
                });

                handler.openIframe();
            } else {
                // Fallback to redirect
                window.location.href = data.data.authorizationUrl;
            }
        } catch (err: any) {
            console.error("Payment initialization error:", err);
            setError(err.message || "Failed to initialize payment");
            setProcessing(false);
        }
    };

    const verifyPayment = async (reference: string) => {
        try {
            setVerifying(true);
            setError("");

            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/kyc-payment/verify`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ reference }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Payment verification failed");
            }

            const data = await res.json();

            if (data.success) {
                // Refresh payment status
                await fetchPaymentStatus();

                // Show success and redirect after 3 seconds
                setTimeout(() => {
                    router.push("/dashboard?verified=true");
                }, 3000);
            }
        } catch (err: any) {
            console.error("Payment verification error:", err);
            setError(err.message || "Failed to verify payment");
        } finally {
            setVerifying(false);
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
            </div>
        );
    }

    if (paymentStatus?.isVerified) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Already Verified!
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your account is already verified. You have unlimited listing access.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full bg-lime-500 text-white py-3 rounded-lg font-semibold hover:bg-lime-600 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-lime-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Verifying Payment...
                    </h2>
                    <p className="text-gray-600">Please wait while we confirm your payment.</p>
                </div>
            </div>
        );
    }

    if (!paymentStatus?.canPay) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-yellow-600" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Payment Not Available
                    </h1>
                    <p className="text-gray-600 mb-6">
                        {paymentStatus?.verificationStatus === "PENDING"
                            ? "Your KYC is still pending review. Payment will be available once approved."
                            : "You cannot make a payment at this time."}
                    </p>
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mb-4">
                        <CreditCard className="w-10 h-10 text-lime-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Complete Your Verification
                    </h1>
                    <p className="text-gray-600">
                        Pay the one-time verification fee to unlock unlimited listings
                    </p>
                </div>

                <div className="bg-lime-50 border border-lime-200 rounded-lg p-6 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Verification Fee</span>
                        <span className="text-2xl font-bold text-gray-900">
                            ₦{paymentStatus?.amount?.toLocaleString()}
                        </span>
                    </div>
                    {paymentStatus?.hasReferral && (
                        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded mt-2">
                            🎉 Referral discount applied! (₦2,000 off)
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={initializePayment}
                    disabled={processing}
                    className="w-full bg-lime-500 text-white py-4 rounded-lg font-semibold hover:bg-lime-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-5 w-5" />
                            Pay with Paystack
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                    Secure payment powered by Paystack
                </p>
            </div>

            {/* Load Paystack script */}
            <script src="https://js.paystack.co/v1/inline.js" async></script>
        </div>
    );
}
