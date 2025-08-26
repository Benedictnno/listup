import { User } from "lucide-react";

export default function SellerCard({ seller }: { seller: any }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-500" />
        </div>
        <div>
          <h3 className="font-semibold">{seller?.name || "Seller"}</h3>
          <p className="text-sm text-gray-500">Member since 2024</p>
        </div>
      </div>
      <button className="w-full mt-4 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
        Call Seller
      </button>
      <button className="w-full mt-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100">
        Chat
      </button>
    </div>
  );
}
