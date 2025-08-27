// Server-side API functions for Next.js App Router
const API_BASE_URL = "http://localhost:4000/api";

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



// ✅ Fetch all listings (Server-side)
export async function fetchListings() {
  try {
    console.log("Fetching all listings");
    console.log("API Base URL:", API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/listings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache options for better performance
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Listings data received:", data);
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
    console.log("Fetching listing with ID:", listingId);
    console.log("API Base URL:", API_BASE_URL);
    
    const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add cache options for better performance
      next: { revalidate: 60 } // Revalidate every 60 seconds
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Listing not found");
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
    console.log("Listing data received:", data);
    return data;
  } catch (error: unknown) {
    console.error("Error fetching listing:", error);
    
    // Handle network errors (backend not running)
    if (error instanceof Error) {
      if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
        throw new Error("Backend server is not running. Please start the backend server.");
      }
      if (error.message === "Listing not found") {
        throw new Error("Listing not found");
      }
      throw new Error(error.message || "Failed to fetch listing");
    }
    
    throw new Error("Failed to fetch listing");
  }
}

// ✅ Fetch all listings for a vendor (Client-side)
export async function fetchVendorListings(vendorId: string | undefined) {
  try {
    const res = await fetch(`${API_BASE_URL}/listings/vendors/${vendorId}/listings`);
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
export async function createListing(listingData: FormData) {
  try {
    // normalize FileList → Array<File>
    const imagesArray = listingData.getAll("images") as File[];

    // upload each image
    const uploadedImages: string[] = [];
    for (const img of imagesArray) {
      const formData = new FormData();
      formData.append("image", img as File); // ✅ explicitly tell TS it's a File

      const res = await fetch(`${API_BASE_URL}/uploads/image`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload image");
      }

      const imageData = await res.json();
      uploadedImages.push(imageData.url);
    }
    console.log("Uploaded Images:", uploadedImages);

    // build final payload
    const newListingData: CreateListingPayload = {
      title: listingData.get("title") as string,
      price: Number(listingData.get("price")),
      categoryId: listingData.get("categoryId") as string,
      description: listingData.get("description") as string,
      images: uploadedImages, // array of uploaded URLs
      location: "eksu",
      condition: "brand new",
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
