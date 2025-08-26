import ListingDetails from "@/components/ListingDetails";

async function getListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/listings/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export default async function SingleProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  if (!id) {
    return <div className="text-center text-red-500">Listing not found</div>;
  }

  const listing = await getListing(id);

  return <ListingDetails listing={listing} />;
}
