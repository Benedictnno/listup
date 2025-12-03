"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from "react";
import { useSignupStore } from "@/store/signupStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowRight,
  Store,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import {
  parseApiError,
  parseValidationErrors,
  getFieldErrorMessage,
  // isRetryableError,
  getSuccessMessage,
} from "@/utils/errorHandler";
import ErrorNotice from "@/components/ErrorNotice";

interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

type payloadType = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  storeName?: string;
  storeAddress?: string;
  businessCategory?: string;
}

function SignupContent() {
  const { form, setField, reset } = useSignupStore();
  const signup = useAuthStore((state) => state.signup);
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI & flow state
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(
    {}
  );
  const [success, setSuccess] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [hasReferralDiscount, setHasReferralDiscount] = useState<boolean>(false);

  // Addresses (admin-managed) for vendor signup
  const [addresses, setAddresses] = useState<{ id: string; name: string, active: boolean, createdAt: string, updatedAt: string }[]>(
    []
  );
  const [addressesLoading, setAddressesLoading] = useState<boolean>(false);
  const [addressesError, setAddressesError] = useState<string>("");

  const clearErrors = () => {
    setError("");
    setFieldErrors({});
    setSuccess("");
  };

  // Auto-fill referral code from URL (?ref=CODE) on first load
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref && !form.referralCode) {
      setField("referralCode", ref.toUpperCase());
      setHasReferralDiscount(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch admin-defined active addresses when vendor reaches step 2
  const fetchAddresses = async () => {
    try {
      setAddressesLoading(true);
      setAddressesError("");
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_ADDRESS_API || "http://localhost:4001/api";
      const res = await axios.get(`${API_BASE_URL}/addresses`);
      const data = Array.isArray(res.data) ? res.data : [];
      const active = data.filter((a: any) => a.active);
      const mapped = active.map((a: any) => ({
        id: a.id ?? a._id ?? a.addressId ?? String(a.name),
        name: a.name ?? a.address ?? a.label ?? String(a.id ?? a._id),
        active: a.active,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      }));
      setAddresses(mapped);

      // Default selection: if vendor has no storeAddress yet, set the first active address name
      if (mapped.length > 0 && !form.storeAddress) {
        setField("storeAddress", mapped[0].name);
      }
    } catch (err: any) {
      console.error("Error fetching addresses:", err);
      setAddressesError(
        err?.response?.data?.message || "Failed to load addresses"
      );
    } finally {
      setAddressesLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch when vendor is on step 2
    if (form.role === "VENDOR" && step === 2) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.role, step]);

  /* -------------------------
     Validation helpers
     ------------------------- */
  const setFieldError = (field: string, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const getFieldError = (field: string) => fieldErrors[field];
  const isFieldValid = (field: string) => {
    const value = (form as any)[field] || "";
    return !getFieldError(field) && Boolean(String(value).trim());
  };

  const validateStep1 = (): boolean => {
    clearErrors();
    let valid = true;

    const nameErr = getFieldErrorMessage("name", form.name);
    if (nameErr) {
      setFieldError("name", nameErr);
      valid = false;
    }

    const emailErr = getFieldErrorMessage("email", form.email);
    if (emailErr) {
      setFieldError("email", emailErr);
      valid = false;
    }

    const passwordErr = getFieldErrorMessage("password", form.password);
    if (passwordErr) {
      setFieldError("password", passwordErr);
      valid = false;
    }

    if (String(form.phone || "").trim()) {
      const phoneErr = getFieldErrorMessage("phone", form.phone);
      if (phoneErr) {
        setFieldError("phone", phoneErr);
        valid = false;
      }
    }

    if (!valid) setError("Please fix the errors below to continue");
    return valid;
  };

  const validateStep2 = (): boolean => {
    clearErrors();
    let valid = true;

    const storeNameErr = getFieldErrorMessage(
      "storeName",
      form.storeName || ""
    );
    if (storeNameErr) {
      setFieldError("storeName", storeNameErr);
      valid = false;
    }

    const storeAddressErr = getFieldErrorMessage(
      "storeAddress",
      form.storeAddress || ""
    );
    if (storeAddressErr) {
      setFieldError("storeAddress", storeAddressErr);
      valid = false;
    }

    const businessCategoryErr = getFieldErrorMessage(
      "businessCategory",
      form.businessCategory || ""
    );
    if (businessCategoryErr) {
      setFieldError("businessCategory", businessCategoryErr);
      valid = false;
    }

    if (!valid) setError("Please complete all vendor information to continue");
    return valid;
  };

  /* -------------------------
     Handlers
     ------------------------- */
  const handleFieldChange = (field: string, value: string) => {
    setField(field, value);
    if (fieldErrors[field]) clearFieldError(field);

    if (field === "referralCode") {
      // Simple badge toggle: show discount badge if code is non-empty
      setHasReferralDiscount(Boolean(value.trim()));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    // If vendor, move to step 2
    if (form.role === "VENDOR") {
      setStep(2);
      setSuccess("Basic information completed! Now add your store details.");
      // fetchAddresses will run via useEffect when step becomes 2
    } else {
      // Non-vendor: final submit
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If vendor on step 2, validate step 2 fields
    if (form.role === "VENDOR" && step === 2 && !validateStep2()) return;

    setLoading(true);
    clearErrors();

    try {
      const payload: payloadType = {
        name: String(form.name || "").trim(),
        email: String(form.email || "").trim(),
        password: form.password,
        role: form.role,
      };
      if (String(form.phone || "").trim()) payload.phone = String(form.phone).trim();
      if (form.role === "VENDOR") {
        payload.storeName = String(form.storeName || "").trim();
        payload.storeAddress = String(form.storeAddress || "").trim();
        payload.businessCategory = String(form.businessCategory || "").trim();
      }

      if (String((form as any).referralCode || "").trim()) {
        (payload as any).referralCode = String((form as any).referralCode).trim().toUpperCase();
      }

      const result = await signup(payload);

      setSuccess("Account created successfully! Please check your email to verify your account.");
      reset();

      // Store email temporarily for the verification page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pendingVerificationEmail', payload.email);
      }

      // Redirect to email verification notice page
      setTimeout(() => router.push("/signup-success"), 2000);
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const message = parseApiError(err);
      setError(message);

      const valErrors: ValidationError[] = parseValidationErrors(err);
      if (valErrors.length > 0) {
        valErrors.forEach((ve) => {
          if (ve.field) setFieldError(ve.field, ve.message);
        });
        setError("Please fix the errors below to continue");
      }

      // if (isRetryableError(err)) {
      //   setRetryCount((p) => p + 1);
      // }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    clearErrors();
  };

  // const handleRetry = () => {
  //   setError("");
  //   setRetryCount(0);
  //   // attempt submit again
  //   handleSubmit(new Event("submit") as any);
  // };

  /* -------------------------
     Render
     ------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />

      <div className="relative z-10 bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-xl border border-slate-200/20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">
            LU
          </div>
          <div>
            <div className="text-lg font-semibold tracking-wide">ListUp</div>
            <div className="text-sm text-slate-500">Create your account</div>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">{success}</p>
                <p className="text-xs text-green-600 mt-1">
                  Redirecting to dashboard...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <ErrorNotice
            message={error}
            rawError={error}
            retryCount={retryCount}
          // onRetry={handleRetry}
          />
        )}

        {/* Progress indicator for vendor */}
        {form.role === "VENDOR" && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? "bg-lime-400" : "bg-slate-300"}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? "bg-lime-400" : "bg-slate-300"}`} />
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">Step {step} of 2</p>
          </div>
        )}

        {/* ------------------
            STEP 1 - BASIC INFO
            ------------------ */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4 mb-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="John Doe"
                required
                className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("name")
                  ? "border-red-300 bg-red-50"
                  : isFieldValid("name")
                    ? "border-green-300 bg-green-50"
                    : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-lime-200`}
              />
              {getFieldError("name") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("name")}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="you@example.com"
                required
                className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("email")
                  ? "border-red-300 bg-red-50"
                  : isFieldValid("email")
                    ? "border-green-300 bg-green-50"
                    : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-lime-200`}
              />
              {getFieldError("email") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("email")}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Phone Number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="08012345678"
                className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("phone")
                  ? "border-red-300 bg-red-50"
                  : form.phone?.trim() && !getFieldError("phone")
                    ? "border-green-300 bg-green-50"
                    : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-lime-200`}
              />
              {getFieldError("phone") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("phone")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">Optional - for account recovery and notifications</p>
            </div>



            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleFieldChange("password", e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full p-3 pr-12 rounded-xl transition-colors border ${getFieldError("password")
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("password")
                      ? "border-green-300 bg-green-50"
                      : "border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-lime-200`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {getFieldError("password") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("password")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Account Type *</label>
              <select
                value={form.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200"
              >
                <option value="VENDOR">🏪 Vendor / Seller</option>
                <option value="USER">👤 User / Student</option>
              </select>
            </div>

            {/* Tips */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-700">
              <p className="font-medium mb-1">💡 Account creation tips:</p>
              <ul className="space-y-1">
                <li>• Use your real name as it appears on official documents</li>
                <li>• Choose a strong password with at least 6 characters</li>
                <li>• Phone number is optional but recommended for account recovery</li>
                <li>• Vendor accounts require additional store information</li>
              </ul>
            </div>

            {/* Next / Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {form.role === "VENDOR" ? "Next Step" : "Create Account"}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ------------------
            STEP 2 - VENDOR INFO
            ------------------ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4">
            <div className="mb-2 p-3 bg-lime-50 rounded-lg border border-lime-200 text-lime-700">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                <span className="font-medium">Vendor Account Setup</span>
              </div>
              <p className="text-sm text-lime-600 mt-1">Complete your store information to start selling</p>
            </div>

            {/* Referral Code (optional) */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 flex items-center gap-2">
                Referral Code
                {hasReferralDiscount && form.role === "VENDOR" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                    Save ₦2,000 on vendor signup
                  </span>
                )}
              </label>
              <input
                type="text"
                value={(form as any).referralCode || ""}
                onChange={(e) => handleFieldChange("referralCode", e.target.value.toUpperCase())}
                placeholder="Optional - e.g. BOB-A3F2E1"
                className="w-full p-3 rounded-xl transition-colors border border-slate-300 focus:outline-none focus:ring-2 focus:ring-lime-200 text-sm tracking-wide"
              />
              <p className="mt-1 text-xs text-slate-500">
                If you followed a friend&apos;s referral link, this should be filled automatically.
              </p>
            </div>
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Store Name *</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => handleFieldChange("storeName", e.target.value)}
                placeholder="Bob's Fashion Hub"
                required
                className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("storeName")
                  ? "border-red-300 bg-red-50"
                  : isFieldValid("storeName")
                    ? "border-green-300 bg-green-50"
                    : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-lime-200`}
              />
              {getFieldError("storeName") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("storeName")}
                </p>
              )}
            </div>

            {/* Store Address - admin-managed */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Store Address *</label>
              {addressesLoading ? (
                <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded">Loading addresses...</div>
              ) : addressesError ? (
                <div className="text-sm text-red-600 p-2 bg-red-50 rounded">{addressesError}</div>
              ) : addresses.length === 0 ? (
                <div className="text-sm text-amber-700 p-2 bg-amber-50 rounded">
                  No active selling addresses available. Please contact admin.
                </div>
              ) : (
                <select
                  value={form.storeAddress}
                  onChange={(e) => handleFieldChange("storeAddress", e.target.value)}
                  required
                  className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("storeAddress")
                    ? "border-red-300 bg-red-50"
                    : isFieldValid("storeAddress")
                      ? "border-green-300 bg-green-50"
                      : "border-slate-300"
                    } focus:outline-none focus:ring-2 focus:ring-lime-200`}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name}
                    </option>
                  ))}
                </select>
              )}

              {getFieldError("storeAddress") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("storeAddress")}
                </p>
              )}

              <p className="mt-1 text-xs text-slate-500">Selected from admin-approved selling locations.</p>
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Business Category *</label>
              <input
                type="text"
                value={form.businessCategory}
                onChange={(e) => handleFieldChange("businessCategory", e.target.value)}
                placeholder="Food / Electronics / Fashion"
                required
                className={`w-full p-3 rounded-xl transition-colors border ${getFieldError("businessCategory")
                  ? "border-red-300 bg-red-50"
                  : isFieldValid("businessCategory")
                    ? "border-green-300 bg-green-50"
                    : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-lime-200`}
              />
              {getFieldError("businessCategory") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("businessCategory")}
                </p>
              )}
            </div>

            {/* Tips & info */}
            <div className="p-3 bg-lime-50 rounded-lg border border-lime-200 text-lime-700 text-xs">
              <p className="font-medium mb-1">💡 Store setup tips:</p>
              <ul className="space-y-1">
                <li>• Choose a memorable store name that reflects your business</li>
                <li>• Include landmarks or nearby locations in your address</li>
                <li>• Be specific about your business category to help customers find you</li>
                <li>• You can update store details later from your profile settings</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 text-sm">
              💡 You can add your store logo and cover image later from your profile settings
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-300"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 hover:-translate-y-0.5 hover:bg-lime-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
