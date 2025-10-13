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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Vendor Management</h1>
              <p className="text-sm text-gray-500">Manage vendor registrations and approvals</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search vendors by name, email, or store name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-transparent"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Vendors List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Vendors ({filteredVendors.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {filteredVendors.map((vendor) => (
              <div key={vendor.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {vendor.vendorProfile.logo ? (
                        <img 
                          src={vendor.vendorProfile.logo} 
                          alt={vendor.vendorProfile.storeName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Store className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-500">{vendor.vendorProfile.storeName}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
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
                    <div className="text-right">
                      <StatusBadge status={vendor.vendorProfile.verificationStatus} />
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(vendor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setShowDetails(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      
                      {vendor.vendorProfile.verificationStatus === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            disabled={actionLoading === vendor.id}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {actionLoading === vendor.id ? (
                              <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          
                          <button
                            onClick={() => {
                              const reason = prompt("Please provide a reason for rejection:");
                              if (reason) {
                                handleReject(vendor.id, reason);
                              }
                            }}
                            disabled={actionLoading === vendor.id}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Details Modal */}
        {showDetails && selectedVendor && (
          <VendorDetailsModal
            vendor={selectedVendor}
            onClose={() => setShowDetails(false)}
            onApprove={() => handleApprove(selectedVendor.id)}
            onReject={(reason) => handleReject(selectedVendor.id, reason)}
            loading={actionLoading === selectedVendor.id}
          />
        )}
      </div>
    </div>
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

function VendorDetailsModal({ vendor, onClose, onApprove, onReject, loading }: {
  vendor: Vendor;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
  loading: boolean;
}) {
  const [rejectReason, setRejectReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Vendor Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.email}</span>
                </div>
                {vendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{vendor.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Store Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.vendorProfile.storeName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{vendor.vendorProfile.storeAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Joined {new Date(vendor.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Business Category */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Business Category</h3>
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {vendor.vendorProfile.businessCategory}
            </span>
          </div>

          {/* Verification Status */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Verification Status</h3>
            <StatusBadge status={vendor.vendorProfile.verificationStatus} />
            {vendor.vendorProfile.rejectionReason && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {vendor.vendorProfile.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {vendor.vendorProfile.verificationStatus === "PENDING" && (
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={onApprove}
                disabled={loading}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    onReject(rejectReason);
                    setRejectReason("");
                  }
                }}
                disabled={loading || !rejectReason.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
