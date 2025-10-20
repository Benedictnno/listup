import { Mail, Phone, Store, Eye, CheckCircle, XCircle } from "lucide-react";
import { Vendor } from "@/components/vendors/types";
import { StatusBadge } from "@/components/vendors/StatusBadge";

interface VendorItemProps {
  vendor: Vendor;
  actionLoadingId: string | null;
  onView: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function VendorItem({
  vendor,
  actionLoadingId,
  onView,
  onApprove,
  onReject,
}: VendorItemProps) {
  return (
    <div className="p-4 md:p-6 hover:bg-muted/50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
            {vendor.vendorProfile.logo ? (
              <img
                src={vendor.vendorProfile.logo}
                alt={vendor.vendorProfile.storeName}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <Store className="w-6 h-6 text-primary" />
            )}
          </div>

          <div>
            <h3 className="font-medium">{vendor.name}</h3>
            <p className="text-sm text-muted-foreground">{vendor.vendorProfile.storeName}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {vendor.email}
              </span>
              {vendor.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {vendor.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge status={vendor.vendorProfile.verificationStatus} />
          <button
            onClick={onView}
            className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-muted"
          >
            <Eye className="w-4 h-4" /> View
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={onApprove}
          disabled={actionLoadingId === vendor.id}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          {actionLoadingId === vendor.id ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={() => onReject(prompt("Enter rejection reason:") || "")}
          disabled={actionLoadingId === vendor.id}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          {actionLoadingId === vendor.id ? "Rejecting..." : "Reject"}
        </button>
      </div>
    </div>
  );
}