import axios from "axios";
import { safeLocalStorage } from "@/utils/helpers";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"; 

// ✅ Fetch all listings for a vendor
export async function fetchVendorListings(vendorId: string | undefined) {
  try {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.get(`${API_BASE}/listings/vendors/${vendorId}/listings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return res.data;
  } catch (error: any) {
    console.error("Error fetching listings:", error.response?.data || error.message);
    throw new Error("Failed to fetch listings");
  }
}

// ✅ Create a new listing
export async function createListing(listingData: FormData) {
  try {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // normalize FileList → Array<File>
    const imagesArray = listingData.getAll("images") as File[];

    // upload each image
    const uploadedImages: string[] = [];
    for (const img of imagesArray) {
      const formData = new FormData();
      formData.append("image", img as File); // ✅ explicitly tell TS it's a File

      const res = await axios.post(`${API_BASE}/uploads/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      uploadedImages.push(res.data.url);
    }
    console.log("Uploaded Images:", uploadedImages);

    // build final payload
    const newListingData = {
      title: listingData.get("title"),
      price: Number(listingData.get("price")),
      categoryId: listingData.get("categoryId"),
      description: listingData.get("description"),
      images: uploadedImages, // array of uploaded URLs
      location: "eksu",
      condition: "brand new",
    };

    const listingRes = await axios.post(`${API_BASE}/listings`, newListingData, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return listingRes.data;
  } catch (error: any) {
    console.error("Error creating listing:", error.response?.data || error.message);
    throw new Error("Failed to create listing");
  }
}

// ✅ Update an existing listing
export async function updateListing(listingId: string, listingData: any) {
  try {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.put(`${API_BASE}/listings/${listingId}`, listingData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error: any) {
    console.error("Error updating listing:", error.response?.data || error.message);
    throw new Error("Failed to update listing");
  }
}

// ✅ Delete a listing
export async function deleteListing(listingId: string) {
  try {
    const token = safeLocalStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const res = await axios.delete(`${API_BASE}/listings/${listingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error: any) {
    console.error("Error deleting listing:", error.response?.data || error.message);
    throw new Error("Failed to delete listing");
  }
}
