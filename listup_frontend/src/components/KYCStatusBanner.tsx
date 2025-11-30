"use client";

import Link from "next/link";
import { ShieldCheck, AlertTriangle, ChevronRight } from "lucide-react";

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
  if (isKYCVerified || listingLimit === -1) return null;

  const remaining = Math.max((listingLimit || 3) - (currentListingsCount || 0), 0);

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
