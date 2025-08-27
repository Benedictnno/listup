import Link from "next/link";
import { Package, Home, Search } from "lucide-react";

export default function ListingNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="h-10 w-10 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Listing Not Found
        </h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, the listing you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/listings"
            className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
          >
            <Search className="h-4 w-4" />
            Browse All Listings
          </Link>
          
          <Link 
            href="/"
            className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
