"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Commission {
  id: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  paymentMethod?: string;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    vendorProfile?: {
      storeName: string;
    } | null;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

export default function AdminCommissionsPage() {
  const router = useRouter();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "PENDING" | "SUCCESS">("all");

  useEffect(() => {
    loadCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = filter !== "all" ? `?status=${filter}` : "";

      const res = await fetch(`${API_URL}/referrals/admin/commissions${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to load commissions");
      }

      const data = await res.json();
      if (data?.success) {
        setCommissions(data.data.commissions as Commission[]);
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
      alert("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (commissionId: string) => {
    const reference = window.prompt("Enter payment reference (e.g., bank transfer ID):");
    if (!reference) return;

    try {
      setProcessing(commissionId);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/referrals/admin/commissions/${commissionId}/pay`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          paymentMethod: "BANK_TRANSFER",
          paymentReference: reference,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to mark as paid");
      }

      await loadCommissions();
      alert("Commission marked as paid successfully!");
    } catch (error) {
      console.error("Error marking commission as paid:", error);
      alert("Failed to mark commission as paid");
    } finally {
      setProcessing(null);
    }
  };

  const pendingTotal = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.amount, 0);

  const paidTotal = commissions
    .filter((c) => c.status === "SUCCESS")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Commissions</p>
              <p className="text-2xl font-bold text-orange-600">
                ₦{pendingTotal.toLocaleString()}
              </p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-lg font-bold">
              ₦
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Commissions</p>
              <p className="text-2xl font-bold text-green-600">
                ₦{paidTotal.toLocaleString()}
              </p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 text-lg font-bold">
              ✓
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Commissions</p>
              <p className="text-2xl font-bold text-blue-600">
                {commissions.length}
              </p>
            </div>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-lg font-bold">
              #
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex gap-2">
            {["all", "PENDING", "SUCCESS"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-3 py-1 rounded border text-sm ${
                  filter === status
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {status === "all" ? "All" : status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-lime-500 border-t-transparent" />
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {commissions.map((commission) => (
                <tr key={commission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{commission.user.name}</p>
                      <p className="text-sm text-gray-500">{commission.user.email}</p>
                      {commission.user.vendorProfile?.storeName && (
                        <p className="text-xs text-gray-400">
                          {commission.user.vendorProfile.storeName}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    ₦{commission.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        commission.status === "SUCCESS"
                          ? "bg-green-100 text-green-800"
                          : commission.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {commission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {commission.status === "PENDING" && (
                      <button
                        onClick={() => handleMarkPaid(commission.id)}
                        disabled={processing === commission.id}
                        className="inline-flex items-center rounded bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                      >
                        {processing === commission.id ? "Processing..." : "Mark as Paid"}
                      </button>
                    )}
                    {commission.status === "SUCCESS" && (
                      <div className="text-sm">
                        <p className="text-gray-500">
                          Paid: {commission.paidAt && new Date(commission.paidAt).toLocaleDateString()}
                        </p>
                        {commission.paymentReference && (
                          <p className="text-xs text-gray-400">
                            Ref: {commission.paymentReference}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && commissions.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No commissions found
          </div>
        )}
      </div>
    </div>
  );
}
