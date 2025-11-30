"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Users, Gift, Wallet, Calendar, User, Mail, Phone } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

interface ReferralUse {
  id: string;
  vendorId: string;
  vendorName: string | null;
  vendorEmail: string | null;
  vendorPhone: string | null;
  storeName: string | null;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  commission: number;
  commissionPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ReferralRecord {
  id: string;
  code: string;
  isActive: boolean;
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  referredVendors: ReferralUse[];
}

interface AdminReferralResponse {
  total: number;
  page: number;
  limit: number;
  referrals: ReferralRecord[];
}

function statusChip(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };
  const cls = map[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function AdminReferralsPage() {
  const [records, setRecords] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<ReferralRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const limit = 20;

  useEffect(() => {
    fetchReferrals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/referrals/admin/all?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        setError("Failed to load referrals");
        setRecords([]);
        return;
      }

      const json = await res.json();
      const data: AdminReferralResponse = json.data;
      setRecords(data.referrals || []);
      setTotal(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || limit))));
    } catch (e) {
      console.error("admin referrals error", e);
      setError("Failed to load referrals");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) => {
      const u = r.user;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q)
      );
    });
  }, [records, search]);

  const aggregate = useMemo(() => {
    let totalReferrals = 0;
    let successful = 0;
    let totalEarnings = 0;
    let pendingEarnings = 0;

    for (const r of records) {
      totalReferrals += r.totalReferrals || 0;
      successful += r.successfulReferrals || 0;
      totalEarnings += r.totalEarnings || 0;

      const pendingForRef = r.referredVendors
        .filter((rv) => rv.status === "COMPLETED" && !rv.commissionPaid)
        .reduce((sum, rv) => sum + (rv.commission || 0), 0);
      pendingEarnings += pendingForRef;
    }

    return { totalReferrals, successful, totalEarnings, pendingEarnings };
  }, [records]);

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      setActionLoadingId(id);
      setError("");
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/referrals/admin/${id}/active`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !current }),
      });

      if (!res.ok) {
        setError("Failed to update referral status");
        return;
      }

      await fetchReferrals();
    } catch (e) {
      console.error("toggle referral active error", e);
      setError("Failed to update referral status");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Referral Program</h1>
            <p className="text-muted-foreground text-sm">
              Monitor referral performance and commissions across all users.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <span>
              Showing {filtered.length} of {total} referrers
            </span>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Referrals</p>
                <p className="text-2xl font-bold mt-1">{aggregate.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Successful</p>
                <p className="text-2xl font-bold mt-1">{aggregate.successful}</p>
              </div>
              <Gift className="w-8 h-8 text-emerald-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Earnings</p>
                <p className="text-xl font-bold mt-1">
                  ₦{aggregate.pendingEarnings.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-amber-600" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Earnings</p>
                <p className="text-xl font-bold mt-1">
                  ₦{aggregate.totalEarnings.toLocaleString()}
                </p>
              </div>
              <Wallet className="w-8 h-8 text-indigo-600" />
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Filters</span>
              <span className="text-xs text-muted-foreground">
                Search by name, email or referral code
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-8 pr-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex gap-2 justify-end md:col-span-2">
                <button
                  onClick={fetchReferrals}
                  className="inline-flex items-center px-3 py-2 rounded-md border text-sm hover:bg-muted"
                >
                  <Loader2 className="w-4 h-4 mr-2" /> Refresh
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No referral records found.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 px-4">Referrer</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Referrals</th>
                    <th className="py-3 px-4">Earnings</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => {
                    const created = new Date(r.createdAt).toLocaleDateString();
                    const pendingForRef = r.referredVendors
                      .filter((rv) => rv.status === "COMPLETED" && !rv.commissionPaid)
                      .reduce((sum, rv) => sum + (rv.commission || 0), 0);

                    return (
                      <tr
                        key={r.id}
                        className="border-b last:border-0 align-top hover:bg-muted/40 cursor-pointer"
                        onClick={() => {
                          setSelected(r);
                          setShowDetails(true);
                        }}
                      >
                        <td className="py-3 px-4 min-w-[200px]">
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="font-medium">{r.user.name}</span>
                            <span className="text-xs text-muted-foreground">{r.user.email}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {r.totalReferrals} referrals, {r.successfulReferrals} successful
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 rounded-md bg-slate-900 text-lime-400 font-mono text-[11px] tracking-widest">
                                {r.code}
                              </span>
                              {r.isActive ? (
                                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  Active
                                </span>
                              ) : (
                                <span className="text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[220px] text-xs">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Total:</span> {r.totalReferrals}
                            </div>
                            <div>
                              <span className="font-medium">Completed:</span> {r.successfulReferrals}
                            </div>
                            <div>
                              <span className="font-medium">Pending earnings:</span> ₦{pendingForRef.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[180px] text-xs">
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Total earned:</span> ₦{r.totalEarnings.toLocaleString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {created}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(r.id, r.isActive);
                            }}
                            disabled={actionLoadingId === r.id}
                            className={`inline-flex items-center px-3 py-1 rounded-md border text-[11px] font-medium ${
                              r.isActive
                                ? "bg-red-50 text-red-700 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            }`}
                          >
                            {actionLoadingId === r.id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : null}
                            {r.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div>
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {showDetails && selected && (
          <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border shadow-lg">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Referral Details</h2>
                  <p className="text-xs text-muted-foreground">
                    {selected.user.name} · {selected.user.email}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Code: <span className="font-mono bg-slate-900 text-lime-400 px-2 py-0.5 rounded text-[11px] tracking-widest">{selected.code}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="text-xs px-3 py-1 rounded-md border hover:bg-muted"
                >
                  Close
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="text-xs text-muted-foreground">
                  {selected.totalReferrals} referrals, {selected.successfulReferrals} successful.
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Referred Vendors</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 overflow-x-auto">
                    {selected.referredVendors.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">
                        No referred vendors for this code yet.
                      </div>
                    ) : (
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 text-left text-[11px] text-muted-foreground">
                          <tr className="border-b">
                            <th className="py-2 px-3">Vendor</th>
                            <th className="py-2 px-3">Store</th>
                            <th className="py-2 px-3">Status</th>
                            <th className="py-2 px-3">Commission</th>
                            <th className="py-2 px-3">When</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selected.referredVendors.map((rv) => {
                            const createdAt = new Date(rv.createdAt).toLocaleDateString();
                            return (
                              <tr key={rv.id} className="border-b last:border-0">
                                <td className="py-2 px-3 min-w-[180px]">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-muted-foreground" />
                                      <span className="font-medium">
                                        {rv.vendorName || "Unknown vendor"}
                                      </span>
                                    </div>
                                    {rv.vendorEmail && (
                                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <Mail className="w-3 h-3" /> {rv.vendorEmail}
                                      </div>
                                    )}
                                    {rv.vendorPhone && (
                                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                        <Phone className="w-3 h-3" /> {rv.vendorPhone}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 min-w-[160px]">
                                  <span className="text-[11px] text-muted-foreground">
                                    {rv.storeName || "—"}
                                  </span>
                                </td>
                                <td className="py-2 px-3 min-w-[140px]">
                                  <div className="flex flex-col gap-1">
                                    {statusChip(rv.status)}
                                    {rv.commissionPaid && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                                        Commission paid
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-2 px-3 min-w-[120px]">
                                  ₦{(rv.commission || 0).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-[11px] text-muted-foreground whitespace-nowrap">
                                  {createdAt}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
