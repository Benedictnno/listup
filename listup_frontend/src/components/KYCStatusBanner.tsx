"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, ChevronRight, Clock, Loader2 } from "lucide-react";
import api from "@/utils/axios";

interface KYCStatusBannerProps {
  isKYCVerified?: boolean;
  listingLimit?: number; // -1 for unlimited
  currentListingsCount?: number;
}

export default function KYCStatusBanner({
  isKYCVerified = false,
  listingLimit = 3,
  currentListingsCount = 0,
}: KYCStatusBannerProps) {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const res = await api.get("/kyc/status");
        if (res.data?.success && res.data.data.kyc) {
          setKycStatus(res.data.data.kyc.status);
        }
      } catch (error) {
        console.error("Failed to fetch KYC status", error);
      } finally {
        setLoading(false);
      }
    };

    if (!isKYCVerified) {
      fetchKYCStatus();
    }
  }, [isKYCVerified]);

  if (isKYCVerified || listingLimit === -1) return null;

  const remaining = Math.max((listingLimit || 3) - (currentListingsCount || 0), 0);

  // If loading, show nothing or a skeleton? Showing nothing to avoid flicker
  if (loading) return null;

  // Submitted / Pending State
  if (kycStatus === "PENDING" || kycStatus === "IN_REVIEW") {
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">
              KYC Verification in Progress
            </p>
            <p className="text-xs text-blue-800 mt-1">
              Your documents have been submitted and are being reviewed. We will contact you shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Rejected State (optional, but good for UX)
  if (kycStatus === "REJECTED") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">
              KYC Verification Rejected
            </p>
            <p className="text-xs text-red-800 mt-1">
              Please update your information and try again.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Link
            href="/kyc/submit"
            className="inline-flex items-center gap-1 rounded-xl bg-red-600 text-white text-xs font-semibold px-3 py-2 shadow-sm hover:bg-red-700"
          >
            Resubmit KYC
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    );
  }

  // Default / Not Submitted State
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {remaining > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-amber-900">
            Complete KYC to unlock unlimited listings
          </p>
          <p className="text-xs text-amber-800 mt-1">
            You can create up to <span className="font-semibold">{listingLimit}</span> listings before KYC
            approval. {remaining > 0 ? (
              <>
                You have <span className="font-semibold">{remaining}</span> listing
                {remaining === 1 ? "" : "s"} remaining.
              </>
            ) : (
              <>You&apos;ve reached your free listing limit. Complete KYC to continue posting.</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Link
          href="/kyc/submit"
          className="inline-flex items-center gap-1 rounded-xl bg-amber-600 text-white text-xs font-semibold px-3 py-2 shadow-sm hover:bg-amber-700"
        >
          Complete KYC
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
