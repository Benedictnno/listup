"use client";

import Link from "next/link";

interface ErrorPageProps {
  errorType: 'maintenance' | 'generic';
  errorMessage: string;
}

export default function ErrorPage({ errorType, errorMessage }: ErrorPageProps) {
  const handleRefresh = () => {
    window.location.reload();
  };

  if (errorType === 'maintenance') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Service Temporarily Unavailable</h1>
          <p className="text-gray-600 mb-4">
            Our listing service is temporarily down for maintenance. Please try again in a few minutes.
          </p>
          <div className="space-y-2">
            <button 
              onClick={handleRefresh} 
              className="inline-flex items-center px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
            >
              Try Again
            </button>
            <div className="text-sm text-gray-500">
              You can also <Link href="/" className="text-lime-600 hover:underline">return to homepage</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          Error: {errorMessage}
        </p>
        <div className="space-y-2">
          <button 
            onClick={handleRefresh} 
            className="inline-flex items-center px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600 mr-2"
          >
            Refresh Page
          </button>
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
