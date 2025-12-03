"use client";

import { X, User, Mail, Phone, Store, MapPin, CreditCard, FileText, Image as ImageIcon, CheckCircle, XCircle, Calendar, Filter } from "lucide-react";

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
    cacNumber?: string | null;
    documentUrl?: string | null;
    documentType?: string | null;
    createdAt: string;
    updatedAt: string;
    interviewScheduled?: string | null;
    interviewCompleted?: string | null;
    interviewNotes?: string | null;
    rejectionReason?: string | null;
    vendor: VendorInfo;
}

interface KYCDetailsModalProps {
    kyc: KYCSubmission;
    onClose: () => void;
    onUpdateStatus: (id: string, status: KYCStatus) => Promise<void>;
    onProcessPayment: (id: string) => Promise<void>;
    actionLoading: boolean;
}

export default function KYCDetailsModal({
    kyc,
    onClose,
    onUpdateStatus,
    onProcessPayment,
    actionLoading,
}: KYCDetailsModalProps) {
    const v = kyc.vendor;
    const canScheduleInterview =
        kyc.status === "PENDING" || kyc.status === "DOCUMENTS_REVIEW";
    const canMarkInterviewCompleted = kyc.status === "INTERVIEW_SCHEDULED";
    const canApproveWithoutPayment =
        kyc.status === "INTERVIEW_COMPLETED" && kyc.paymentStatus !== "SUCCESS";
    const canProcessPayment =
        kyc.paymentStatus !== "SUCCESS" &&
        (kyc.status === "APPROVED" || kyc.status === "INTERVIEW_COMPLETED");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-4xl w-full my-8">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">KYC Submission Details</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Review vendor KYC information and documents
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {/* Vendor Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Vendor Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{v.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{v.email}</span>
                                </div>
                                {v.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">{v.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Store Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Store className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{v.vendorProfile?.storeName || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{v.vendorProfile?.storeAddress || "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Handles */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Social Media Handles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {kyc.tiktokHandle && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">TikTok:</span>
                                    <span>{kyc.tiktokHandle}</span>
                                </div>
                            )}
                            {kyc.instagramHandle && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Instagram:</span>
                                    <span>{kyc.instagramHandle}</span>
                                </div>
                            )}
                            {kyc.facebookPage && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Facebook:</span>
                                    <span>{kyc.facebookPage}</span>
                                </div>
                            )}
                            {kyc.twitterHandle && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Twitter:</span>
                                    <span>{kyc.twitterHandle}</span>
                                </div>
                            )}
                            {kyc.otherSocial && (
                                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className="font-medium">Other:</span>
                                    <span>{kyc.otherSocial}</span>
                                </div>
                            )}
                            {!kyc.tiktokHandle && !kyc.instagramHandle && !kyc.facebookPage && !kyc.twitterHandle && !kyc.otherSocial && (
                                <div className="text-muted-foreground col-span-2">No social media handles provided</div>
                            )}
                        </div>
                    </div>

                    {/* Business Registration */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Business Registration</h3>
                        <div className="space-y-3">
                            {kyc.cacNumber && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <span className="font-medium text-sm">CAC Number:</span>
                                        <span className="ml-2 text-sm">{kyc.cacNumber}</span>
                                    </div>
                                </div>
                            )}

                            {kyc.documentUrl && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-medium text-sm">
                                            {kyc.documentType === "CAC_CERTIFICATE" ? "CAC Certificate" : "Student Portal Screenshot"}
                                        </span>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <img
                                            src={kyc.documentUrl}
                                            alt={kyc.documentType === "CAC_CERTIFICATE" ? "CAC Certificate" : "Student Portal Screenshot"}
                                            className="w-full h-auto max-h-96 object-contain bg-gray-50"
                                        />
                                    </div>
                                    <a
                                        href={kyc.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <ImageIcon className="w-3 h-3" />
                                        View full image
                                    </a>
                                </div>
                            )}

                            {!kyc.cacNumber && !kyc.documentUrl && (
                                <div className="text-muted-foreground text-sm">No business registration documents provided</div>
                            )}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Payment Information</h3>
                        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    ₦{kyc.signupFee.toLocaleString()} ({kyc.hasReferral ? "with referral" : "no referral"})
                                </span>
                            </div>
                            <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.paymentStatus === "SUCCESS"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : kyc.paymentStatus === "FAILED"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {kyc.paymentStatus}
                            </span>
                        </div>
                    </div>

                    {/* Status and Rejection Reason */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Status</h3>
                        <div className="space-y-2">
                            <div className="text-sm">
                                <span className="font-medium">Current Status: </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${kyc.status === "APPROVED" ? "bg-green-100 text-green-800" :
                                        kyc.status === "REJECTED" ? "bg-red-100 text-red-800" :
                                            kyc.status === "INTERVIEW_COMPLETED" ? "bg-emerald-100 text-emerald-800" :
                                                kyc.status === "INTERVIEW_SCHEDULED" ? "bg-indigo-100 text-indigo-800" :
                                                    kyc.status === "DOCUMENTS_REVIEW" ? "bg-blue-100 text-blue-800" :
                                                        "bg-yellow-100 text-yellow-800"
                                    }`}>
                                    {kyc.status.replace(/_/g, " ")}
                                </span>
                            </div>
                            {kyc.rejectionReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>Rejection Reason:</strong> {kyc.rejectionReason}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                        {kyc.status === "PENDING" && (
                            <button
                                onClick={() => onUpdateStatus(kyc.id, "DOCUMENTS_REVIEW")}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                            >
                                <Filter className="w-4 h-4 mr-2" /> Move to Review
                            </button>
                        )}
                        {canScheduleInterview && (
                            <button
                                onClick={() => onUpdateStatus(kyc.id, "INTERVIEW_SCHEDULED")}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                            >
                                <Calendar className="w-4 h-4 mr-2" /> Schedule Interview
                            </button>
                        )}
                        {canMarkInterviewCompleted && (
                            <button
                                onClick={() => onUpdateStatus(kyc.id, "INTERVIEW_COMPLETED")}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Mark Interview Completed
                            </button>
                        )}
                        {canApproveWithoutPayment && (
                            <button
                                onClick={() => onUpdateStatus(kyc.id, "APPROVED")}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-50"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Approve
                            </button>
                        )}
                        {canProcessPayment && (
                            <button
                                onClick={() => onProcessPayment(kyc.id)}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm disabled:opacity-50"
                            >
                                <CreditCard className="w-4 h-4 mr-2" /> Process Payment
                            </button>
                        )}
                        {kyc.status !== "REJECTED" && (
                            <button
                                onClick={() => onUpdateStatus(kyc.id, "REJECTED")}
                                disabled={actionLoading}
                                className="inline-flex items-center px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
