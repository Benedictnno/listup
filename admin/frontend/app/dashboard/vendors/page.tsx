"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Store, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";
import { useAdminAuth } from "@/store/authStore";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  vendorProfile: {
    id: string;
    storeName: string;
    storeAddress: string;
    businessCategory: string;
    coverImage?: string;
    logo?: string;
    website?: string;
    isVerified: boolean;
    verificationStatus: string;
    rejectionReason?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    createdAt: string;
  };
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { user } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    fetchVendors();
  }, [user, router]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:4001'}/api/vendors`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data.data.vendors);
      } else {
        setError("Failed to load vendors");
      }
    } catch (err) {
      setError("Failed to load vendors");
      console.error("Vendors error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    try {
      setActionLoading(vendorId);
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:4001'}/api/vendors/${vendorId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await fetchVendors(); // Refresh the list
      } else {
        setError("Failed to approve vendor");
      }
    } catch (err) {
      setError("Failed to approve vendor");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (vendorId: string, reason: string) => {
    try {
      setActionLoading(vendorId);
      const token = localStorage.getItem("admin_token");
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:4001'}/api/vendors/${vendorId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        await fetchVendors(); // Refresh the list
      } else {
        setError("Failed to reject vendor");
      }
    } catch (err) {
      setError("Failed to reject vendor");
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
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-md">
              <span className="font-semibold">{filteredVendors.length}</span> vendors
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors by name, email, or store name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

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
                <div key={vendor.id} className="p-4 md:p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                        {vendor.vendorProfile.logo ? (
                          <img src={vendor.vendorProfile.logo} alt={vendor.vendorProfile.storeName} className="w-full h-full object-cover rounded-md" />
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <StatusBadge status={vendor.vendorProfile.verificationStatus} />
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setShowDetails(true);
                          }}
                          className="flex items-center gap-1 px-3 py-1 text-sm rounded-md hover:bg-muted transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        
                        {vendor.vendorProfile.verificationStatus === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleApprove(vendor.id)}
                              disabled={actionLoading === vendor.id}
                              className="flex items-center gap-1 px-3 py-1 text-sm rounded-md text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === vendor.id ? (
                                <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const reason = prompt("Please provide a reason for rejection:");
                                if (reason) {
                                  handleReject(vendor.id, reason);
                                }
                              }}
                              disabled={actionLoading === vendor.id}
                              className="flex items-center gap-1 px-3 py-1 text-sm rounded-md text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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

                {/* Actions */}
                {selectedVendor.vendorProfile.verificationStatus === "PENDING" && (
                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(selectedVendor.id)}
                      disabled={actionLoading === selectedVendor.id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Vendor
                    </button>
                    
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Rejection reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        if (rejectReason.trim()) {
                          handleReject(selectedVendor.id, rejectReason);
                          setRejectReason("");
                        }
                      }}
                      disabled={actionLoading === selectedVendor.id || !rejectReason.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
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

function StatusBadge({ status }: { status: string }) {
  const statusClasses = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800"
  };

  const statusIcons = {
    PENDING: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle
  };

  const Icon = statusIcons[status as keyof typeof statusIcons] || Clock;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
