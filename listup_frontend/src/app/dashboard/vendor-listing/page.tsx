"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchVendorListings, updateListing, deleteListing } from "@/lib/api/listing";
import { uploadImage } from "@/lib/api/upload";
import { fetchCategories, Category } from "@/lib/api/categories";
import { fetchVendorListingMetrics, VendorListingMetricsResponse } from "@/lib/api/analytics";
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
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
  location?: string;
  condition?: string;
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Promotion plans with per-day pricing
  const promotionPlans = [
    { type: "PRODUCT_PROMOTION", name: "Product Promotion", price: 300, description: "Boost individual product visibility" },
    { type: "SEARCH_BOOST", name: "Search Boost", price: 200, description: "Rank higher in search results" }
  ];
  const [editing, setEditing] = useState<Listing | null>(null);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [promoteListings, setPromoteListings] = useState<string[]>([]);
  const [promotePlan, setPromotePlan] = useState<string>("");
  const [promoteDuration, setPromoteDuration] = useState<number>(7);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkLabel, setBulkLabel] = useState<string | null>(null);
  const [metricsRange, setMetricsRange] = useState<'7d' | '30d' | 'all'>('30d');
  const [metricsTotals, setMetricsTotals] = useState<{ views: number; saves: number; messages: number }>({
    views: 0,
    saves: 0,
    messages: 0,
  });
  const [metricsByListing, setMetricsByListing] = useState<Record<string, { views: number; saves: number; messages: number }>>({});
  const defaultFilters: FilterState = {
    search: '',
    status: '',
    category: '',
    priceRange: { min: 0, max: 1000000 },
    stockLevel: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  };
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(defaultFilters);
  const [searchInput, setSearchInput] = useState('');

  const id: string | undefined = safeLocalStorage.getItem("id") || undefined;

  useEffect(() => {
    async function loadData() {
      try {
        // Load categories
        const categoriesData = await fetchCategories();
        const filteredCategories = categoriesData.filter(cat => cat.slug !== "all-categories");
        setCategories(filteredCategories);

        // Initialise filters from URL params
        const params = searchParams;
        const urlFilters: FilterState = {
          search: params.get('q') || defaultFilters.search,
          status: params.get('status') || defaultFilters.status,
          category: params.get('category') || defaultFilters.category,
          priceRange: {
            min: Number(params.get('minPrice') || defaultFilters.priceRange.min),
            max: Number(params.get('maxPrice') || defaultFilters.priceRange.max),
          },
          stockLevel: params.get('stock') || defaultFilters.stockLevel,
          sortBy: params.get('sortBy') || defaultFilters.sortBy,
          sortOrder: (params.get('sortOrder') as 'asc' | 'desc') || defaultFilters.sortOrder,
        };

        setFilters(urlFilters);
        setDraftFilters(urlFilters);
        setSearchInput(urlFilters.search);

        // Load listings
        const res = await fetchVendorListings(id);
        // Add mock data for demonstration
        const enhancedListings = res.map((listing: { id: string; title: string; price: number; status: string; createdAt?: string; created_at?: string; image?: string; images?: string[]; category?: string }) => ({
          ...listing,
          status: listing.status || 'active',
                     category: listing.category || (categories.length > 0 ? categories[0].name : 'Uncategorized'),
          views: 0,
          sales: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
          seoScore: 0,
        }));
        setListings(enhancedListings);
        setFilteredListings(enhancedListings);

        // Load real analytics metrics for this vendor's listings
        if (id) {
          try {
            const metrics: VendorListingMetricsResponse = await fetchVendorListingMetrics(id, metricsRange);
            setMetricsTotals(metrics.totals);
            const byListing: Record<string, { views: number; saves: number; messages: number }> = {};
            metrics.perListing.forEach((m) => {
              byListing[m.listingId] = {
                views: m.views,
                saves: m.saves,
                messages: m.messages,
              };
            });
            setMetricsByListing(byListing);
          } catch (err) {
            console.error('Error loading listing metrics:', err);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, searchParams, metricsRange]);

  // Debounce search input -> draftFilters.search
  useEffect(() => {
    const handle = setTimeout(() => {
      setDraftFilters(prev => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

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

  const applyFilters = () => {
    let next = { ...draftFilters };

    // Validate price range
    if (next.priceRange.min > next.priceRange.max) {
      const min = next.priceRange.max;
      const max = next.priceRange.min;
      next = { ...next, priceRange: { min, max } };
    }

    setFilters(next);

    // Sync to URL
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (next.search) params.set('q', next.search); else params.delete('q');
    if (next.status) params.set('status', next.status); else params.delete('status');
    if (next.category) params.set('category', next.category); else params.delete('category');
    if (next.priceRange.min !== defaultFilters.priceRange.min) params.set('minPrice', String(next.priceRange.min)); else params.delete('minPrice');
    if (next.priceRange.max !== defaultFilters.priceRange.max) params.set('maxPrice', String(next.priceRange.max)); else params.delete('maxPrice');
    if (next.stockLevel) params.set('stock', next.stockLevel); else params.delete('stock');
    if (next.sortBy !== defaultFilters.sortBy) params.set('sortBy', next.sortBy); else params.delete('sortBy');
    if (next.sortOrder !== defaultFilters.sortOrder) params.set('sortOrder', next.sortOrder); else params.delete('sortOrder');

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    setDraftFilters(defaultFilters);
    setSearchInput('');
    router.push(pathname);
  };

  const clearSearch = () => {
    const updatedDraft = { ...draftFilters, search: '' };
    setDraftFilters(updatedDraft);
    setSearchInput('');
    setFilters(updatedDraft);

    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('q');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const hasActiveFilters = () => {
    return (
      !!filters.search ||
      !!filters.status ||
      !!filters.category ||
      filters.priceRange.min !== defaultFilters.priceRange.min ||
      filters.priceRange.max !== defaultFilters.priceRange.max ||
      !!filters.stockLevel ||
      filters.sortBy !== defaultFilters.sortBy ||
      filters.sortOrder !== defaultFilters.sortOrder
    );
  };

  const openEdit = (listing: Listing) => {
    setEditing(listing);
    const existing = listing.images || [];
    setEditImages(existing);
    setNewImages([]);
    setImagePreviews(existing);
    setFormError(null);
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert("Only JPG, PNG and WEBP images are allowed");
        return false;
      }
      // 2MB in bytes
      if (file.size > 2 * 1024 * 1024) {
        alert(`Image ${file.name} is larger than 2MB. It will be compressed before upload.`);
      }
      return true;
    });

    if (!validFiles.length) return;

    setNewImages((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target?.result === "string") {
          setImagePreviews((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageAt = (index: number) => {
    const totalExisting = editImages.length;
    if (index < totalExisting) {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - totalExisting;
      setNewImages((prev) => prev.filter((_, i) => i !== newIndex));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    setImagePreviews((prev) => {
      const arr = [...prev];
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });

    const totalExisting = editImages.length;
    const combined: ("existing" | "new")[] = [];
    for (let i = 0; i < totalExisting; i++) combined.push("existing");
    for (let i = 0; i < newImages.length; i++) combined.push("new");

    const tags = [...combined];
    const [tag] = tags.splice(from, 1);
    tags.splice(to, 0, tag);

    const newExisting: string[] = [];
    const newNewFiles: File[] = [];
    let existingIdx = 0;
    let newIdx = 0;
    tags.forEach((t) => {
      if (t === "existing") {
        newExisting.push(editImages[existingIdx]);
        existingIdx++;
      } else {
        newNewFiles.push(newImages[newIdx]);
        newIdx++;
      }
    });
    setEditImages(newExisting);
    setNewImages(newNewFiles);
  };

  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
    const image = new window.Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (!e.target?.result) return reject(new Error("Failed to read image"));
        image.src = e.target.result as string;
      };

      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));

        const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
        canvas.width = image.width * ratio;
        canvas.height = image.height * ratio;

        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Image compression failed"));
            const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      image.onerror = () => reject(new Error("Failed to load image for compression"));
      reader.onerror = () => reject(new Error("Failed to read image"));

      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    if (!editing) return;

    if (!editing.title.trim() || !editing.description.trim() || !editing.price) {
      setFormError("Please fill in all required fields");
      return;
    }

    const totalImagesCount = editImages.length + newImages.length;
    if (totalImagesCount < 1) {
      setFormError("Please keep at least one image for the listing");
      return;
    }

    setSaving(true);
    setFormError(null);

    const prevListings = [...listings];

    try {
      const uploadedUrls: string[] = [];
      for (const file of newImages) {
        let fileToUpload = file;
        if (file.size > 2 * 1024 * 1024) {
          try {
            fileToUpload = await compressImage(file);
          } catch (err) {
            console.error("Error compressing image", err);
          }
        }
        const uploadRes = await uploadImage(fileToUpload);
        uploadedUrls.push(uploadRes.url);
      }

      const finalImages = [...editImages, ...uploadedUrls];

      const payload = {
        title: editing.title.trim(),
        description: editing.description.trim(),
        price: editing.price,
        images: finalImages,
        location: editing.location || "",
        condition: editing.condition || "",
      };

      setListings((prev) =>
        prev.map((l) =>
          l.id === editing.id
            ? { ...l, ...payload, images: finalImages }
            : l
        )
      );
      setFilteredListings((prev) =>
        prev.map((l) =>
          l.id === editing.id
            ? { ...l, ...payload, images: finalImages }
            : l
        )
      );

      await updateListing(editing.id, payload);

      alert("Listing updated successfully");
      setEditing(null);
      setEditImages([]);
      setNewImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error("Error updating listing:", error);
      setFormError("Failed to update listing. Please try again.");
      setListings(prevListings);
      setFilteredListings(prevListings);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to permanently delete this listing? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteListing(id);
      const nextListings = listings.filter(l => l.id !== id);
      const nextFiltered = filteredListings.filter(l => l.id !== id);
      setListings(nextListings);
      setFilteredListings(nextFiltered);
      setSelectedListings(selectedListings.filter(selectedId => selectedId !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting listing:', error);
      router.refresh();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedListings.length === 0) return;
    const confirmed = window.confirm(`Permanently delete ${selectedListings.length} selected listing(s)? This cannot be undone.`);
    if (!confirmed) return;

    setBulkLoading(true);
    setBulkLabel('Deleting selected listings...');

    try {
      await Promise.all(selectedListings.map(id => deleteListing(id)));
      const remaining = listings.filter(l => !selectedListings.includes(l.id));
      const remainingFiltered = filteredListings.filter(l => !selectedListings.includes(l.id));
      setListings(remaining);
      setFilteredListings(remainingFiltered);
      setSelectedListings([]);
    } catch (error) {
      console.error('Error bulk deleting listings:', error);
      alert('Failed to delete some listings. Please try again.');
    } finally {
      setBulkLoading(false);
      setBulkLabel(null);
    }
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive' | 'pending' | 'sold') => {
    if (selectedListings.length === 0) return;

    const actionLabel =
      status === 'active'
        ? 'activate'
        : status === 'inactive'
        ? 'deactivate'
        : status === 'sold'
        ? 'mark as sold'
        : 'update';

    const confirmed = window.confirm(`Are you sure you want to ${actionLabel} ${selectedListings.length} selected listing(s)?`);
    if (!confirmed) return;

    setBulkLoading(true);
    setBulkLabel('Updating selected listings...');

    try {
      await Promise.all(selectedListings.map(id => updateListing(id, { status })));
      const updatedListings = listings.map(l =>
        selectedListings.includes(l.id) ? { ...l, status } : l
      );
      const updatedFiltered = filteredListings.map(l =>
        selectedListings.includes(l.id) ? { ...l, status } : l
      );
      setListings(updatedListings);
      setFilteredListings(updatedFiltered);
      setSelectedListings([]);
    } catch (error) {
      console.error('Error bulk updating listings:', error);
      alert('Failed to update some listings. Please try again.');
    } finally {
      setBulkLoading(false);
      setBulkLabel(null);
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

  const selectAllVisible = () => {
    const visibleIds = filteredListings.map(l => l.id);
    setSelectedListings(visibleIds);
  };

  const clearSelection = () => {
    setSelectedListings([]);
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:items-center">
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search listings..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button onClick={() => setShowFilters(!showFilters)} variant="outline">
            Filters
          </Button>
          <Button variant="outline" onClick={clearSearch} disabled={!filters.search && !searchInput}>
            Clear search
          </Button>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>{filteredListings.length} result{filteredListings.length === 1 ? '' : 's'}</span>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline">Date range:</span>
          <Select value={metricsRange} onValueChange={(value) => setMetricsRange(value as '7d' | '30d' | 'all')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <Card>
          <CardContent className="py-3 flex flex-col items-start">
            <span className="text-xs text-gray-500">Total Views</span>
            <span className="text-lg font-semibold">{metricsTotals.views.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex flex-col items-start">
            <span className="text-xs text-gray-500">Total Saves</span>
            <span className="text-lg font-semibold">{metricsTotals.saves.toLocaleString()}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-3 flex flex-col items-start">
            <span className="text-xs text-gray-500">Total Messages</span>
            <span className="text-lg font-semibold">{metricsTotals.messages.toLocaleString()}</span>
          </CardContent>
        </Card>
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
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={draftFilters.status} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                                 <Select value={draftFilters.category} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }))}>
                   <SelectTrigger>
                     <SelectValue placeholder="All Categories" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Categories</SelectItem>
                     {categories.map((cat) => (
                       <SelectItem key={cat.id} value={cat.name}>
                         {cat.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Stock Level</label>
                <Select value={draftFilters.stockLevel} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, stockLevel: value === 'all' ? '' : value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
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
                  value={draftFilters.priceRange.min}
                  onChange={(e) => setDraftFilters(prev => ({ 
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
                  value={draftFilters.priceRange.max}
                  onChange={(e) => setDraftFilters(prev => ({ 
                    ...prev, 
                    priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sort By</label>
                <Select value={draftFilters.sortBy} onValueChange={(value) => setDraftFilters(prev => ({ ...prev, sortBy: value }))}>
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
                onClick={resetFilters}
              >
                Clear All Filters
              </Button>
              <Button
                variant="outline"
                onClick={() => setDraftFilters(prev => ({ 
                  ...prev, 
                  sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                }))}
              >
                {draftFilters.sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                {draftFilters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
              <Button onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active filter chips */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 text-sm">
          {filters.search && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                const updated = { ...filters, search: '' };
                setFilters(updated);
                setDraftFilters(updated);
                setSearchInput('');
              }}
            >
              <span>Search: "{filters.search}"</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
          {filters.status && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                const updated = { ...filters, status: '' };
                setFilters(updated);
                setDraftFilters(updated);
              }}
            >
              <span>Status: {filters.status}</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
          {filters.category && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                const updated = { ...filters, category: '' };
                setFilters(updated);
                setDraftFilters(updated);
              }}
            >
              <span>Category: {filters.category}</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
          {(filters.priceRange.min !== defaultFilters.priceRange.min || filters.priceRange.max !== defaultFilters.priceRange.max) && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                const updated = { ...filters, priceRange: defaultFilters.priceRange };
                setFilters(updated);
                setDraftFilters(updated);
              }}
            >
              <span>Price: ₦{filters.priceRange.min} - ₦{filters.priceRange.max}</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
          {filters.stockLevel && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                const updated = { ...filters, stockLevel: '' };
                setFilters(updated);
                setDraftFilters(updated);
              }}
            >
              <span>Stock: {filters.stockLevel}</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
          {(filters.sortBy !== defaultFilters.sortBy || filters.sortOrder !== defaultFilters.sortOrder) && (
            <button
              className="px-2 py-1 bg-gray-100 rounded-full flex items-center gap-1"
              onClick={() => {
                setFilters(defaultFilters);
                setDraftFilters(defaultFilters);
                setSearchInput('');
              }}
            >
              <span>Sorting</span>
              <span className="text-gray-500">×</span>
            </button>
          )}
        </div>
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
                {bulkLoading && bulkLabel && (
                  <span className="text-sm text-blue-700">{bulkLabel}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllVisible}
                  disabled={bulkLoading}
                >
                  Select all on page
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                  disabled={bulkLoading}
                >
                  Clear selection
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('active')}
                  disabled={bulkLoading}
                >
                  Activate All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkStatusUpdate('inactive')}
                  disabled={bulkLoading}
                >
                  Deactivate All
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePromoteProducts}
                  disabled={bulkLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <TrendingUp size={16} className="mr-2" />
                  Promote Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={bulkLoading}
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
      {filteredListings.length === 0 ? (
        <div className="p-6 text-center text-gray-600 border rounded-lg bg-gray-50">
          <p className="font-medium mb-1">No results found</p>
          <p className="text-sm">Try adjusting your search or filters, or resetting all filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => {
          const metrics = metricsByListing[listing.id] || { views: 0, saves: 0, messages: 0 };
          return (
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
                  <Button variant="ghost" size="sm" onClick={() => openEdit(listing)}>
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
                height={300}
                src={listing.images?.[0] || "/placeholder.svg"}
                alt={listing.title}
                className="w-full h-40 object-cover rounded-lg"
              />

              {/* Product Info */}
              <div>
                <h3 className="text-lg font-semibold line-clamp-2">{listing.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{listing.description}</p>
                
                {/* Status and Category */}
                <div className="flex items-center gap-2 mt-2">
                   <p className={`text-sm font-medium ${getStockColor(listing.stock)}`}>
                    {/* Stock: {listing.stock} */}
                  </p>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {/* {listing.category} */}
                  </span>
                </div>

                {/* Price and Stock */}
                <div className="flex justify-between items-center mt-3">
                  <p className="text-lg font-bold text-lime-600">₦{listing.price.toLocaleString()}</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </span>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <Eye size={14} />
                      <span className="text-xs font-medium">{metrics.views}</span>
                    </div>
                    <span className="text-xs text-gray-500">Views</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600">
                      <TrendingUp size={14} />
                      <span className="text-xs font-medium">{metrics.saves}</span>
                    </div>
                    <span className="text-xs text-gray-500">Saves</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-purple-600">
                      <BarChart3 size={14} />
                      <span className="text-xs font-medium">{metrics.messages}</span>
                    </div>
                    <span className="text-xs text-gray-500">Messages</span>
                  </div>
                </div>

                {/* Low Stock Alert */}
                {/* {listing.stock <= 5 && listing.stock > 0 && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-orange-50 rounded-lg">
                    <AlertTriangle size={14} className="text-orange-600" />
                    <span className="text-xs text-orange-700">Low stock alert</span>
                  </div>
                )} */}

                {/* Out of Stock Alert */}
                {/* {listing.stock === 0 && (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle size={14} className="text-red-600" />
                    <span className="text-xs text-red-700">Out of stock</span>
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>
      )}

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
          <DialogContent className="max-w-2xl bg-white overflow-y-auto h-[calc(100vh-5rem)]">
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
                {/* <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <Input
                    type="number"
                    value={editing.stock}
                    onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                  />
                </div> */}
              </div>
              <div className="grid grid-cols-2 gap-4 ">
                <div className="bg-white">
                  <label className="block text-sm font-medium mb-2">Condition</label>
                  <Input
                    value={editing.condition || ""}
                    onChange={(e) => setEditing({ ...editing, condition: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <Input
                    value={editing.location || ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 ">
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={editing.status} onValueChange={(value) => setEditing({ ...editing, status: value as 'active' | 'inactive' | 'pending' | 'sold' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                                 <div >
                   <label className="block text-sm font-medium mb-2 ">Category</label>
                   <Select  value={editing.category} onValueChange={(value) => setEditing({ ...editing, category: value })}>
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="bg-white">
                       {categories.map((cat) => (
                         <SelectItem key={cat.id} value={cat.name}>
                           {cat.name}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Images</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative w-24 h-24">
                        <Image
                          src={src}
                          alt={editing.title}
                          fill
                          className="object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageAt(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-1 left-1 flex gap-1">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="px-1 py-0.5 text-[10px] bg-white/80 rounded"
                            >
                              ↑
                            </button>
                          )}
                          {index < imagePreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index + 1)}
                              className="px-1 py-0.5 text-[10px] bg-white/80 rounded"
                            >
                              ↓
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Add Images</label>
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageInputChange}
                    />
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, WEBP. Max ~2MB per image. Images will be compressed before upload if needed.</p>
                  </div>
                </div>
              </div>
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Promotion Modal */}
      {showPromoteModal && (
        <Dialog open={showPromoteModal} onOpenChange={setShowPromoteModal}>
          <DialogContent className="max-w-2xl bg-white">
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
                  <SelectContent className="bg-white">
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
