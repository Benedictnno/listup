import api from "@/utils/axios"; 


// Define proper types for the API
interface ListingData {
  title: string;
  price: number;
  categoryId: string;
  description: string;
  images: string[];
  location: string;
  condition: string;
}

interface UpdateListingData {
  title?: string;
  price?: number;
  categoryId?: string;
  description?: string;
  images?: string[];
  location?: string;
  condition?: string;
  status?: string;
}



// ✅ Fetch all listings for a vendor
export async function fetchVendorListings(vendorId: string | undefined) {
  try {
    const res = await api.get(`/listings/vendors/${vendorId}/listings`);
    return res.data;
  } catch (error: unknown) {
    console.error("Error fetching listings:", error);
    throw new Error("Failed to fetch listings");
  }
}

// ✅ Create a new listing
export async function createListing(listingData: FormData) {
  try {
    // normalize FileList → Array<File>
    const imagesArray = listingData.getAll("images") as File[];

    // upload each image
    const uploadedImages: string[] = [];
    for (const img of imagesArray) {
      const formData = new FormData();
      formData.append("image", img as File); // ✅ explicitly tell TS it's a File

      const res = await api.post(`/uploads/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      uploadedImages.push(res.data.url);
    }
    console.log("Uploaded Images:", uploadedImages);

    // build final payload
    const newListingData: ListingData = {
      title: listingData.get("title") as string,
      price: Number(listingData.get("price")),
      categoryId: listingData.get("categoryId") as string,
      description: listingData.get("description") as string,
      images: uploadedImages, // array of uploaded URLs
      location: "eksu",
      condition: "brand new",
    };

    const listingRes = await api.post(`/listings`, newListingData);

    return listingRes.data;
  } catch (error: unknown) {
    console.error("Error creating listing:", error);
    throw new Error("Failed to create listing");
  }
}

// ✅ Update an existing listing
export async function updateListing(listingId: string, listingData: UpdateListingData) {
  try {
    const res = await api.put(`/listings/${listingId}`, listingData);
    return res.data;
  } catch (error: unknown) {
    console.error("Error updating listing:", error);
    throw new Error("Failed to update listing");
  }
}

// ✅ Delete a listing
export async function deleteListing(listingId: string) {
  try {


    const res = await api.delete(`/listings/${listingId}`);
    return res.data;
  } catch (error: unknown) {
    console.error("Error deleting listing:", error);
    throw new Error("Failed to delete listing");
  }
}
