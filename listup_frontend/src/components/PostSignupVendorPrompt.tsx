'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostSignupVendorPrompt({ isOpen, onClose }: Props) {
  const router = useRouter();
  const [dismissing, setDismissing] = useState(false);

  if (!isOpen) return null;

  const handleBecomeVendor = () => {
    onClose();
    // Navigate to dashboard — the UpgradeToVendorModal lives there
    router.push('/dashboard?upgrade=1');
  };

  const handleDismiss = () => {
    setDismissing(true);
    setTimeout(() => {
      onClose();
      router.push('/');
    }, 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-7 text-center"
        style={{ animation: dismissing ? 'fadeOut 0.2s ease forwards' : 'slideUp 0.25s ease' }}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-100 mx-auto mb-4">
          <Store className="w-7 h-7 text-lime-600" />
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-2">Sell on ListUp?</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          You've just joined as a buyer. Want to open a store and start selling?
          It only takes a minute.
        </p>

        <button
          onClick={handleBecomeVendor}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 mb-3"
        >
          Yes, become a vendor
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={handleDismiss}
          className="w-full text-sm text-slate-400 hover:text-slate-600 underline transition-colors"
        >
          No thanks, I'm just browsing
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn   { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeOut  { from { opacity: 1 } to { opacity: 0 } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
    </div>
  );
}
