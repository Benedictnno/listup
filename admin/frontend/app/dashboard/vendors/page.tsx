"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/store/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Vendor } from "@/components/vendors/types";
import VendorFilters from "@/components/vendors/VendorFilters";
import VendorItem from "@/components/vendors/VendorItem";
import VendorDetailsModal from "@/components/vendors/VendorDetailsModal";
import { StatusBadge } from "@/components/vendors/StatusBadge";
import useAuth from "@/hooks/useAuth";
import { XCircle, User, Mail, Phone, Store, MapPin, Calendar } from "lucide-react";

export default function VendorsPage() {
  // State variables
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVendors, setTotalVendors] = useState(0);
  const limit = 20;

  const { user } = useAuth();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api';

  // Force authentication for testing
  // useEffect(() => {
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('admin_token', 'mock-token-for-testing');
  //     localStorage.setItem('admin_user', JSON.stringify({
  //       id: 'admin-1',
  //       name: 'Admin User',
  //       email: 'admin@example.com',
  //       role: 'admin'
  //     }));
  //   }
  // }, []);

  useEffect(() => {
    fetchVendors();
  }, [page, statusFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const statusParam = statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
      const response = await fetch(
        `${API_URL}/vendors?page=${page}&limit=${limit}${statusParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        const vendorsData = data.data?.vendors || data.data || [];
        setVendors(Array.isArray(vendorsData) ? vendorsData : []);
        setTotalPages(data.data?.totalPages || Math.ceil((data.data?.total || 0) / limit));
        setTotalVendors(data.data?.total || vendorsData.length);
      } else {
        setError("Failed to load vendors");
        setVendors([]);
      }
    } catch (err) {
      setError("Failed to load vendors");
      setVendors([]);
      console.error("Vendors error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (vendorId: string) => {
    try {
      setActionLoading(vendorId);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/vendors/${vendorId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchVendors(); // Refresh the list
      } else {
        setError("Failed to suspend vendor");
      }
    } catch (err) {
      setError("Failed to suspend vendor");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.vendorProfile.storeName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || vendor.vendorProfile.verificationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading vendors...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Vendor Management</h1>
            <p className="text-muted-foreground">Manage vendor registrations and approvals</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm">
              <span className="font-semibold">{filteredVendors.length}</span> of <span className="font-semibold">{totalVendors}</span> vendors
            </div>
          </div>
        </div>

        {/* Filters */}
        <VendorFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={(value) => setSearchTerm(value)}
          onStatusChange={(value) => setStatusFilter(value)}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">
            <p>{error}</p>
          </div>
        )}

        {/* Vendors List */}
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 md:p-6 border-b">
            <h2 className="text-xl font-semibold">Vendors</h2>
            <p className="text-muted-foreground text-sm">
              Manage vendor accounts and approval status
            </p>
          </div>

          <div className="divide-y">
            {filteredVendors.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-muted-foreground">No vendors found matching your criteria</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <VendorItem
                  key={vendor.id}
                  vendor={vendor}
                  actionLoadingId={actionLoading}
                  onView={() => {
                    setSelectedVendor(vendor);
                    setShowDetails(true);
                  }}
                  onSuspend={() => handleSuspend(vendor.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="bg-card rounded-lg border shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vendor Details Modal */}
        {showDetails && selectedVendor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Vendor Details</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Personal Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedVendor.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedVendor.email}</span>
                      </div>
                      {selectedVendor.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{selectedVendor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Store Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedVendor.vendorProfile.storeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{selectedVendor.vendorProfile.storeAddress}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          Joined {new Date(selectedVendor.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Category */}
                <div>
                  <h3 className="font-medium mb-2">Business Category</h3>
                  <span className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    {selectedVendor.vendorProfile.businessCategory}
                  </span>
                </div>

                {/* Verification Status */}
                <div>
                  <h3 className="font-medium mb-2">Verification Status</h3>
                  <StatusBadge status={selectedVendor.vendorProfile.verificationStatus} />
                  {selectedVendor.vendorProfile.rejectionReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Rejection Reason:</strong> {selectedVendor.vendorProfile.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


