"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchVendorListings, updateListing, deleteListing } from "@/lib/api/listing";
import { safeLocalStorage } from "@/utils/helpers";
import { 
  Edit, 
  Trash2, 
  Eye, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  CheckSquare,
  Square,
  SortAsc,
  SortDesc,
  Package
} from "lucide-react";
import Image from "next/image";

interface Listing {
  id: string;
  title: string;
  price: number;
  stock: number;
  description: string;
  images?: string[];
  status: 'active' | 'inactive' | 'pending' | 'sold';
  category: string;
  views: number;
  sales: number;
  revenue: number;
  createdAt: string;
  seoScore?: number;
}

interface FilterState {
  search: string;
  status: string;
  category: string;
  priceRange: { min: number; max: number };
  stockLevel: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function VendorListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Promotion plans with per-day pricing
  const promotionPlans = [
    { type: "PRODUCT_PROMOTION", name: "Product Promotion", price: 300, description: "Boost individual product visibility" },
    { type: "SEARCH_BOOST", name: "Search Boost", price: 200, description: "Rank higher in search results" }
  ];
  const [editing, setEditing] = useState<Listing | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteListings, setPromoteListings] = useState<string[]>([]);
  const [promotePlan, setPromotePlan] = useState<string>("");
  const [promoteDuration, setPromoteDuration] = useState<number>(7);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    category: '',
    priceRange: { min: 0, max: 1000000 },
    stockLevel: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const id: string | undefined = safeLocalStorage.getItem("id") || undefined;

  useEffect(() => {
    async function loadListings() {
      try {
        const res = await fetchVendorListings(id);
        // Add mock data for demonstration
        const enhancedListings = res.map((listing: { id: string; title: string; price: number; status: string; createdAt?: string; created_at?: string; image?: string; images?: string[]; category?: string }) => ({
          ...listing,
          status: listing.status || 'active',
          category: listing.category || 'Fashion & Clothing',
          views: Math.floor(Math.random() * 1000),
          sales: Math.floor(Math.random() * 50),
          revenue: listing.price * Math.floor(Math.random() * 50),
          createdAt: new Date().toISOString(),
          seoScore: Math.floor(Math.random() * 100)
        }));
        setListings(enhancedListings);
        setFilteredListings(enhancedListings);
      } catch (error) {
        console.error('Error loading listings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [id]);

  // Apply filters whenever filters or listings change
  useEffect(() => {
    let filtered = [...listings];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        listing.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(listing => listing.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    // Price range filter
    filtered = filtered.filter(listing =>
      listing.price >= filters.priceRange.min && listing.price <= filters.priceRange.max
    );

    // Stock level filter
    if (filters.stockLevel) {
      switch (filters.stockLevel) {
        case 'low':
          filtered = filtered.filter(listing => listing.stock <= 5);
          break;
        case 'out':
          filtered = filtered.filter(listing => listing.stock === 0);
          break;
        case 'high':
          filtered = filtered.filter(listing => listing.stock > 20);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[filters.sortBy as keyof Listing];
      let bValue = b[filters.sortBy as keyof Listing];
      
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      if (filters.sortOrder === 'asc') {
        return (aValue as string | number) > (bValue as string | number) ? 1 : -1;
      } else {
        return (aValue as string | number) < (bValue as string | number) ? 1 : -1;
      }
    });

    setFilteredListings(filtered);
  }, [listings, filters]);

  const handleSave = async (updated: Listing) => {
    try {
      const res = await updateListing(updated.id, updated);
      setListings(listings.map(l => (l.id === updated.id ? res : l)));
      setEditing(null);
    } catch (error) {
      console.error('Error updating listing:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      setSelectedListings(selectedListings.filter(selectedId => selectedId !== id));
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedListings.map(id => deleteListing(id)));
      setListings(listings.filter(l => !selectedListings.includes(l.id)));
      setSelectedListings([]);
    } catch (error) {
      console.error('Error bulk deleting listings:', error);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive' | 'pending' | 'sold') => {
    try {
      await Promise.all(selectedListings.map(id => updateListing(id, { status })));
      setListings(listings.map(l => 
        selectedListings.includes(l.id) ? { ...l, status } : l
      ));
      setSelectedListings([]);
    } catch (error) {
      console.error('Error bulk updating listings:', error);
    }
  };

  const handlePromoteProducts = () => {
    if (selectedListings.length === 0) {
      alert('Please select products to promote');
      return;
    }
    setPromoteListings([...selectedListings]);
    setShowPromoteModal(true);
  };

  const calculatePromotionCost = () => {
    if (!promotePlan || promoteDuration <= 0) return 0;
    const plan = promotionPlans.find(p => p.type === promotePlan);
    return plan ? plan.price * promoteDuration * promoteListings.length : 0;
  };

  const createPromotionAds = async () => {
    try {
      const token = safeLocalStorage.getItem("token");
      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      const plan = promotionPlans.find(p => p.type === promotePlan);
      if (!plan) {
        alert("Invalid promotion plan selected");
        return;
      }

      const totalAmount = calculatePromotionCost();
      
      // Create ads for each selected product
      const adPromises = promoteListings.map(async (listingId) => {
        const payload = {
          type: promotePlan,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + promoteDuration * 24 * 60 * 60 * 1000).toISOString(),
          vendorId: safeLocalStorage.getItem("id") || "",
          amount: plan.price * promoteDuration,
          status: "PENDING",
          paymentStatus: "PENDING",
          productId: listingId,
          appliesToAllProducts: false
        };

        // Call your createAd API function here
        // const ad = await createAd(payload);
        return payload;
      });

      await Promise.all(adPromises);
      alert(`Promotion ads created for ${promoteListings.length} products. Total cost: ₦${totalAmount.toLocaleString()}`);
      setShowPromoteModal(false);
      setPromoteListings([]);
      setPromotePlan("");
      setPromoteDuration(7);
      setSelectedListings([]);
    } catch (error) {
      console.error('Error creating promotion ads:', error);
      alert('Failed to create promotion ads. Please try again.');
    }
  };

  const toggleListingSelection = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return 'text-red-600';
    if (stock <= 5) return 'text-orange-600';
    return 'text-green-600';
  };

  if (loading) return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">My Listings</h2>
          <p className="text-gray-600">Manage your product listings and inventory</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  placeholder="Search listings..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="Fashion & Clothing">Fashion & Clothing</SelectItem>
                    <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                    <SelectItem value="Food & Snacks">Food & Snacks</SelectItem>
                    <SelectItem value="Handmade & Crafts">Handmade & Crafts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock Level</label>
                <Select value={filters.stockLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, stockLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stock Levels</SelectItem>
                    <SelectItem value="low">Low Stock (≤5)</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Price (₦)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.priceRange.min}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price (₦)</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.priceRange.max}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="views">Views</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  category: '',
                  priceRange: { min: 0, max: 1000000 },
                  stockLevel: '',
                  sortBy: 'createdAt',
                  sortOrder: 'desc'
                })}
              >
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }))}
              >
                {filters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedListings.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare size={20} className="text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedListings.length} listing(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('active')}
                >
                  Activate All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('inactive')}
                >
                  Deactivate All
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePromoteProducts}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp size={16} className="mr-2" />
                  Promote Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <Card key={listing.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              {/* Selection Checkbox */}
              <div className="flex justify-between items-start">
                <button
                  onClick={() => toggleListingSelection(listing.id)}
                  className="mt-1"
                >
                  {selectedListings.includes(listing.id) ? (
                    <CheckSquare size={18} className="text-lime-600" />
                  ) : (
                    <Square size={18} className="text-gray-400" />
                  )}
                </button>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(listing)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(listing.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {/* Product Image */}
              <Image 
                width={300}
                src={listing.images?.[0] || "/placeholder.png"}
                alt={listing.title}
                className="w-full h-40 object-cover rounded-lg"
              />

              {/* Product Info */}
              <div>
                <h3 className="text-lg font-semibold line-clamp-2">{listing.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                
                {/* Status and Category */}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {listing.category}
                  </span>
                </div>

                {/* Price and Stock */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold text-lime-600">₦{listing.price.toLocaleString()}</p>
                  <p className={`text-sm font-medium ${getStockColor(listing.stock)}`}>
                    Stock: {listing.stock}
                  </p>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <Eye size={14} />
                      <span className="text-xs font-medium">{listing.views}</span>
                    </div>
                    <span className="text-xs text-gray-500">Views</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <TrendingUp size={14} />
                      <span className="text-xs font-medium">{listing.sales}</span>
                    </div>
                    <span className="text-xs text-gray-500">Sales</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600">
                      <BarChart3 size={14} />
                      <span className="text-xs font-medium">{listing.seoScore}</span>
                    </div>
                    <span className="text-xs text-gray-500">SEO</span>
                  </div>
                </div>

                {/* Low Stock Alert */}
                {listing.stock <= 5 && listing.stock > 0 && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle size={14} className="text-orange-600" />
                    <span className="text-xs text-orange-700">Low stock alert</span>
                  </div>
                )}

                {/* Out of Stock Alert */}
                {listing.stock === 0 && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle size={14} className="text-red-600" />
                    <span className="text-xs text-red-700">Out of stock</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Package size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status || filters.category 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by creating your first listing'
              }
            </p>
            
          </CardContent>
        </Card>
      )}

      {/* Edit Modal */}
      {editing && (
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₦)</label>
                  <Input
                    type="number"
                    value={editing.price}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <Input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={editing.status} onValueChange={(value) => setEditing({ ...editing, status: value as 'active' | 'inactive' | 'pending' | 'sold' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Select value={editing.category} onValueChange={(value) => setEditing({ ...editing, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fashion & Clothing">Fashion & Clothing</SelectItem>
                      <SelectItem value="Beauty & Personal Care">Beauty & Personal Care</SelectItem>
                      <SelectItem value="Food & Snacks">Food & Snacks</SelectItem>
                      <SelectItem value="Handmade & Crafts">Handmade & Crafts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSave(editing)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Promotion Modal */}
      {showPromoteModal && (
        <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Promote Selected Products</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Promoting {promoteListings.length} selected product{promoteListings.length > 1 ? 's' : ''}
                </p>
                
                <div className="max-h-32 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                  {promoteListings.map(listingId => {
                    const listing = listings.find(l => l.id === listingId);
                    return listing ? (
                      <div key={listingId} className="flex items-center gap-2 py-1">
                        <span className="text-sm font-medium">{listing.title}</span>
                        <span className="text-sm text-gray-500">₦{listing.price.toLocaleString()}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Promotion Plan</label>
                <Select value={promotePlan} onValueChange={setPromotePlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a promotion plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {promotionPlans.map((plan) => (
                      <SelectItem key={plan.type} value={plan.type}>
                        <div>
                          <div className="font-medium">{plan.name}</div>
                          <div className="text-sm text-gray-500">₦{plan.price}/day - {plan.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Duration (days)</label>
                <Input
                  type="number"
                  placeholder="Duration in days"
                  value={promoteDuration}
                  onChange={(e) => setPromoteDuration(Number(e.target.value))}
                  min="1"
                  max="365"
                />
              </div>

              {promotePlan && promoteDuration > 0 && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">Cost Breakdown</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>Price per day: ₦{promotionPlans.find(p => p.type === promotePlan)?.price}</p>
                    <p>Duration: {promoteDuration} days</p>
                    <p>Products: {promoteListings.length}</p>
                    <p className="text-lg font-semibold border-t pt-2">
                      Total Cost: ₦{calculatePromotionCost().toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPromoteModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createPromotionAds}
                  disabled={!promotePlan || promoteDuration <= 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Create Promotion Ads
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
