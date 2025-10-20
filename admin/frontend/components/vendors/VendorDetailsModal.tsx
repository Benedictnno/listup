"use client";

import { useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";
import { Vendor } from "@/components/vendors/types";
import { StatusBadge } from "@/components/vendors/StatusBadge";

interface VendorDetailsModalProps {
  open: boolean;
  vendor: Vendor | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  actionLoadingId: string | null;
}

export default function VendorDetailsModal({
  open,
  vendor,
  onClose,
  onApprove,
  onReject,
  actionLoadingId,
}: VendorDetailsModalProps) {
  const [rejectReason, setRejectReason] = useState("");

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border shadow-lg w-full max-w-3xl">
        <div className="p-4 md:p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Vendor Details</h3>
          <StatusBadge status={vendor.vendorProfile.verificationStatus} />
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Personal Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{vendor.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{vendor.email}</span>
              </div>
              {vendor.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Store Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Store Info</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{vendor.vendorProfile.storeAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Category:</span>
                <span>{vendor.vendorProfile.businessCategory}</span>
              </div>
              {vendor.vendorProfile.website && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Website:</span>
                  <a href={vendor.vendorProfile.website} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                    {vendor.vendorProfile.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Verification Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Verification</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><span className="text-muted-foreground">Status:</span> {vendor.vendorProfile.verificationStatus}</div>
              {vendor.vendorProfile.verifiedAt && (
                <div><span className="text-muted-foreground">Verified At:</span> {new Date(vendor.vendorProfile.verifiedAt).toLocaleString()}</div>
              )}
              {vendor.vendorProfile.verifiedBy && (
                <div><span className="text-muted-foreground">Verified By:</span> {vendor.vendorProfile.verifiedBy}</div>
              )}
              {vendor.vendorProfile.rejectionReason && (
                <div><span className="text-muted-foreground">Rejection Reason:</span> {vendor.vendorProfile.rejectionReason}</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                disabled={actionLoadingId === vendor.id}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoadingId === vendor.id ? "Approving..." : "Approve Vendor"}
              </button>

              <button
                onClick={() => onReject(rejectReason)}
                disabled={actionLoadingId === vendor.id || !rejectReason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {actionLoadingId === vendor.id ? "Rejecting..." : "Reject Vendor"}
              </button>
            </div>

            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter rejection reason (required to reject)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-muted">Close</button>
        </div>
      </div>
    </div>
  );
}