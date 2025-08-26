// components/PayButton.tsx
"use client";

import axios from "@/utils/axios";

export default function PayButton({ adId, email, amount }: { adId: string; email: string; amount: number }) {
  const handlePay = async () => {
    const res = await axios.post("/payments/initialize", { adId, email, amount });
    window.location.href = res.data.authorizationUrl;
  };

  return (
    <button
      onClick={handlePay}
      className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
    >
      Pay ₦{amount.toLocaleString()}
    </button>
  );
}
