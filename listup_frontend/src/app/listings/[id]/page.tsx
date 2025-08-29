import ListingDetails from "@/components/ListingDetails";
import { fetchListingById } from "@/lib/api/listing";
import { notFound } from "next/navigation";

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
    console.log("Fetching listing with ID:", id);
    const listing = await fetchListingById(id);
    
    if (!listing) {
      console.log("Listing not found, showing 404");
      notFound();
    }

   
    return <ListingDetails listing={listing} />;
  } catch (error: unknown) {
    console.error("Error in SingleProductPage:", error);
    
    // If it's a "not found" error, show 404 page
    if (error instanceof Error && error.message === "Listing not found") {
      console.log("Listing not found, redirecting to 404");
      notFound();
    }
    
    // Show a simple error page for other errors (no onClick handlers)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-2">
            We couldn&apos;t load this listing. Please try again later.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Error: {error instanceof Error ? error.message : 'Unknown error'}
          </p>
          <p className="text-xs text-gray-400">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    );
  }
}
