import ListingDetails from "@/components/ListingDetails";

async function getListing(id: string) {
  const res = await fetch(`http://localhost:4000/api/listings/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch listing");
  return res.json();
}

export default async function SingleProductPage({ params }: { params: { id: string } }) {
  if (!params.id) {
    return <div className="text-center text-red-500">Listing not found</div>;
  }

  const listing = await getListing(params.id);

  return <ListingDetails listing={listing} />;
}
