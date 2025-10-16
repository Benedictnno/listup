'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { CheckCircle, Clock, ArrowRight, Store, Phone, Mail, HelpCircle } from 'lucide-react';

export default function VendorWelcomePage() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      router.push('/login');
    }
    // If user is logged in but not a vendor, redirect to dashboard
    else if (user && user.role !== 'VENDOR') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
   

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-lime-100 mb-4">
          <Clock className="h-8 w-8 text-lime-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Your Vendor Account is Pending Approval</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Thank you for signing up as a vendor on ListUp. Your account is currently under review.
        </p>
      </div>

      {/* Process Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-10">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Verification Process</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-lime-100 text-lime-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Application Submitted</h3>
                <p className="mt-1 text-gray-600">
                  You've successfully submitted your vendor application.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Under Review</h3>
                <p className="mt-1 text-gray-600">
                  Our team is currently reviewing your application. This typically takes 1-2 business days.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex opacity-50">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-700">Approval</h3>
                <p className="mt-1 text-gray-500">
                  Once approved, you'll receive an email notification and can start listing your products.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-10">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Account Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Personal Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{user.storeName || 'Your Store'}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">What Happens Next?</h3>
              <p className="text-gray-600 mb-4">
                After your account is approved, you'll be able to:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-lime-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Create product listings</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-lime-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Manage your store profile</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-lime-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Receive customer inquiries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">How long does the approval process take?</h3>
              <p className="text-gray-600">
                The approval process typically takes 1-2 business days. We'll notify you via email once your account has been reviewed.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Can I make changes to my store information?</h3>
              <p className="text-gray-600">
                Yes, once your account is approved, you can update your store information from your vendor dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">What if my application is rejected?</h3>
              <p className="text-gray-600">
                If your application is rejected, you'll receive an email with the reason. You can address the issues and reapply.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-lime-600">
                <HelpCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Need help?</span>
              </div>
              <div className="flex gap-3">
                <Link href="/" className="inline-flex items-center rounded-lg bg-lime-500 px-4 py-2 text-sm font-semibold text-white hover:bg-lime-600">Go to Home</Link>
                <Link href="/listings" className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Browse Listings</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


