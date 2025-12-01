
import ListingDetails from "@/components/ListingDetails";
import { fetchListingById } from "@/lib/api/listing";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SingleProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  try {
    // Await the params for Next.js 15 compatibility
    const { id } = await params;
    
    if (!id) {
      notFound();
    }

    console.log("Fetching listing with ID:", id); // Debug log
    
    const listing = await fetchListingById(id);
    
    if (!listing) {
      notFound();
    }

    return <ListingDetails listing={listing} />;
  } catch (error: unknown) {
    console.error("Error in SingleProductPage:", error);
    
    // If it's a "not found" error, show 404 page
    if (error instanceof Error && error.message.includes("not found")) {
      notFound();
    }
    
    // For other errors, return a proper error component
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t load this listing. Please try again later.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm text-red-600 mb-4 font-mono">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <Link 
              href="/listings"
              className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
            >
              Back to Listings
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
              }
