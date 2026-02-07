"use client";

import { useEffect, useState } from "react";
import { fetchVendorListings, updateListing, deleteListing } from "@/lib/api/listing";
import { uploadImage } from "@/lib/api/upload";
import { fetchCategories, Category } from "@/lib/api/categories";
import { fetchVendorListingMetrics, VendorListingMetricsResponse } from "@/lib/api/analytics";
import { safeLocalStorage } from "@/utils/helpers";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

// Components
import { VendorListingHeader } from "@/components/dashboard/vendor-listing/VendorListingHeader";
import { VendorListingMetrics } from "@/components/dashboard/vendor-listing/VendorListingMetrics";
import { VendorListingFilters, FilterState } from "@/components/dashboard/vendor-listing/VendorListingFilters";
import { VendorListingBulkActions } from "@/components/dashboard/vendor-listing/VendorListingBulkActions";
import { VendorListingGrid } from "@/components/dashboard/vendor-listing/VendorListingGrid";
import { Listing } from "@/types/listing";
import { VendorListingEmptyState } from "@/components/dashboard/vendor-listing/VendorListingEmptyState";
import { EditListingModal } from "@/components/dashboard/vendor-listing/EditListingModal";
import { PromoteListingModal } from "@/components/dashboard/vendor-listing/PromoteListingModal";

export default function VendorListingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuthStore(); // Use auth store for user ID

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

  // Use user.id from store instead of localStorage
  const id = user?.id;

  useEffect(() => {
    async function loadData() {
      if (!id) return; // Wait for user ID

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
        // Add mock data for demonstration if needed, or map response
        const enhancedListings = res.map((listing: any) => ({
          ...listing,
          status: listing.status || 'active',
          category: listing.category || (categories.length > 0 ? categories[0].name : 'Uncategorized'),
          views: 0,
          sales: 0,
          revenue: 0,
          createdAt: listing.createdAt || new Date().toISOString(),
          seoScore: 0,
        }));
        setListings(enhancedListings);
        setFilteredListings(enhancedListings);

        // Load real analytics metrics for this vendor's listings
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
      filtered = filtered.filter(listing => {
        const catName = typeof listing.category === 'object' ? listing.category.name : listing.category;
        return catName === filters.category;
      });
    }

    // Price range filter
    filtered = filtered.filter(listing =>
      listing.price >= filters.priceRange.min && listing.price <= filters.priceRange.max
    );

    // Stock level filter
    if (filters.stockLevel) {
      switch (filters.stockLevel) {
        case 'low':
          filtered = filtered.filter(listing => (listing.stock || 0) <= 5);
          break;
        case 'out':
          filtered = filtered.filter(listing => (listing.stock || 0) === 0);
          break;
        case 'high':
          filtered = filtered.filter(listing => (listing.stock || 0) > 20);
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
      // Cookie-based auth handled automatically

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
          vendorId: id || "", // Use ID from store
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
      <VendorListingHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hasActiveSearch={!!filters.search || !!searchInput}
        clearSearch={clearSearch}
      />

      <VendorListingMetrics
        metricsTotals={metricsTotals}
        filteredListingsCount={filteredListings.length}
        metricsRange={metricsRange}
        setMetricsRange={setMetricsRange}
      />

      <VendorListingFilters
        showFilters={showFilters}
        filters={filters}
        setFilters={setFilters}
        draftFilters={draftFilters}
        setDraftFilters={setDraftFilters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        categories={categories}
        applyFilters={applyFilters}
        resetFilters={resetFilters}
        defaultFilters={defaultFilters}
      />

      <VendorListingBulkActions
        selectedCount={selectedListings.length}
        bulkLoading={bulkLoading}
        bulkLabel={bulkLabel}
        selectAllVisible={selectAllVisible}
        clearSelection={clearSelection}
        handleBulkStatusUpdate={handleBulkStatusUpdate}
        handlePromoteProducts={handlePromoteProducts}
        handleBulkDelete={handleBulkDelete}
      />

      {filteredListings.length === 0 ? (
        <VendorListingEmptyState hasFilters={!!filters.search || !!filters.status || !!filters.category} />
      ) : (
        <VendorListingGrid
          listings={filteredListings}
          selectedListings={selectedListings}
          toggleListingSelection={toggleListingSelection}
          openEdit={openEdit}
          handleDelete={handleDelete}
          metricsByListing={metricsByListing}
        />
      )}

      <EditListingModal
        editing={editing}
        setEditing={setEditing}
        categories={categories}
        imagePreviews={imagePreviews}
        removeImageAt={removeImageAt}
        moveImage={moveImage}
        handleImageInputChange={handleImageInputChange}
        formError={formError}
        handleSave={handleSave}
        saving={saving}
      />

      {<PromoteListingModal
        showPromoteModal={showPromoteModal}
        setShowPromoteModal={setShowPromoteModal}
        promoteListings={promoteListings}
        listings={listings}
        promotePlan={promotePlan}
        setPromotePlan={setPromotePlan}
        promotionPlans={promotionPlans}
        promoteDuration={promoteDuration}
        setPromoteDuration={setPromoteDuration}
        calculatePromotionCost={calculatePromotionCost}
        createPromotionAds={createPromotionAds}
      />}
    </div>
  );
}
