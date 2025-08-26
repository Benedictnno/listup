"use client";
import { useState } from "react";
import { useSignupStore } from "@/store/signupStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowRight, Store, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

export default function SignupPage() {
  const { form, setField, reset } = useSignupStore();
  const signup = useAuthStore((state) => state.signup);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");

  const clearErrors = () => {
    setError("");
    setFieldErrors({});
    setSuccess("");
  };

  const setFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  };

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateStep1 = (): boolean => {
    clearErrors();
    let isValid = true;

    // Name validation
    if (!form.name.trim()) {
      setFieldError("name", "Full name is required");
      isValid = false;
    } else if (form.name.trim().length < 2) {
      setFieldError("name", "Name must be at least 2 characters long");
      isValid = false;
    }

    // Email validation
    if (!form.email.trim()) {
      setFieldError("email", "Email address is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFieldError("email", "Please enter a valid email address");
      isValid = false;
    }

    // Password validation
    if (!form.password) {
      setFieldError("password", "Password is required");
      isValid = false;
    } else if (form.password.length < 6) {
      setFieldError("password", "Password must be at least 6 characters long");
      isValid = false;
    }

    // Phone validation (optional but if provided, must be valid)
    if (form.phone.trim() && form.phone.trim().length < 10) {
      setFieldError("phone", "Phone number must be at least 10 digits");
      isValid = false;
    }

    if (!isValid) {
      setError("Please fix the errors below to continue");
    }

    return isValid;
  };

  const validateStep2 = (): boolean => {
    clearErrors();
    let isValid = true;

    if (!form.storeName?.trim()) {
      setFieldError("storeName", "Store name is required");
      isValid = false;
    } else if (form.storeName.trim().length < 2) {
      setFieldError("storeName", "Store name must be at least 2 characters long");
      isValid = false;
    }

    if (!form.storeAddress?.trim()) {
      setFieldError("storeAddress", "Store address is required");
      isValid = false;
    } else if (form.storeAddress.trim().length < 5) {
      setFieldError("storeAddress", "Store address must be at least 5 characters long");
      isValid = false;
    }

    if (!form.businessCategory?.trim()) {
      setFieldError("businessCategory", "Business category is required");
      isValid = false;
    } else if (form.businessCategory.trim().length < 2) {
      setFieldError("businessCategory", "Business category must be at least 2 characters long");
      isValid = false;
    }

    if (!isValid) {
      setError("Please complete all vendor information to continue");
    }

    return isValid;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    // If role is VENDOR, move to step 2
    if (form.role === "VENDOR") {
      setStep(2);
      setSuccess("Basic information completed! Now add your store details.");
    } else {
      // Otherwise, submit immediately (users don't need vendor fields)
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current step
    if (form.role === "VENDOR" && step === 2) {
      if (!validateStep2()) {
        return;
      }
    }

    setLoading(true);
    clearErrors();
    
    try {
      // Debug: Show form state
      console.log('📝 Form state before processing:', form);
      
      // Prepare signup data based on role
      const signupData = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        // Only include phone if it has a value
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        // Only include vendor fields if role is VENDOR
        ...(form.role === "VENDOR" && {
          storeName: form.storeName?.trim(),
          storeAddress: form.storeAddress?.trim(),
          businessCategory: form.businessCategory?.trim(),
        }),
      };

      // Debug: Log what we're sending
      console.log('📤 Sending signup data:', signupData);

      // Create account
      await signup(signupData);
      
      // Success - redirect to dashboard
      setSuccess("Account created successfully! Redirecting to dashboard...");
      reset();
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (err: unknown) {
      console.error("Signup error:", err);
      
      // Handle different error types
      if (err instanceof Error) {
        setError(err.message);
              } else if (typeof err === 'object' && err !== null && 'response' in err) {
          const response = (err as { response?: { data?: { message?: string; errors?: ValidationError[] } } }).response;
          if (response?.data?.message) {
            setError(response.data.message);
          } else if (response?.data?.errors) {
            // Handle field-specific errors from backend
            const errors = response.data.errors;
            errors.forEach((error: ValidationError) => {
              if (error.field) {
                setFieldError(error.field, error.message);
              }
            });
            
            if (errors.length > 0) {
              setError("Please fix the errors below to continue");
            }
          } else {
            setError("Signup failed. Please try again.");
          }
        } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    clearErrors();
  };

  const handleFieldChange = (field: string, value: string) => {
    setField(field, value);
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      clearFieldError(field);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field];
  };

  const isFieldValid = (field: string): boolean => {
    return !fieldErrors[field] && Boolean(form[field as keyof typeof form]?.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
      
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200/20">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">
            LU
          </div>
          <span className="text-lg font-semibold tracking-wide">ListUp</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create your account</h2>
        
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Progress Indicator */}
        {form.role === "VENDOR" && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-lime-400' : 'bg-slate-300'}`} />
              <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-lime-400' : 'bg-slate-300'}`} />
            </div>
            <p className="text-center text-sm text-slate-500 mt-2">
              Step {step} of 2
            </p>
          </div>
        )}

        {/* STEP 1 FORM - Basic Information */}
        {step === 1 && (
          <form className="space-y-4 mb-6" onSubmit={handleNext}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Full Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="John Doe"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("name") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("name") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
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
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Email Address *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="your@email.com"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("email") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("email") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
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
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
                placeholder="08012345678"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("phone") 
                    ? "border-red-300 bg-red-50" 
                    : form.phone.trim() && !getFieldError("phone")
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
              />
              {getFieldError("phone") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("phone")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Optional - for account recovery and notifications
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Password *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                placeholder="••••••••"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("password") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("password") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
              />
              {getFieldError("password") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("password")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Account Type *
              </label>
              <select
                value={form.role}
                onChange={(e) => handleFieldChange("role", e.target.value)}
                className="w-full border border-slate-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
              >
                <option value="USER">👤 User / Student</option>
                <option value="VENDOR">🏪 Vendor / Seller</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Processing..." : (form.role === "VENDOR" ? "Next Step" : "Create Account")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* STEP 2 FORM - Vendor Information */}
        {step === 2 && (
          <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
            <div className="mb-4 p-3 bg-lime-50 rounded-lg border border-lime-200">
              <div className="flex items-center gap-2 text-lime-700">
                <Store className="w-5 h-5" />
                <span className="font-medium">Vendor Account Setup</span>
              </div>
              <p className="text-sm text-lime-600 mt-1">
                Complete your store information to start selling
              </p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Store Name *
              </label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => handleFieldChange("storeName", e.target.value)}
                placeholder="Bob's Fashion Hub"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("storeName") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("storeName") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
              />
              {getFieldError("storeName") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("storeName")}
                </p>
              )}
            </div>

            {/* Store Address */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Store Address *
              </label>
              <input
                type="text"
                value={form.storeAddress}
                onChange={(e) => handleFieldChange("storeAddress", e.target.value)}
                placeholder="Opposite Faculty of Science, EKSU"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("storeAddress") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("storeAddress") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
              />
              {getFieldError("storeAddress") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("storeAddress")}
                </p>
              )}
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Business Category *
              </label>
              <input
                type="text"
                value={form.businessCategory}
                onChange={(e) => handleFieldChange("businessCategory", e.target.value)}
                placeholder="Food / Electronics / Fashion"
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("businessCategory") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("businessCategory") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
                required
              />
              {getFieldError("businessCategory") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("businessCategory")}
                </p>
              )}
            </div>

            {/* Info Message */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                💡 You can add your store logo and cover image later from your profile settings
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
