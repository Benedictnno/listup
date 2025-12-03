import { Mail, Phone, Store, Eye, Ban } from "lucide-react";
import { Vendor } from "@/components/vendors/types";
import { StatusBadge } from "@/components/vendors/StatusBadge";

interface VendorItemProps {
  vendor: Vendor;
  actionLoadingId: string | null;
  onView: () => void;
  onSuspend?: () => void;
}

export default function VendorItem({
  vendor,
  actionLoadingId,
  onView,
  onSuspend,
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

        <div className="flex items-center gap-2">
          <StatusBadge status={vendor.vendorProfile.verificationStatus} />
          <button
            onClick={onView}
            className="inline-flex items-center gap-1 px-3 py-1.5 border rounded-md hover:bg-muted"
          >
            <Eye className="w-4 h-4" /> View
          </button>
          {onSuspend && (
            <button
              onClick={onSuspend}
              disabled={actionLoadingId === vendor.id}
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-orange-300 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 disabled:opacity-50"
            >
              <Ban className="w-4 h-4" />
              {actionLoadingId === vendor.id ? "Processing..." : "Suspend"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}