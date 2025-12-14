"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Vendor } from "@/components/vendors/types";
import vendorsService from "@/services/vendorsService";
import { StatusBadge } from "@/components/vendors/StatusBadge";
import { ArrowLeft, CheckCircle, XCircle, Store, Mail, Phone, MapPin, Calendar } from "lucide-react";

export default function VendorDetailsPage() {
  const params = useParams<{ vendorId: string }>();
  const router = useRouter();
  const vendorId = params?.vendorId;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  useEffect(() => {
    if (!vendorId) return;
    const fetchVendor = async () => {
      try {
        setLoading(true);
        const data = await vendorsService.getById(vendorId);
        setVendor(data);
        setError("");
      } catch (e: Error | unknown) {
        const errorMessage = e instanceof Error ? e.message : "Failed to load vendor";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [vendorId]);

  const approveVendor = async () => {
    if (!vendorId) return;
    try {
      setActionLoading(true);
      const data = await vendorsService.approve(vendorId);
      setVendor(data);
      setError("");
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to approve vendor";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectVendor = async () => {
    if (!vendorId) return;
    try {
      setActionLoading(true);
      const data = await vendorsService.reject(vendorId, rejectReason);
      setVendor(data);
      setError("");
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : "Failed to reject vendor";
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendor details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="mt-6 bg-destructive/10 text-destructive rounded-lg p-4"><p>{error}</p></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="p-6">No vendor found.</div>
      </DashboardLayout>
    );
  }

  const createdFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" });
  const verifiedFmt = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md hover:bg-muted">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <StatusBadge status={vendor.vendorProfile.verificationStatus} />
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 md:p-6 border-b flex items-center gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              {vendor.vendorProfile.logo ? (
                <Image
                  src={vendor.vendorProfile.logo}
                  alt={vendor.vendorProfile.storeName}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <Store className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{vendor.vendorProfile.storeName}</h1>
              <p className="text-muted-foreground">{vendor.name}</p>
            </div>
          </div>

          <div className="p-4 md:p-6 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Personal Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><span>{vendor.email}</span></div>
                {vendor.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span>{vendor.phone}</span></div>}
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-muted-foreground" /><span>Joined {createdFmt.format(new Date(vendor.createdAt))}</span></div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Store Info</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{vendor.vendorProfile.storeAddress}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Category:</span><span>{vendor.vendorProfile.businessCategory}</span></div>
                {vendor.vendorProfile.website && (
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">Website:</span><a href={vendor.vendorProfile.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">{vendor.vendorProfile.website}</a></div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Verification</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">Status:</span> {vendor.vendorProfile.verificationStatus}</div>
                {vendor.vendorProfile.verifiedAt && <div><span className="text-muted-foreground">Verified At:</span> {verifiedFmt.format(new Date(vendor.vendorProfile.verifiedAt))}</div>}
                {vendor.vendorProfile.verifiedBy && <div><span className="text-muted-foreground">Verified By:</span> {vendor.vendorProfile.verifiedBy}</div>}
                {vendor.vendorProfile.rejectionReason && <div><span className="text-muted-foreground">Rejection Reason:</span> {vendor.vendorProfile.rejectionReason}</div>}
              </div>
            </div>

            <div className="pt-4 border-t flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex gap-2">
                <button onClick={approveVendor} disabled={actionLoading} className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> {actionLoading ? "Approving..." : "Approve Vendor"}
                </button>
                <button onClick={rejectVendor} disabled={actionLoading || !rejectReason.trim()} className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> {actionLoading ? "Rejecting..." : "Reject Vendor"}
                </button>
              </div>
              <div className="flex-1">
                <input type="text" placeholder="Enter rejection reason (required to reject)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}