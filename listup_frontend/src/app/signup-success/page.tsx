'use client';

import { useEffect, useState } from 'react';
import { Mail, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupSuccessPage() {
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    // Get email from sessionStorage if available
    if (typeof window !== 'undefined') {
      const pendingEmail = sessionStorage.getItem('pendingVerificationEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
        // Clear it after reading
        sessionStorage.removeItem('pendingVerificationEmail');
      } else {
        // If no email found, they might have navigated here directly
        // Redirect to signup page after a delay
        setTimeout(() => router.push('/signup'), 3000);
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-green-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              Check Your Email! 📧
            </h1>
            <p className="text-gray-600 mb-2">
              We've sent a verification link to:
            </p>
            {email && (
              <p className="text-lime-600 font-semibold text-lg mb-4">
                {email}
              </p>
            )}
            <p className="text-gray-600 text-sm">
              Click the link in the email to verify your account and start using ListUp.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                <span>Check your inbox for an email from ListUp</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                <span>Click the verification link in the email</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                <span>You'll be redirected to login</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                <span>Login with your email and password</span>
              </li>
            </ol>
          </div>

          {/* Didn't receive email? */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-800 font-semibold mb-2">
              Didn't receive the email?
            </p>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Wait a few minutes and check again</li>
              <li>• Make sure you entered the correct email</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/resend-verification"
              className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors text-center"
            >
              <RefreshCw className="inline-block w-4 h-4 mr-2" />
              Resend Verification Email
            </Link>
            
            <Link
              href="/login"
              className="block w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
            >
              Go to Login
              <ArrowRight className="inline-block w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Need help?{' '}
            <Link href="/contact" className="text-lime-600 hover:text-lime-700 font-medium">
              Contact Support
            </Link>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Verification links expire after 24 hours for security.
          </p>
        </div>
      </div>
    </div>
  );
}
