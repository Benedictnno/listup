"use client"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchAdById } from "@/lib/api/ad";
import { safeLocalStorage } from "@/utils/helpers";

export default function PaymentPage() {
  const params = useParams();
  const adId = params.adId;
  const [ad, setAd] = useState<{ 
    id: string; 
    type: string; 
    amount: number; 
    startDate: string;
    endDate: string;
    vendor: { email: string; name: string } 
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (adId) {
      fetchAdById(adId as string)
        .then(adData => setAd(adData))
        .catch(err => {
          console.error(err);
          setError("Failed to load ad details");
        });
    }
  }, [adId]);

  const handlePay = async () => {
    if (!ad) {
      setError("Ad data not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get token safely
      const token = safeLocalStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login again.");
        return;
      }

      // Get email from ad data (vendor's email) or localStorage as fallback
      let userEmail: string | null = ad.vendor?.email;
      if (!userEmail) {
        userEmail = safeLocalStorage.getItem("email");
      }
      
      if (!userEmail) {
        setError("Vendor email not available. Please refresh the page or login again.");
        return;
      }
      
      // Get amount from ad or calculate based on plan type and duration
      let amount = ad.amount;
      if (!amount) {
        const planPricesPerDay: { [key: string]: number } = {
          "STOREFRONT": 500,
          "PRODUCT_PROMOTION": 300,
          "SEARCH_BOOST": 200
        };
        const pricePerDay = planPricesPerDay[ad.type] || 0;
        // Calculate duration from start and end dates
        const startDate = new Date(ad.startDate);
        const endDate = new Date(ad.endDate);
        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        amount = pricePerDay * durationDays;
      }
     
      // initiate payment session
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adId,
          email: userEmail,
          amount,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Payment initialization failed");
      }
      
      const data = await res.json();
      
      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // redirect to payment gateway
      } else {
        setError("Payment initialization failed - no authorization URL received");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Payment failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
      <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
      <p>Ad Type: {ad.type}</p>
      <p>Amount: ₦{ad.amount}</p>
      <p>Start Date: {new Date(ad.startDate).toDateString()}</p>
      <p>End Date: {new Date(ad.endDate).toDateString()}</p>
      <p>Vendor: {ad.vendor?.name}</p>
      <p>Email: {ad.vendor?.email || safeLocalStorage.getItem("email")}</p>

      <button 
        onClick={handlePay}
        disabled={loading}
        className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}
