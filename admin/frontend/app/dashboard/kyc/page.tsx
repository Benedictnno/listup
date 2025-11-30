"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Search, Filter, User, Store, Phone, Mail, Calendar, ShieldCheck, AlertTriangle, Clock, CheckCircle, XCircle, CreditCard } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001/api";

type KYCStatus =
  | "PENDING"
  | "DOCUMENTS_REVIEW"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "APPROVED"
  | "REJECTED";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

interface VendorInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  vendorProfile?: {
    storeName?: string | null;
    storeAddress?: string | null;
  } | null;
}

interface KYCSubmission {
  id: string;
  vendorId: string;
  status: KYCStatus;
  paymentStatus: PaymentStatus;
  signupFee: number;
  hasReferral: boolean;
  tiktokHandle?: string | null;
  instagramHandle?: string | null;
  facebookPage?: string | null;
  twitterHandle?: string | null;
  otherSocial?: string | null;
  createdAt: string;
  updatedAt: string;
  interviewScheduled?: string | null;
  interviewCompleted?: string | null;
  interviewNotes?: string | null;
  rejectionReason?: string | null;
  vendor: VendorInfo;
}

interface PaginatedResponse {
  total: number;
  page: number;
  limit: number;
  kycs: KYCSubmission[];
}

const STATUS_LABELS: { value: KYCStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "DOCUMENTS_REVIEW", label: "Documents review" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Interview completed" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

function statusBadge(status: KYCStatus) {
  const map: Record<KYCStatus, { label: string; classes: string; Icon: any }> = {
    PENDING: {
      label: "Pending",
      classes: "bg-yellow-100 text-yellow-800",
      Icon: Clock,
    },
    DOCUMENTS_REVIEW: {
      label: "Documents Review",
      classes: "bg-blue-100 text-blue-800",
      Icon: Filter,
    },
    INTERVIEW_SCHEDULED: {
      label: "Interview Scheduled",
      classes: "bg-indigo-100 text-indigo-800",
      Icon: Calendar,
    },
    INTERVIEW_COMPLETED: {
      label: "Interview Completed",
      classes: "bg-emerald-100 text-emerald-800",
      Icon: CheckCircle,
    },
    APPROVED: {
      label: "Approved",
      classes: "bg-green-100 text-green-800",
      Icon: ShieldCheck,
    },
    REJECTED: {
      label: "Rejected",
      classes: "bg-red-100 text-red-800",
      Icon: XCircle,
    },
  };

  const cfg = map[status];
  const Icon = cfg.Icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.classes}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function AdminKYCPage() {
  const [kycs, setKycs] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<KYCStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const limit = 20;

  useEffect(() => {
    fetchKYC();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchKYC = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const statusParam = statusFilter !== "ALL" ? `&status=${statusFilter}` : "";
      const res = await fetch(
        `${API_URL}/kyc/admin/submissions?page=${page}&limit=${limit}${statusParam}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        setError("Failed to load KYC submissions");
        setKycs([]);
        return;
      }

      const json = await res.json();
      const data: PaginatedResponse = json.data;
      setKycs(data.kycs || []);
      setTotal(data.total || 0);
      setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || limit))));
    } catch (e) {
      console.error("KYC admin fetch error", e);
      setError("Failed to load KYC submissions");
      setKycs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return kycs;
    const q = search.toLowerCase();
    return kycs.filter((k) => {
      const v = k.vendor;
      const storeName = v.vendorProfile?.storeName || "";
      return (
        v.name.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.phone || "").toLowerCase().includes(q) ||
        storeName.toLowerCase().includes(q)
      );
    });
  }, [kycs, search]);

  const handleUpdateStatus = async (id: string, newStatus: KYCStatus) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");

      const body: any = { status: newStatus };
      if (newStatus === "INTERVIEW_SCHEDULED") {
        body.interviewScheduled = new Date().toISOString();
      }

      if (newStatus === "INTERVIEW_COMPLETED") {
        body.interviewCompleted = new Date().toISOString();
        body.interviewNotes = "Interview completed (updated from admin panel).";
      }

      const res = await fetch(`${API_URL}/kyc/admin/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        setError("Failed to update KYC status");
        return;
      }

      await fetchKYC();
    } catch (e) {
      console.error("update status error", e);
      setError("Failed to update KYC status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleProcessPayment = async (id: string) => {
    try {
      setActionLoadingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/kyc/admin/${id}/payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        setError("Failed to process KYC payment");
        return;
      }

      await fetchKYC();
    } catch (e) {
      console.error("process payment error", e);
      setError("Failed to process KYC payment");
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">KYC Submissions</h1>
            <p className="text-muted-foreground text-sm">
              Review vendor KYC requests, schedule interviews, and approve payments.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs text-muted-foreground">
              Showing {filtered.length} of {total} submissions
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between gap-3">
              <span>Filters</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Manage verification pipeline
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
                  placeholder="Search by vendor name, email, phone or store"
                  className="w-full pl-8 pr-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setPage(1);
                    setStatusFilter(e.target.value as KYCStatus | "ALL");
                  }}
                  className="w-full px-3 py-2 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {STATUS_LABELS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={fetchKYC}
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

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No KYC submissions found.
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Store</th>
                    <th className="py-3 px-4">Socials</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((k) => {
                    const created = new Date(k.createdAt).toLocaleDateString();
                    const v = k.vendor;
                    const canScheduleInterview =
                      k.status === "PENDING" || k.status === "DOCUMENTS_REVIEW";
                    const canMarkInterviewCompleted = k.status === "INTERVIEW_SCHEDULED";
                    const canApproveWithoutPayment =
                      k.status === "INTERVIEW_COMPLETED" && k.paymentStatus !== "SUCCESS";
                    const canProcessPayment =
                      k.paymentStatus !== "SUCCESS" &&
                      (k.status === "APPROVED" || k.status === "INTERVIEW_COMPLETED");

                    return (
                      <tr key={k.id} className="border-b last:border-0 align-top">
                        <td className="py-3 px-4 min-w-[180px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{v.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{v.email}</span>
                            </div>
                            {v.phone && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{v.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-2">
                              <Store className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">
                                {v.vendorProfile?.storeName || "—"}
                              </span>
                            </div>
                            <div className="flex items-start gap-2 text-muted-foreground">
                              <span className="sr-only">Address</span>
                              <span className="ml-[1.1rem]">
                                {v.vendorProfile?.storeAddress || ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[220px] text-xs text-muted-foreground">
                          <div className="space-y-1">
                            {k.tiktokHandle && <div>TikTok: {k.tiktokHandle}</div>}
                            {k.instagramHandle && <div>IG: {k.instagramHandle}</div>}
                            {k.facebookPage && <div>FB: {k.facebookPage}</div>}
                            {k.twitterHandle && <div>Twitter: {k.twitterHandle}</div>}
                            {k.otherSocial && <div>Other: {k.otherSocial}</div>}
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[160px]">
                          <div className="flex flex-col gap-1">
                            {statusBadge(k.status)}
                            {k.rejectionReason && (
                              <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                                {k.rejectionReason}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 min-w-[140px]">
                          <div className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3 h-3 text-muted-foreground" />
                              <span>
                                ₦{k.signupFee.toLocaleString()} ({k.hasReferral ? "with referral" : "no referral"})
                              </span>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                k.paymentStatus === "SUCCESS"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : k.paymentStatus === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {k.paymentStatus}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          {created}
                        </td>
                        <td className="py-3 px-4 min-w-[220px]">
                          <div className="flex flex-col gap-1 text-xs">
                            {k.status === "PENDING" && (
                              <button
                                onClick={() => handleUpdateStatus(k.id, "DOCUMENTS_REVIEW")}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-white hover:bg-muted"
                              >
                                <Filter className="w-3 h-3 mr-1" /> Move to Review
                              </button>
                            )}
                            {canScheduleInterview && (
                              <button
                                onClick={() => handleUpdateStatus(k.id, "INTERVIEW_SCHEDULED")}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-white hover:bg-muted"
                              >
                                <Calendar className="w-3 h-3 mr-1" /> Schedule Interview
                              </button>
                            )}
                            {canMarkInterviewCompleted && (
                              <button
                                onClick={() => handleUpdateStatus(k.id, "INTERVIEW_COMPLETED")}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-white hover:bg-muted"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Mark Interview Completed
                              </button>
                            )}
                            {canApproveWithoutPayment && (
                              <button
                                onClick={() => handleUpdateStatus(k.id, "APPROVED")}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-white hover:bg-muted"
                              >
                                <ShieldCheck className="w-3 h-3 mr-1" /> Mark Approved
                              </button>
                            )}
                            {canProcessPayment && (
                              <button
                                onClick={() => handleProcessPayment(k.id)}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                <CreditCard className="w-3 h-3 mr-1" /> Process Payment
                              </button>
                            )}
                            {k.status !== "REJECTED" && (
                              <button
                                onClick={() => handleUpdateStatus(k.id, "REJECTED")}
                                disabled={actionLoadingId === k.id}
                                className="inline-flex items-center justify-center px-2 py-1 rounded-md border bg-red-50 text-red-700 hover:bg-red-100"
                              >
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </button>
                            )}
                          </div>
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
      </div>
    </DashboardLayout>
  );
}
