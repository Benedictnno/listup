"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  MapPin,
  Store,
  Package,
  Star,
  Phone,
  MessageSquare,
  Send,
  Share2,
  Heart,
  ChevronDown,
  Clock,
  ExternalLink,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  X,
  Eye,
  CheckCircle2,
  Truck,
  Copy
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVendorListings, Vendor, VendorListing, VendorListingsResponse } from "@/lib/api/vendors";
import { getFavourites, toggleFavourite, removeFavourite } from "@/lib/api/favourites";
import { useAuthStore } from "@/store/authStore";
import LoginPromptDialog from "@/components/LoginPromptDialog";
{/* Add auth store import if needed, assuming it's available */ }

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
  const [sortBy, setSortBy] = useState("newest");
  const [isSaved, setIsSaved] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<VendorListing | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [savedListingIds, setSavedListingIds] = useState<Set<string>>(new Set());
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchVendorListings();
    loadFavourites();
  }, [vendorId, pagination.page, sortBy]);

  const loadFavourites = async () => {
    try {
      if (user) {
        const favs = await getFavourites();
        const ids: Set<string> = new Set(
          favs.map((f: any) => f.listing?.id).filter((id: any): id is string => !!id)
        );
        setSavedListingIds(ids);
      }
    } catch (e) {
      console.error("Failed to load favourites", e);
    }
  };

  console.log(vendor);

  const fetchVendorListings = async () => {
    try {
      setLoading(true);
      const data = await getVendorListings(vendorId, pagination.page, pagination.limit, sortBy);

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
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Search Header */}
      {/* <div className="bg-[#1E293B] text-white py-3 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-lime-500 p-1.5 rounded-lg">
            <Store size={20} className="text-[#1E293B]" />
          </div>
          <span className="font-bold text-lg">ListUp</span>
          <span className="text-xs align-top">ng</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <Eye size={20} />
          </Button>
          <div className="relative">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Package size={20} />
            </Button>
            <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] w-4 h-4 rounded-full flex items-center justify-center">1</span>
          </div>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 py-0 md:py-8">
        {/* Hero / Cover Section */}
        <div className="relative h-[280px] md:h-[350px] w-full md:rounded-3xl overflow-hidden mb-[-80px] md:mb-[-100px]">
          {vendor.coverImage ? (
            <Image
              src={vendor.coverImage}
              alt={`${vendor.storeName || vendor.name} cover`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-lime-400 to-green-600"></div>
          )}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Floating Logo/Name for Mobile Hero */}
          <div className="absolute top-6 left-6 flex items-center gap-4 md:hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/90 backdrop-blur-sm p-1 shadow-lg border border-white/20">
              <div className="relative w-full h-full rounded-xl overflow-hidden bg-lime-100 flex items-center justify-center">
                {(vendor.logo || vendor.profileImage) ? (
                  <Image
                    src={vendor.logo || vendor.profileImage || ''}
                    alt={vendor.storeName || vendor.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-lime-700 capitalize">
                    {(vendor.storeName || vendor.name).charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-white drop-shadow-md">
              <h2 className="font-bold text-xl uppercase tracking-tight">{vendor.storeName || vendor.name}</h2>
              <p className="text-xs opacity-90">{vendor.businessCategory} | Fast delivery</p>
            </div>
          </div>
        </div>

        {/* Info Card (Glassmorphism) */}
        <div className="relative z-10 px-4 md:px-0">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-lime-500/10 p-1 rounded-full">
                    <CheckCircle2 size={18} className="text-lime-600" />
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight">
                    {vendor.storeName || vendor.name}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-3">
                  {vendor.isVerified && (
                    <Badge variant="secondary" className="bg-lime-50 text-lime-700 border-lime-100 px-3 py-1 flex items-center gap-1.5 rounded-full font-medium">
                      <CheckCircle2 size={14} />
                      Verified Vendor
                    </Badge>
                  )}
                  <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-100 px-3 py-1 flex items-center gap-1.5 rounded-full font-medium">
                    <MapPin size={14} />
                    {vendor.storeAddress || "EKSU CAMPUS"}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-3 py-1 rounded-full text-sm border border-amber-100">
                    <Star size={14} fill="currentColor" />
                    4.8 <span className="text-slate-400 font-normal ml-1">(210 recently)</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 rounded-2xl flex items-center gap-3 font-bold text-lg shadow-lg shadow-green-100 transition-all border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
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
                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                    }}
                  >
                    <MessageSquare size={22} />
                    Chat with Store
                  </Button>
                  <Button
                    variant="outline"
                    className="px-8 py-6 rounded-2xl flex items-center gap-3 font-bold text-lg border-2 border-slate-200 hover:bg-slate-50 transition-all"
                    onClick={() => setShowPhone(!showPhone)}
                  >
                    <Phone size={22} className="text-slate-400" />
                    {showPhone ? vendor.phone || 'No phone' : 'View Contact'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="lg"
                    className={`rounded-xl border-slate-200 flex items-center gap-2 font-semibold ${isSaved ? 'bg-red-50 text-red-500 border-red-100' : ''}`}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart size={20} fill={isSaved ? "currentColor" : "none"} />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-xl border-slate-200 flex items-center gap-2 font-semibold"
                    onClick={() => setIsShareModalOpen(true)}
                  >
                    <Share2 size={20} />
                    Share
                  </Button>
                </div>
                {vendor.storeAnnouncement && (
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-3 text-sm font-medium text-orange-800">
                    <div className="bg-orange-500 text-white p-1 rounded-full animate-pulse">
                      <span className="text-[10px]">🔥</span>
                    </div>
                    <p>
                      {vendor.storeAnnouncement}
                    </p>
                    <div className="ml-auto text-lime-500">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-0 pb-20">
          {/* Left: About & Info (Hidden on mobile, or moves to bottom) */}
          <div className="md:col-span-1 space-y-8 order-2 md:order-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                <Store size={20} className="text-lime-500" />
                About This Store
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                <span className="font-bold text-slate-800">{vendor.storeName || vendor.name}</span> {vendor.storeDescription || "is a dedicated campus store providing quality products and fast service to students."}
              </p>
              <div className="mt-6 space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Delivery Options</h4>
                    <p className="text-xs text-slate-500">Pick-up & Campus Delivery Available</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {(() => {
                        const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        const hours = vendor.businessHours?.[day as keyof typeof vendor.businessHours];
                        if (!hours || hours.closed) return "Closed Today";
                        return `Open Today: ${hours.open} - ${hours.close}`;
                      })()}
                    </h4>
                    <p className="text-xs text-slate-500">Fast service during school hours</p>
                  </div>
                </div>
              </div>
              {/* <Button variant="ghost" className="w-full mt-6 text-lime-600 font-bold hover:bg-lime-50 rounded-xl">
                See All Details
                <ArrowLeft size={16} className="rotate-180 ml-2" />
              </Button> */}
            </div>

            {/* Socials */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4 uppercase text-sm tracking-widest">Connect</h3>
              <div className="flex gap-3">
                {vendor.socialMedia?.instagram && (
                  <Link href={vendor.socialMedia.instagram.startsWith('http') ? vendor.socialMedia.instagram : `https://instagram.com/${vendor.socialMedia.instagram.replace('@', '')}`} target="_blank" className="p-3 bg-slate-50 hover:bg-lime-50 rounded-xl text-slate-400 hover:text-lime-600 transition-all border border-transparent hover:border-lime-100">
                    <Instagram size={20} />
                  </Link>
                )}
                {vendor.socialMedia?.facebook && (
                  <Link href={vendor.socialMedia.facebook.startsWith('http') ? vendor.socialMedia.facebook : `https://facebook.com/${vendor.socialMedia.facebook}`} target="_blank" className="p-3 bg-slate-50 hover:bg-lime-50 rounded-xl text-slate-400 hover:text-lime-600 transition-all border border-transparent hover:border-lime-100">
                    <Facebook size={20} />
                  </Link>
                )}
                {vendor.socialMedia?.twitter && (
                  <Link href={vendor.socialMedia.twitter.startsWith('http') ? vendor.socialMedia.twitter : `https://twitter.com/${vendor.socialMedia.twitter.replace('@', '')}`} target="_blank" className="p-3 bg-slate-50 hover:bg-lime-50 rounded-xl text-slate-400 hover:text-lime-600 transition-all border border-transparent hover:border-lime-100">
                    <Twitter size={20} />
                  </Link>
                )}
                {vendor.socialMedia?.linkedin && (
                  <Link href={vendor.socialMedia.linkedin.startsWith('http') ? vendor.socialMedia.linkedin : `https://linkedin.com/in/${vendor.socialMedia.linkedin}`} target="_blank" className="p-3 bg-slate-50 hover:bg-lime-50 rounded-xl text-slate-400 hover:text-lime-600 transition-all border border-transparent hover:border-lime-100">
                    <Linkedin size={20} />
                  </Link>
                )}
                {!vendor.socialMedia && (
                  <p className="text-xs text-slate-400 italic">No social links added</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Product Catalog */}
          <div className="md:col-span-3 order-1 md:order-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${sortBy === 'newest' ? 'text-slate-800 border-lime-500' : 'border-transparent'}`}
                >
                  Newest <ChevronDown size={14} />
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <button
                  onClick={() => setSortBy("price_asc")}
                  className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${sortBy === 'price_asc' ? 'text-slate-800 border-lime-500' : 'border-transparent'}`}
                >
                  Price: Low <ChevronDown size={14} />
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <button
                  onClick={() => setSortBy("popular")}
                  className={`flex items-center gap-2 pb-1 border-b-2 transition-all ${sortBy === 'popular' ? 'text-slate-800 border-lime-500' : 'border-transparent'}`}
                >
                  Most Viewed <ChevronDown size={14} />
                </button>
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                Sorted by: <span className="text-slate-800 ml-1">{sortBy.replace('_', ' ')}</span>
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="bg-white rounded-3xl p-20 text-center shadow-sm border border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-500">
                  This vendor hasn't listed any products yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Link href={`/listings/${listing.id}`}>
                    <div key={listing.id} className="group flex flex-col items-stretch">
                      <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-slate-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
                        <Image
                          src={listing.images[0] || '/placeholder.svg'}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        <Button
                          variant="secondary"
                          size="icon"
                          className={`absolute top-4 right-4 rounded-full bg-white/80 backdrop-blur-sm border-0 transition-colors ${savedListingIds.has(listing.id) ? 'text-red-500 bg-white' : 'text-slate-400 hover:text-red-500'}`}
                          onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              if (!user) {
                                setShowLoginPrompt(true);
                                return;
                              }
                              if (savedListingIds.has(listing.id)) {
                                await removeFavourite(listing.id);
                                setSavedListingIds(prev => {
                                  const next = new Set(prev);
                                  next.delete(listing.id);
                                  return next;
                                });
                              } else {
                                await toggleFavourite(listing.id);
                                setSavedListingIds(prev => new Set(prev).add(listing.id));
                              }
                            } catch (e) {
                              console.error("Failed to toggle save", e);
                            }
                          }}
                        >
                          <Heart size={18} fill={savedListingIds.has(listing.id) ? "currentColor" : "none"} />
                        </Button>

                        {/* Hover Overlay */}
                        {/* <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          className="bg-white text-[#1E293B] hover:bg-lime-500 hover:text-white rounded-full px-6 font-bold flex items-center gap-2"
                          onClick={() => setQuickViewProduct(listing)}
                        >
                          <Eye size={18} />
                          Quick View
                        </Button>
                        <Link href={`/listings/${listing.id}`}>
                          <Button className="bg-lime-500 text-[#1E293B] hover:bg-white rounded-full px-6 font-bold">
                            View Now
                          </Button>
                        </Link>
                      </div> */}
                      </div>
                      <div className="px-2">
                        <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-1 group-hover:text-lime-600 transition-colors">
                          {listing.title}
                        </h3>
                        <p className="text-xl font-black text-green-600 mb-1">
                          ₦{listing.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                          <MapPin size={12} className="text-lime-500" />
                          {listing.location || "EKSU CAMPUS"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center mt-12 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-xl border-slate-200"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 p-0 rounded-xl font-bold ${pageNum === pagination.page ? 'bg-lime-500 text-[#1E293B] hover:bg-lime-600' : 'border-slate-200'}`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="rounded-xl border-slate-200"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={!!quickViewProduct} onOpenChange={() => setQuickViewProduct(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-0">
          {quickViewProduct && (
            <div className="flex flex-col md:flex-row h-full">
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto h-[300px] md:h-auto">
                <Image
                  src={quickViewProduct.images[0] || '/placeholder.svg'}
                  alt={quickViewProduct.title}
                  fill
                  className="object-cover"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-lime-600 border-0 flex items-center gap-1.5 py-1.5 px-3">
                  <CheckCircle2 size={14} /> Quick View
                </Badge>
              </div>
              <div className="w-full md:w-1/2 p-8 flex flex-col">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-black text-slate-800 leading-tight">
                    {quickViewProduct.title}
                  </DialogTitle>
                </DialogHeader>
                <p className="text-3xl font-black text-green-600 mb-4">
                  ₦{quickViewProduct.price.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 text-slate-500 font-bold mb-6 text-sm">
                  <MapPin size={16} className="text-lime-500" />
                  EKSU CAMPUS
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-8 line-clamp-4">
                  {quickViewProduct.description}
                </p>
                <div className="mt-auto">
                  <Link href={`/listings/${quickViewProduct.id}`}>
                    <Button className="w-full bg-green-600 hover:bg-green-700 h-14 rounded-2xl text-lg font-bold shadow-lg shadow-green-100">
                      View full details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Modal (Simplified for demo) */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <DialogTitle>Share this store</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-4 gap-4 py-4">
            <Button variant="outline" className="flex flex-col gap-2 h-20 rounded-2xl border-slate-100">
              <Instagram className="text-pink-600" />
              <span className="text-[10px]">Instagram</span>
            </Button>
            <Button variant="outline" className="flex flex-col gap-2 h-20 rounded-2xl border-slate-100">
              <Facebook className="text-blue-600" />
              <span className="text-[10px]">Facebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col gap-2 h-20 rounded-2xl border-slate-100">
              <Twitter className="text-sky-500" />
              <span className="text-[10px]">Twitter</span>
            </Button>
            <Button variant="outline" className="flex flex-col gap-2 h-20 rounded-2xl border-slate-100" onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }}>
              <Copy size={20} className="text-slate-400" />
              <span className="text-[10px]">Copy Link</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <LoginPromptDialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    </div>
  );
}
