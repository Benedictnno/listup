"use client"
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { safeLocalStorage } from "@/utils/helpers";
import api from "@/utils/axios";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.adId;
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkPaymentStatus = useCallback(async () => {
    try {
      const token = safeLocalStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      // Check payment status from backend
      const res = await api.get(`/payments/ad/${adId}/status`);

      if (res.data) {
        setPaymentStatus(res.data.paymentStatus);
      } else {
        setError("Failed to fetch payment status");
      }
    } catch (err) {
      console.error("Error checking payment status:", err);
      setError("Failed to verify payment");
    } finally {
      setLoading(false);
    }
  }, [adId]);

  useEffect(() => {
    if (adId) {
      checkPaymentStatus();
    }
  }, [adId, checkPaymentStatus]);

  const manualVerifyPayment = async () => {
    try {
      setLoading(true);
      const token = safeLocalStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        return;
      }

      // Call manual verification endpoint
      const res = await api.post(`/payments/verify-payment/${adId}`);

      if (res.data) {
        setPaymentStatus(res.data.paymentStatus);
        alert("Payment manually verified for testing!");
      } else {
        setError(res.data.error || "Manual verification failed");
      }
    } catch (err) {
      console.error("Manual verification error:", err);
      setError("Manual verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    router.push("/dashboard/promote");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p>Verifying payment status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
        <div className="text-center">
          <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Payment Verification Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRedirect}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentStatus === "SUCCESS") {
    return (
      <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
          <h2 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your ad has been activated and is now live on the platform.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>Ad ID:</strong> {adId}
            </p>
            <p className="text-sm text-green-800">
              <strong>Status:</strong> Active
            </p>
          </div>
          <button
            onClick={handleRedirect}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow p-6 rounded">
      <div className="text-center">
        <XCircle className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2 text-yellow-600">Payment Pending</h2>
        <p className="text-gray-600 mb-4">
          Your payment is being processed. Please wait a few minutes and refresh this page.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Ad ID:</strong> {adId}
          </p>
          <p className="text-sm text-yellow-800">
            <strong>Status:</strong> {paymentStatus || "Pending"}
          </p>
        </div>
        <div className="space-x-4">
          <button
            onClick={checkPaymentStatus}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Check Again
          </button>
          <button
            onClick={manualVerifyPayment}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Manual Verify Payment
          </button>
          <button
            onClick={handleRedirect}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
