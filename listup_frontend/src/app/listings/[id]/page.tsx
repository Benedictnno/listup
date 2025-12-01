import ListingDetails from "@/components/ListingDetails";
import { fetchListingById } from "@/lib/api/listing";
import { notFound } from "next/navigation";
import ErrorPage from "../../../components/ErrorPage";

export default async function SingleProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Await the params for Next.js 15 compatibility
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  try {
    const listing = await fetchListingById(id);
    
    if (!listing) {
      notFound();
    }

   
    return <ListingDetails listing={listing} />;
  } catch (error: unknown) {
    console.error("Error in SingleProductPage:", error);
    
    // If it's a "not found" error, show 404 page
    if (error instanceof Error && error.message === "Listing not found") {
      notFound();
    }
    
    // Determine error type for the client component
    let errorType: 'maintenance' | 'generic' = 'generic';
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error && (
      error.message.includes("API may be down") || 
      error.message.includes("not running") ||
      error.message.includes("not accessible")
    )) {
      errorType = 'maintenance';
    }
    
    return (
      <ErrorPage 
        errorType={errorType}
        errorMessage={errorMessage}
      />
    );
  }
}
