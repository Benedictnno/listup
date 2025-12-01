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
  
  console.log('SingleProductPage - ID:', id);
  console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL);
  
  if (!id) {
    console.log('No ID provided, calling notFound');
    notFound();
  }

  try {
    console.log('Attempting to fetch listing with ID:', id);
    const listing = await fetchListingById(id);
    
    if (!listing) {
      console.log('No listing returned, calling notFound');
      notFound();
    }

    console.log('Listing fetched successfully:', listing.title);
    return <ListingDetails listing={listing} />;
  } catch (error: unknown) {
    console.error("Error in SingleProductPage:", error);
    
    // If it's a "not found" error, show 404 page
    if (error instanceof Error && error.message === "Listing not found") {
      console.log('Listing not found error, calling notFound');
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
    
    console.log('Showing error page with type:', errorType, 'message:', errorMessage);
    return (
      <ErrorPage 
        errorType={errorType}
        errorMessage={errorMessage}
      />
    );
  }
}
