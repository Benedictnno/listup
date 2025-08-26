import ListingDetails from "@/components/ListingDetails";
import api from "@/utils/axios";

async function getListing(id: string) {
  try {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch listing");
  }
}

export default async function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return <div className="text-center text-red-500">Listing not found</div>;
  }

  const listing = await getListing(id);

  return <ListingDetails listing={listing} />;
}
