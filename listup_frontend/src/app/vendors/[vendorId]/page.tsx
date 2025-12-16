"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Store, Package, Star, Phone, MessageSquare, Send } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getVendorListings, Vendor, VendorListing, VendorListingsResponse } from "@/lib/api/vendors";

export default function VendorProfilePage() {
  const params = useParams();
  const vendorId = params.vendorId as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    fetchVendorListings();
  }, [vendorId, pagination.page]);

  console.log(vendor);

  const fetchVendorListings = async () => {
    try {
      setLoading(true);
      const data = await getVendorListings(vendorId, pagination.page, pagination.limit);

      if (data.success) {
        setVendor(data.data.vendor);
        setListings(data.data.listings);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to load vendor data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || 'Vendor not found'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error || 'The vendor you are looking for does not exist or has been removed.'}
            </p>
            <Link href="/listings">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/listings" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vendor Profile Section */}
        <div className="bg-white rounded-xl shadow-sm border mb-8 overflow-hidden">
          {/* Cover Image */}
          {vendor.coverImage && (
            <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 relative">
              <Image
                src={vendor.coverImage}
                alt={`${vendor.storeName || vendor.name} cover`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </div>
          )}

          {/* Vendor Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 border border-gray-100 shadow-sm flex-shrink-0">
                    {(vendor.logo || vendor.profileImage) ? (
                      <Image
                        src={vendor.logo || vendor.profileImage || ''}
                        alt={vendor.storeName || vendor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 text-2xl font-bold">
                        {(vendor.storeName || vendor.name).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {vendor.storeName || vendor.name}
                  </h1>
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  {vendor.businessCategory && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Store className="w-4 h-4 mr-2" />
                      {vendor.businessCategory}
                    </span>
                  )}
                </p>
                {vendor.storeAddress && (
                  <p className="text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {vendor.storeAddress}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowPhone(!showPhone)}
                >
                  <Phone className="w-4 h-4" />
                  {showPhone ? 'Hide Contact' : 'Show Contact'}
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                  onClick={() => {
                    const raw = (vendor.phone || "").replace(/[^0-9]/g, "");
                    if (!raw) {
                      alert("Vendor has no WhatsApp number available.");
                      return;
                    }
                    let phone = raw;
                    if (phone.length === 11 && phone.startsWith("0")) {
                      phone = `234${phone.slice(1)}`;
                    }

                    const text = encodeURIComponent(`Hi ${vendor.storeName || vendor.name}, I found your store on Listup.ng and I'm interested in your products.`);
                    const url = `https://wa.me/${phone}?text=${text}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Send className="w-4 h-4" />
                  Start Chat
                </Button>
              </div>
            </div>

            {/* Contact Info (Hidden by default) */}
            {showPhone && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p className="text-gray-600 text-lg font-medium flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-600" />
                  {vendor.phone || "No contact number available"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Products ({pagination.total})
            </h2>
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600">
                This vendor hasn't listed any products yet. Check back later!
              </p>
            </div>
          ) : (
            <>
              {/* Listings Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-0">
                        <div className="relative">
                          <Image
                            src={listing.images[0] || '/placeholder.svg'}
                            alt={listing.title}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute top-2 right-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-900 shadow-sm">
                              {listing.condition}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                            {listing.title}
                          </h3>
                          <p className="text-2xl font-bold text-green-600 mb-2">
                            ₦{listing.price.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {listing.location}
                            </span>
                            <span className="flex items-center">
                              <Package className="w-3 h-3 mr-1" />
                              {listing.category?.name}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center mt-8">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10 h-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
