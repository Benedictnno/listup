"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axios";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { parseApiError } from "@/utils/errorHandler";
import {
  QrCode,
  Copy,
  Check,
  Link2,
  Share2,
  Loader2,
  Gift,
  Users,
  Wallet,
  Clock3,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
  completedReferrals: number;
  pendingEarnings: number;
}

interface ReferralVendorRow {
  id: string;
  vendorId: string;
  vendorName: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  storeName: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MyCodeResponse {
  code: string;
  referralUrl: string;
  qrCodeUrl: string;
  stats: ReferralStats;
}

export default function ReferralDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [referralData, setReferralData] = useState<MyCodeResponse | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [rows, setRows] = useState<ReferralVendorRow[]>([]);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [codeRes, statsRes] = await Promise.all([
          api.get("/referrals/my-code"),
          api.get("/referrals/my-stats"),
        ]);

        if (codeRes.data?.success) {
          setReferralData(codeRes.data.data as MyCodeResponse);
          setStats(codeRes.data.data.stats);
        }

        if (statsRes.data?.success) {
          setStats(statsRes.data.data.stats);
          setRows(statsRes.data.data.referrals as ReferralVendorRow[]);
        }
      } catch (error) {
        console.error("Error loading referral data", error);
        setError(parseApiError(error));
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  const handleCopy = async (value: string, type: "code" | "link") => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "code") {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 1200);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1200);
      }
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  const handleShare = async () => {
    if (!referralData) return;
    const text = `Join me on ListUp and save ₦2,000 on your vendor signup fee! Use my referral link: ${referralData.referralUrl}`;

    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: "Join me on ListUp",
          text,
          url: referralData.referralUrl,
        });
      } catch (e) {
        console.error("Native share failed", e);
      }
    } else {
      handleCopy(text, "link");
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-lime-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5" />
          <div>
            <p className="font-medium mb-1">Failed to load referral dashboard</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const code = referralData?.code || "";
  const referralUrl = referralData?.referralUrl || "";
  const qrCodeUrl = referralData?.qrCodeUrl || "";
  const s =
    stats ||
    (referralData?.stats as ReferralStats) || {
      totalReferrals: 0,
      successfulReferrals: 0,
      totalEarnings: 0,
      pendingReferrals: 0,
      completedReferrals: 0,
      pendingEarnings: 0,
    };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-lime-50 to-emerald-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
            Referral Dashboard
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl">
            Earn ₦1,000 every time a vendor you refer completes KYC and pays their signup fee. Share your link and start earning.
          </p>
        </div>
        <div className="flex flex-col items-stretch md:items-end gap-2">
          <Button
            size="sm"
            variant="default"
            className="bg-lime-600 hover:bg-lime-700 inline-flex items-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
            Share Referral Link
          </Button>
          <button
            type="button"
            onClick={() => setShowQr((s) => !s)}
            className="text-xs text-slate-600 hover:text-slate-800 inline-flex items-center gap-1"
          >
            <QrCode className="w-4 h-4" />
            {showQr ? "Hide QR Code" : "Show QR Code"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Referrals
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.totalReferrals}</p>
          </div>
          <Users className="w-8 h-8 text-lime-600" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Successful
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{s.successfulReferrals}</p>
          </div>
          <Gift className="w-8 h-8 text-emerald-600" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pending Earnings
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₦{(s.pendingEarnings || 0).toLocaleString()}
            </p>
          </div>
          <Clock3 className="w-8 h-8 text-amber-600" />
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Total Earnings
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₦{(s.totalEarnings || 0).toLocaleString()}
            </p>
          </div>
          <Wallet className="w-8 h-8 text-indigo-600" />
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Your Referral Code & Link
            </h2>

            <div className="space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Referral Code
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="px-3 py-2 rounded-lg bg-slate-900 text-lime-400 text-sm font-mono tracking-widest">
                    {code || "GENERATING..."}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(code, "code")}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Referral Link
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 truncate">
                    {referralUrl}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(referralUrl, "link")}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3 h-3" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-slate-700">
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="font-semibold mb-1">1. Share your link</p>
                <p>Send your unique referral link to vendors via WhatsApp, Instagram, or TikTok.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="font-semibold mb-1">2. Vendor signs up</p>
                <p>They create a ListUp vendor account using your referral code.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="font-semibold mb-1">3. KYC & payment</p>
                <p>Vendor completes KYC and pays the discounted signup fee.</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50">
                <p className="font-semibold mb-1">4. You get paid</p>
                <p>You earn ₦1,000 commission for every vendor who completes the process.</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">QR Code</h2>
          {showQr && qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="Referral QR Code"
              className="w-48 h-48 rounded-xl border border-slate-200 mb-2"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center px-4">
              Click "Show QR Code" above to generate your sharable QR image.
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2 text-center">
            Save or screenshot this QR code and share it on flyers, Instagram, or WhatsApp.
          </p>
        </div>
      </div>

      {/* Referral History Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-800">Referral History</h2>
          <p className="text-xs text-slate-500">
            {rows.length} vendor{rows.length === 1 ? "" : "s"} referred
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            You haven&apos;t referred any vendors yet. Share your link to start earning.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Vendor</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Store</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Status</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Commission</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Payment</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Referred On</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const created = new Date(r.createdAt);
                  const statusColor =
                    r.status === "COMPLETED"
                      ? "bg-emerald-100 text-emerald-800"
                      : r.status === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-700";

                  return (
                    <tr key={r.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 px-3 align-top">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">
                            {r.vendorName || "Unknown Vendor"}
                          </span>
                          <span className="text-slate-500">
                            {r.vendorEmail || ""}
                          </span>
                          {r.vendorPhone && (
                            <span className="text-slate-400 text-[11px]">
                              {r.vendorPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-3 align-top">
                        <span className="text-slate-700">
                          {r.storeName || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3 align-top">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${statusColor}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 align-top">
                        <span className="text-slate-800 font-medium">
                          ₦{(r.commission || 0).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-3 align-top">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            r.commissionPaid
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {r.commissionPaid ? "PAID" : "PENDING"}
                        </span>
                      </td>
                      <td className="py-2 px-3 align-top text-slate-600">
                        {created.toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
