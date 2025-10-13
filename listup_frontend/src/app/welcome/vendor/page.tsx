"use client";
import Link from "next/link";

export default function VendorWelcomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Welcome to ListUp Vendor Program</h1>
          <p className="mt-2 text-slate-600">Thanks for signing up! Your account is currently pending verification.</p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">What happens next</h2>
          <ul className="mt-3 list-disc pl-6 text-sm text-slate-700 space-y-1">
            <li>We’ll review your store details and reach out if we need anything.</li>
            <li>You’ll receive an email once your vendor account is approved.</li>
            <li>Approval typically takes a short time during working hours.</li>
          </ul>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900">Need help?</h3>
            <p className="mt-1 text-sm text-slate-700">
              You can contact support anytime. Meanwhile, you can explore listings and get familiar with the marketplace.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/" className="inline-flex items-center rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600">Go to Home</Link>
            <Link href="/listings" className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Browse Listings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}


