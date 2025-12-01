// Server-side API functions for Next.js App Router
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

// ✅ Fetch all listings (Client-side)
export async function fetchListings() {
  try {
    // Use the API_BASE_URL constant that handles both client and server environments
    
    // Remove next.revalidate as it's not supported in client components
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      cache: 'no-store' // Don't cache in production
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different API response formats
    if (!data) {
      throw new Error('No data received from API');
    }
    
    return data;
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    
    // Handle network errors (backend not running)
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        throw new Error("Backend server is not running. Please start the backend server.");
      }
      throw new Error(error.message || "Failed to fetch listings");
    }
    
    throw new Error("Failed to fetch listings");
  }
}

// ✅ Fetch a single listing by ID (Server-side)
export async function fetchListingById(listingId: string) {
  try {
    const apiUrl = `${API_BASE_URL}/listings/${listingId}`;
    console.log('Fetching listing from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache options for better performance
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Listing not found");
      }
      
      if (response.status === 403) {
        throw new Error("Access forbidden - API may be down or inaccessible");
      }
      
      // Try to get error message from response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If we can't parse JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Listing data received:', !!data);

    return data;
  } catch (error: unknown) {
    console.error("Error fetching listing:", error);
    
    // Handle network errors (backend not running)
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
        throw new Error("Backend server is not running or not accessible. Please check the API status.");
      }
      if (error.message === "Listing not found") {
        throw new Error("Listing not found");
      }
      throw new Error(error.message || "Failed to fetch listing");
    }
    
    throw new Error("Failed to fetch listing");
  }
}

// Fetch listings with optional query parameters (categoryId, q, minPrice, maxPrice, page, limit)
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
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch listings');
    const data = await res.json();
    // backend returns { items, total, page, pages }
    return data;
  } catch (error) {
    console.error('Error fetching filtered listings:', error);
    throw error;
  }
}

// ✅ Fetch all listings for a vendor (Client-side)
export async function fetchVendorListings(vendorId: string | undefined) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/vendors/${vendorId}/listings`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
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

// ✅ Create a new listing (Client-side)
export async function createListing(listingData: FormData | CreateListingPayload) {
  try {
    // If FormData is passed, use the existing logic
    if (listingData instanceof FormData) {
      // normalize FileList → Array<File>
      const imagesArray = listingData.getAll("images") as File[];

      // upload each image
      const uploadedImages: string[] = [];
      for (const img of imagesArray) {
        const formData = new FormData();
        formData.append("image", img as File); // ✅ explicitly tell TS it's a File

        const res = await fetch(`${API_BASE_URL}/uploads/image`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Failed to upload image");
        }

        const imageData = await res.json();
        uploadedImages.push(imageData.url);
      }

      // build final payload
      const newListingData: CreateListingPayload = {
        title: listingData.get("title") as string,
        price: Number(listingData.get("price")),
        categoryId: listingData.get("categoryId") as string,
        description: listingData.get("description") as string,
        images: uploadedImages, // array of uploaded URLs
        location: listingData.get("location") as string || "eksu",
        condition: listingData.get("condition") as string || "brand new",
      };

      const listingRes = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newListingData),
      });

      if (!listingRes.ok) {
        throw new Error("Failed to create listing");
      }

      return listingRes.json();
    } else {
      // If plain object is passed, send directly to listings endpoint
      const listingRes = await fetch(`${API_BASE_URL}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(listingData),
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

// ✅ Update an existing listing (Client-side)
export async function updateListing(listingId: string, listingData: UpdateListingPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(listingData),
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

// ✅ Delete a listing (Client-side)
export async function deleteListing(listingId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
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
