"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuthStore } from "@/store/authStore";
import { parseApiError } from "@/utils/errorHandler";
import { Loader2, CheckCircle2, AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";

interface KYCStatusResponse {
  kyc?: {
    id: string;
    status: string;
    signupFee: number;
    hasReferral: boolean;
    paymentStatus: string;
    validUntil?: string | null;
    renewalCount?: number;
  } | null;
}

export default function KYCPaymentPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [renewInitializing, setRenewInitializing] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [kyc, setKyc] = useState<KYCStatusResponse["kyc"]>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "VENDOR") {
      router.push("/dashboard");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    async function loadKYC() {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/kyc/status");
        if (res.data?.success) {
          setKyc(res.data.data.kyc || null);
        } else {
          setError(res.data?.message || "Failed to load KYC status");
        }
      } catch (err) {
        console.error("Error loading KYC status", err);
        setError(parseApiError(err));
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadKYC();
    }
  }, [user]);

  const handleInitializePayment = async () => {
    try {
      setInitializing(true);
      setError("");
      setSuccess("");

      const res = await api.post("/payments/kyc/initialize", {});
      const url = res.data?.authorizationUrl;
      if (!url) {
        setError("Failed to start payment. Please try again.");
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error("KYC payment init error", err);
      setError(parseApiError(err));
    } finally {
      setInitializing(false);
    }
  };

  const handleInitializeRenewal = async () => {
    try {
      setRenewInitializing(true);
      setError("");
      setSuccess("");

      const res = await api.post("/payments/kyc/renew/initialize", {});
      const url = res.data?.authorizationUrl;
      if (!url) {
        setError("Failed to start renewal payment. Please try again.");
        return;
      }

      window.location.href = url;
    } catch (err) {
      console.error("KYC renewal payment init error", err);
      setError(parseApiError(err));
    } finally {
      setRenewInitializing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 animate-spin text-lime-600" />
      </div>
    );
  }

  const fee = kyc?.signupFee ?? 5000;
  const hasReferral = !!kyc?.hasReferral;
  const paymentStatus = kyc?.paymentStatus || "PENDING";
  const status = kyc?.status || "PENDING";
  const validUntil = kyc?.validUntil ? new Date(kyc.validUntil) : null;
  const renewalCount = kyc?.renewalCount ?? 0;

  const now = new Date();
  const isActive = !!validUntil && validUntil.getTime() >= now.getTime();
  const isExpired = !!validUntil && validUntil.getTime() < now.getTime();

  const canPay =
    !!kyc &&
    paymentStatus !== "SUCCESS" &&
    (status === "APPROVED" || status === "INTERVIEW_COMPLETED");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />

      <div className="relative z-10 bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-xl border border-slate-200/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">KYC Payment</h1>
            <p className="text-sm text-slate-500">
              Complete your vendor verification by paying your signup fee.
            </p>
          </div>
          <CreditCard className="w-6 h-6 text-lime-500" />
        </div>

        {success && (
          <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <div>{success}</div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <div>{error}</div>
          </div>
        )}

        {!kyc && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
            We couldn&apos;t find a KYC submission for your account.
            <div className="mt-2 flex gap-2">
              <Link
                href="/kyc/submit"
                className="inline-flex items-center px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700"
              >
                Go to KYC Form
              </Link>
            </div>
          </div>
        )}

        {kyc && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {paymentStatus === "SUCCESS" ? "Current Yearly Fee" : "Signup Fee"}
                </p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  ₦{fee.toLocaleString()}
                </p>
                {paymentStatus !== "SUCCESS" && hasReferral && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Referral discount applied (normal fee ₦5,000).
                  </p>
                )}
                {paymentStatus === "SUCCESS" && (
                  <p className="text-xs text-slate-600 mt-1">
                    You have already paid your initial signup fee. Future yearly renewals are billed at
                    the standard rate of ₦5,000.
                  </p>
                )}
              </div>
              <div className="text-right text-xs text-slate-500 max-w-[180px]">
                Payment is securely processed with Paystack. You&apos;ll be redirected to their page.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 bg-white text-xs text-slate-700 space-y-1">
              <p>
                <span className="font-semibold">KYC Status:</span> {status}
              </p>
              <p>
                <span className="font-semibold">Payment Status:</span> {paymentStatus}
              </p>
              {validUntil && (
                <p>
                  <span className="font-semibold">Valid Until:</span>{" "}
                  {validUntil.toLocaleDateString()}{" "}
                  {isExpired && <span className="ml-1 text-red-600">(Expired)</span>}
                  {isActive && <span className="ml-1 text-emerald-600">(Active)</span>}
                </p>
              )}
              {renewalCount > 0 && (
                <p className="text-slate-500">
                  Renewed <span className="font-semibold">{renewalCount}</span> time{renewalCount === 1 ? "" : "s"}.
                </p>
              )}
              <p className="mt-2 text-slate-500">
                You can only pay after your WhatsApp interview has been completed and approved by admin.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              ← Back to Dashboard
            </Link>

            <button
              type="button"
              onClick={handleInitializePayment}
              disabled={!canPay || initializing}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-lime-500 text-slate-900 text-sm font-semibold shadow-sm hover:bg-lime-400 disabled:opacity-50"
            >
              {initializing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting to Paystack...
                </>
              ) : paymentStatus === "SUCCESS" ? (
                "Payment Completed"
              ) : !kyc ? (
                "KYC Form Required"
              ) : !canPay ? (
                "Waiting for Approval"
              ) : (
                "Pay with Paystack"
              )}
            </button>
          </div>

          {paymentStatus === "SUCCESS" && kyc && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleInitializeRenewal}
                disabled={renewInitializing}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 text-slate-50 text-xs font-semibold shadow-sm hover:bg-slate-800 disabled:opacity-50"
              >
                {renewInitializing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redirecting to Paystack...
                  </>
                ) : (
                  "Renew for ₦5,000"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
