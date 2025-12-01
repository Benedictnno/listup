"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Clock, DollarSign } from "lucide-react";

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

export default function AdminCommissionsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "PENDING" | "SUCCESS">("all");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    loadCommissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const params = filter !== "all" ? `?status=${filter}` : "";
      const res = await api.get(`/referrals/admin/commissions${params}`);
      if (res.data?.success) {
        setCommissions(res.data.data.commissions as Commission[]);
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
      await api.patch(`/referrals/admin/commissions/${commissionId}/pay`, {
        paymentMethod: "BANK_TRANSFER",
        paymentReference: reference,
      });

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

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
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
            <Clock className="w-8 h-8 text-orange-600" />
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
            <CheckCircle className="w-8 h-8 text-green-600" />
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
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter:</span>
          <div className="flex gap-2">
            {["all", "PENDING", "SUCCESS"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status as any)}
              >
                {status === "all" ? "All" : status}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin" />
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
                    <Badge
                      variant={
                        commission.status === "SUCCESS"
                          ? "default"
                          : commission.status === "PENDING"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {commission.status === "SUCCESS" && (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      )}
                      {commission.status === "PENDING" && (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {commission.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(commission.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    {commission.status === "PENDING" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(commission.id)}
                        disabled={processing === commission.id}
                      >
                        {processing === commission.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Mark as Paid"
                        )}
                      </Button>
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
