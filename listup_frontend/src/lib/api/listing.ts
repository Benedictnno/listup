// API functions for Next.js App Router with cookie-based auth
// Works for both client and server components

// Use environment variable with proper fallback for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.listup.ng/api"

// Define proper types for the API
interface CreateListingPayload {
  title: string;
  price: number;
  categoryId: string;
  description: string;
  images: string[];
  location: string;
  condition: string;
}

interface UpdateListingPayload {
  title?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  images?: string[];
  location?: string;
  condition?: string;
  status?: string;
}
export async function fetchListings() {
  try {
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: sends cookies with request
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data) {
      throw new Error('No data received from API');
    }
    
    return data;
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        throw new Error("Backend server is not running. Please start the backend server.");
      }
      throw new Error(error.message || "Failed to fetch listings");
    }
    
    throw new Error("Failed to fetch listings");
  }
}

// ✅ Fetch all listings
// Add this to your listing.ts file if missing
export async function fetchListingById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching for dynamic data
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Listing not found');
      }
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Listing data received:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
    }

// Fetch listings with optional query parameters
export async function fetchListingsWithFilters(params: {
  categoryId?: string;
  q?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  page?: number;
  limit?: number;
}) {
  try {
    const query = new URLSearchParams();
    if (params.categoryId) query.set('categoryId', params.categoryId);
    if (params.q) query.set('q', params.q);
    if (params.minPrice != null) query.set('minPrice', String(params.minPrice));
    if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    const url = `${API_BASE_URL}/listings${query.toString() ? `?${query.toString()}` : ''}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error('Failed to fetch listings');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching filtered listings:', error);
    throw error;
  }
}

// ✅ Fetch all listings for a vendor
export async function fetchVendorListings(vendorId: string | undefined) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/vendors/${vendorId}/listings`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch listings");
    }
    return res.json();
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    throw new Error("Failed to fetch listings");
  }
}

// ✅ Create a new listing
export async function createListing(listingData: FormData | CreateListingPayload) {
  try {
    if (listingData instanceof FormData) {
      const imagesArray = listingData.getAll("images") as File[];

      const uploadedImages: string[] = [];
      for (const img of imagesArray) {
        const formData = new FormData();
        formData.append("image", img as File);

        const res = await fetch(`${API_BASE_URL}/uploads/image`, {
          method: 'POST',
          body: formData,
          credentials: 'include', // Cookies sent automatically
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const imageData = await res.json();
        uploadedImages.push(imageData.url);
      }

      const newListingData: CreateListingPayload = {
        title: listingData.get("title") as string,
        price: Number(listingData.get("price")),
        categoryId: listingData.get("categoryId") as string,
        description: listingData.get("description") as string,
        images: uploadedImages,
        location: listingData.get("location") as string || "eksu",
        condition: listingData.get("condition") as string || "brand new",
      };

      const listingRes = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newListingData),
        credentials: 'include',
      });

      if (!listingRes.ok) {
        throw new Error("Failed to create listing");
      }

      return listingRes.json();
    } else {
      const listingRes = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
        credentials: 'include',
      });

      if (!listingRes.ok) {
        throw new Error("Failed to create listing");
      }

      return listingRes.json();
    }
  } catch (error: unknown) {
    console.error("Error creating listing:", error);
    throw new Error("Failed to create listing");
  }
}

// ✅ Update an existing listing
export async function updateListing(listingId: string, listingData: UpdateListingPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error("Failed to update listing");
    }
    
    return res.json();
  } catch (error: unknown) {
    console.error("Error updating listing:", error);
    throw new Error("Failed to update listing");
  }
}

// ✅ Delete a listing
export async function deleteListing(listingId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete listing");
    }
   
    return res.json();
  } catch (error: unknown) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing");
  }
}
