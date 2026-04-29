'use client';

import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/utils/axios';
import FirebaseAnalytics from '@/lib/firebaseAnalytics';
import Analytics from '@/lib/analytics';

interface Props {
  label?: string;
  disabled?: boolean;
  /** Called after successful login — useful for post-signup vendor-upgrade prompt */
  onSuccess?: (user: { role: string; isNewUser: boolean }) => void;
}

export default function GoogleSignInButton({
  label = 'Continue with Google',
  disabled = false,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      // 1. Firebase popup — returns idToken
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Send idToken to our backend to verify + create session cookie
      const res = await api.post('/auth/firebase-google', { idToken });
      const { user, isNewUser } = res.data.data;

      // 3. Persist user in zustand store
      setAuth(user);

      // 4. Fire analytics (both GA4 + Firebase)
      Analytics.googleLogin?.();
      FirebaseAnalytics.googleLogin();

      toast.success(`Welcome${isNewUser ? ' to ListUp' : ' back'}, ${user.name}!`);

      // 5. Delegate routing to parent or do default
      if (onSuccess) {
        onSuccess({ role: user.role, isNewUser });
      } else {
        router.push(user.role === 'VENDOR' ? '/dashboard' : '/');
      }
    } catch (err: any) {
      // User closed the popup — don't show an error
      if (err?.code === 'auth/popup-closed-by-user') return;
      const message =
        err?.response?.data?.message || 'Google sign-in failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        width: '100%',
        padding: '12px 20px',
        background: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: 10,
        cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 600,
        color: '#374151',
        opacity: disabled || loading ? 0.6 : 1,
        transition: 'opacity 0.2s',
      }}
    >
      {loading ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="#e5e7eb" strokeWidth="3" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="#4285F4" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      )}
      {loading ? 'Signing in...' : label}
    </button>
  );
}
