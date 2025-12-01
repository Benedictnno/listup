'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    // Call verification endpoint
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://listup-api.onrender.com/api'}/auth/verify-email?token=${token}`
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          // Check if token expired
          if (data.expired) {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          setMessage(data.message || 'Verification failed. Please try again.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-green-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-lime-600">ListUp</h1>
          </div>

          {/* Status Icon */}
          <div className="mb-6">
            {status === 'verifying' && (
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-lime-600 animate-spin" />
              </div>
            )}

            {status === 'success' && (
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
            )}

            {(status === 'error' || status === 'expired') && (
              <div className="flex justify-center">
                <XCircle className="w-16 h-16 text-red-500" />
              </div>
            )}
          </div>

          {/* Status Message */}
          <div className="mb-6">
            {status === 'verifying' && (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Email Verified! 🎉
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500">
                  Redirecting to login page in 3 seconds...
                </p>
              </>
            )}

            {status === 'expired' && (
              <>
                <h2 className="text-2xl font-bold text-orange-600 mb-2">
                  Link Expired
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
                <p className="text-sm text-gray-500 mb-4">
                  Verification links expire after 24 hours for security reasons.
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-4">{message}</p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === 'success' && (
              <Link
                href="/login"
                className="block w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Go to Login
              </Link>
            )}

            {(status === 'expired' || status === 'error') && (
              <>
                <Link
                  href="/resend-verification"
                  className="block w-full bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  <Mail className="inline-block w-5 h-5 mr-2" />
                  Resend Verification Email
                </Link>
                <Link
                  href="/login"
                  className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Need help?{' '}
          <Link href="/contact" className="text-lime-600 hover:text-lime-700 font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lime-50 to-green-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-lime-600">ListUp</h1>
            </div>
            <div className="mb-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-lime-600 animate-spin" />
              </div>
            </div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Loading...
              </h2>
              <p className="text-gray-600">
                Please wait while we load the verification page...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
