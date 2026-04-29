'use client';

import { useState, useEffect } from 'react';
import api from '@/utils/axios';
import { toast } from 'sonner';

export default function UpgradeToVendorModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      api.get('/addresses').then(res => {
        const active = (Array.isArray(res.data) ? res.data : []).filter(a => a.active);
        setAddresses(active);
        if (active.length > 0) setStoreAddress(active[0].name || active[0].id);
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !storeName) return toast.error('Store name required');
    if (step === 2 && (!storeAddress || !businessCategory)) return toast.error('Address and category required');
    setStep(step + 1);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/upgrade-to-vendor', {
        storeName,
        phone,
        storeAddress,
        businessCategory,
        referralCode
      });
      if (res.data.success) {
        toast.success(res.data.message);
        onSuccess(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">Upgrade to Vendor</h2>
        
        {step === 1 && (
          <div className="space-y-4 text-black">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. +234..." className="w-full border p-2 rounded" />
              <p className="text-xs text-gray-500 mt-1">Required if not already set in Settings.</p>
            </div>
            <button onClick={handleNext} className="w-full bg-lime-400 p-2 rounded font-bold">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-black">
            <div>
              <label className="block text-sm font-medium mb-1">Business Category</label>
              <input value={businessCategory} onChange={e => setBusinessCategory(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Fashion, Electronics" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Address</label>
              <select value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full border p-2 rounded">
                <option value="">Select Address</option>
                {addresses.map(a => <option key={a.id} value={a.name || a.id}>{a.name || a.id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Referral Code (Optional)</label>
              <input value={referralCode} onChange={e => setReferralCode(e.target.value)} className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="w-1/2 bg-gray-200 p-2 rounded font-bold text-black">Back</button>
              <button onClick={handleNext} className="w-1/2 bg-lime-400 p-2 rounded font-bold text-black">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 text-black">
            <p>Review your information and confirm upgrade to vendor. This action cannot be undone.</p>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="w-1/2 bg-gray-200 p-2 rounded font-bold text-black">Back</button>
              <button onClick={handleUpgrade} disabled={loading} className="w-1/2 bg-lime-400 p-2 rounded font-bold text-black">
                {loading ? 'Upgrading...' : 'Confirm Upgrade'}
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} className="mt-4 text-sm text-gray-500 underline w-full text-center">Cancel</button>
      </div>
    </div>
  );
}
