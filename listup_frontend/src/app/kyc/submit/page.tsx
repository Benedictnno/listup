"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { useAuthStore } from "@/store/authStore";
import { parseApiError, parseValidationErrors } from "@/utils/errorHandler";
import { CheckCircle2, AlertCircle, Loader2, Link2, PhoneCall } from "lucide-react";
import Link from "next/link";

interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

import { useFeatureFlag } from "@/context/FeatureFlagContext";

export default function KYCSubmitPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isEnabled } = useFeatureFlag();

  const [tiktokHandle, setTiktokHandle] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [facebookPage, setFacebookPage] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [otherSocial, setOtherSocial] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // CAC and document fields
  const [cacNumber, setCacNumber] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<"CAC_CERTIFICATE" | "STUDENT_PORTAL">("CAC_CERTIFICATE");
  const [documentPreview, setDocumentPreview] = useState<string>("");

  const [fee, setFee] = useState<number | null>(null);
  const [originalFee] = useState<number>(5000);
  const [discountedFee] = useState<number>(3000);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [referralChecking, setReferralChecking] = useState(false);
  const [referralError, setReferralError] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [checkingKYC, setCheckingKYC] = useState(true);

  useEffect(() => {
    // Only vendors can access this page
    if (user && user.role !== "VENDOR") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    // Check if user already has a KYC submission
    async function checkExistingKYC() {
      if (!user) return;

      try {
        setCheckingKYC(true);
        const res = await api.get("/kyc/status");
        if (res.data?.success && res.data.data.kyc) {
          const kyc = res.data.data.kyc;

          // Only allow resubmission if KYC was rejected
          if (kyc.status === "REJECTED") {
            // Stay on page to resubmit
            return;
          } else if (kyc.status === "APPROVED" || kyc.status === "INTERVIEW_COMPLETED") {
            // Ready for payment
            router.push("/kyc/payment");
          } else {
            // Pending or other status -> Go to dashboard
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking KYC status", error);
        // Allow access if there's an error checking status
      } finally {
        setCheckingKYC(false);
      }
    }

    checkExistingKYC();
  }, [user, router]);

  useEffect(() => {
    // Default fee without referral
    setFee(originalFee);
  }, [originalFee]);

  const hasAnySocial = () => {
    return (
      !!tiktokHandle.trim() ||
      !!instagramHandle.trim() ||
      !!facebookPage.trim() ||
      !!twitterHandle.trim() ||
      !!otherSocial.trim()
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setDocumentFile(null);
      setDocumentPreview("");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload an image file (JPG, PNG, etc.)");
      setFieldErrors({ document: "Only image files are allowed" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB");
      setFieldErrors({ document: "File size must be less than 5MB" });
      return;
    }

    setDocumentFile(file);
    setFieldErrors({});
    setErrorMessage("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleReferralValidate = async () => {
    setReferralError("");
    setReferralValid(null);

    const code = referralCode.trim();
    if (!code) {
      setReferralValid(null);
      setFee(originalFee);
      return;
    }

    try {
      setReferralChecking(true);
      const res = await api.get(`/referrals/validate/${encodeURIComponent(code)}`);
      if (res.data?.success) {
        setReferralValid(true);
        setFee(res.data.data?.discountedFee ?? discountedFee);
      } else {
        setReferralValid(false);
        setFee(originalFee);
        setReferralError(res.data?.message || "Invalid referral code");
      }
    } catch (error) {
      console.error("Referral validation error", error);
      setReferralValid(false);
      setFee(originalFee);
      setReferralError(parseApiError(error));
    } finally {
      setReferralChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setFieldErrors({});

    if (!hasAnySocial()) {
      setErrorMessage("Please enter at least one social media link or handle.");
      setFieldErrors({ socials: "At least one social media link or handle is required" });
      return;
    }

    try {
      setSubmitting(true);

      const payload: any = {
        tiktokHandle: tiktokHandle.trim() || undefined,
        instagramHandle: instagramHandle.trim() || undefined,
        facebookPage: facebookPage.trim() || undefined,
        twitterHandle: twitterHandle.trim() || undefined,
        otherSocial: otherSocial.trim() || undefined,
      };

      if (referralCode.trim()) {
        payload.referralCode = referralCode.trim();
      }

      // Add CAC number if provided
      if (cacNumber.trim()) {
        payload.cacNumber = cacNumber.trim();
      }

      // Add document if uploaded
      if (documentFile && documentPreview) {
        payload.documentType = documentType;
        payload.documentUrl = documentPreview; // Base64 encoded image
      }

      const res = await api.post("/kyc/submit", payload);

      if (res.data?.success) {
        setSuccessMessage(
          "KYC submitted! We'll contact you via WhatsApp for an interview."
        );
        // Optionally redirect to payment page after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setErrorMessage(res.data?.message || "Failed to submit KYC");
      }
    } catch (err: any) {
      console.error("KYC submit error", err);
      setErrorMessage(parseApiError(err));
      const valErrors: ValidationError[] = parseValidationErrors(err);
      if (valErrors.length > 0) {
        const next: Record<string, string> = {};
        valErrors.forEach((ve) => {
          if (ve.field) next[ve.field] = ve.message;
        });
        setFieldErrors(next);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayFee = fee ?? originalFee;
  const hasDiscount = referralValid === true && displayFee < originalFee;
  const savings = hasDiscount ? originalFee - displayFee : 0;

  if (checkingKYC) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />

      <div className="relative z-10 bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-2xl border border-slate-200/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold tracking-wide text-slate-900">
              Vendor KYC Verification
            </h1>
            <p className="text-sm text-slate-500">
              Submit your business social media profiles so we can verify your store.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 mt-0.5" />
            <div>{successMessage}</div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                TikTok Handle / URL
              </label>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                placeholder="@yourbusiness or https://tiktok.com/@yourbusiness"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Instagram Handle / URL
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourbusiness or https://instagram.com/yourbusiness"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Facebook Page URL
              </label>
              <input
                type="text"
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                placeholder="https://facebook.com/yourbusinesspage"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Twitter / X Handle / URL
              </label>
              <input
                type="text"
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
                placeholder="@yourbusiness or https://twitter.com/yourbusiness"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Other Social / Website
              </label>
              <input
                type="text"
                value={otherSocial}
                onChange={(e) => setOtherSocial(e.target.value)}
                placeholder="Any other link that shows your business activity"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
              {fieldErrors.socials && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.socials}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                At least one of the fields above is required.
              </p>
            </div>
          </div>

          {/* CAC Number and Document Upload */}
          <div className="rounded-xl border border-slate-200 p-4 bg-slate-50 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Business Verification (Optional)</h2>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                CAC Number
              </label>
              <input
                type="text"
                value={cacNumber}
                onChange={(e) => setCacNumber(e.target.value.toUpperCase())}
                placeholder="e.g. RC123456"
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                Enter your Corporate Affairs Commission registration number if you have one
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Verification Document
              </label>

              <div className="space-y-3">
                {/* Document Type Selection */}
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="CAC_CERTIFICATE"
                      checked={documentType === "CAC_CERTIFICATE"}
                      onChange={(e) => setDocumentType(e.target.value as "CAC_CERTIFICATE")}
                      className="w-4 h-4 text-lime-500"
                    />
                    <span className="text-sm">CAC Certificate</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="STUDENT_PORTAL"
                      checked={documentType === "STUDENT_PORTAL"}
                      onChange={(e) => setDocumentType(e.target.value as "STUDENT_PORTAL")}
                      className="w-4 h-4 text-lime-500"
                    />
                    <span className="text-sm">Student Portal Screenshot</span>
                  </label>
                </div>

                {/* File Upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-lime-50 file:text-lime-700 hover:file:bg-lime-100"
                />

                {documentFile && (
                  <div className="text-xs text-green-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {documentFile.name} ({(documentFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}

                {documentPreview && (
                  <div className="mt-2">
                    <img
                      src={documentPreview}
                      alt="Document preview"
                      className="max-w-xs rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {fieldErrors.document && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {fieldErrors.document}
                  </p>
                )}

                <p className="text-xs text-slate-500">
                  Upload a clear image of your {documentType === "CAC_CERTIFICATE" ? "CAC certificate" : "student portal showing your business/products"}. Max size: 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Referral Code Section */}
          {isEnabled('referral_system') && (
            <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Referral Code (Optional)
              </h2>
              <div className="flex flex-col md:flex-row gap-2 items-stretch md:items-center">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. BOB-A3F2E1"
                  className="flex-1 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200 text-sm tracking-wide"
                />
                <button
                  type="button"
                  onClick={handleReferralValidate}
                  disabled={referralChecking || !referralCode.trim()}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-lime-500 text-slate-900 text-sm font-semibold disabled:opacity-50"
                >
                  {referralChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Validate"
                  )}
                </button>
              </div>
              {referralValid === true && (
                <p className="mt-2 text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Referral code applied! You save ₦{savings.toLocaleString()}.
                </p>
              )}
              {referralValid === false && referralError && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {referralError}
                </p>
              )}
            </div>
          )}

          {/* Fee Display */}
          <div className="rounded-xl border border-slate-200 p-4 bg-white flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Signup Fee
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-900">
                  ₦{displayFee.toLocaleString()}
                </p>
                {hasDiscount && (
                  <p className="text-xs text-slate-400 line-through">
                    ₦{originalFee.toLocaleString()}
                  </p>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-green-700 mt-1">
                  You saved ₦{savings.toLocaleString()} with this referral.
                </p>
              )}
            </div>
            <div className="text-xs text-slate-500 max-w-xs text-right">
              You&apos;ll pay this amount after your WhatsApp interview is approved. Payment is processed securely via Paystack.
            </div>
          </div>

          {/* Important Notes */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex gap-3">
            <PhoneCall className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">WhatsApp Interview Process</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Our admin team will contact you via WhatsApp using the phone number on your account.</li>
                <li>Have your products ready to show on video so we can verify your business.</li>
                <li>After a successful interview, you&apos;ll receive a payment link to complete your signup.</li>
                <li>Once paid, your listing limit will be upgraded to unlimited and your store will be verified.</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="text-xs text-slate-500 hover:text-slate-700">
              ← Back to Dashboard
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-lime-500 text-slate-900 text-sm font-semibold shadow-sm hover:bg-lime-400 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit KYC"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
