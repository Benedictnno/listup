"use client";
import { useState } from "react";
import { useSignupStore } from "@/store/signupStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const { form, setField, reset } = useSignupStore();
  const signup = useAuthStore((state) => state.signup);
  const router = useRouter();
  const [step, setStep] = useState(1); // STEP 1 = basic info, STEP 2 = vendor info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ If role is VENDOR, move to step 2
    if (form.role === "VENDOR") {
      setStep(2);
    } else {
      // ✅ Otherwise, submit immediately (users don’t need vendor fields)
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(form);
      reset();
      router.push("/dashboard"); // redirect after successful signup
    } catch (err: any) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || "Error creating account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200/20">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-lg font-semibold tracking-wide">ListUp</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Create your account</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form className="space-y-4 mb-6" onSubmit={handleNext}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="John Doe"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="your@email.com"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="08012345678"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="••••••••"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Account Type</label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
              >
                <option value="USER">User / Student</option>
                <option value="VENDOR">Vendor / Seller</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? "Creating Account..." : (form.role === "VENDOR" ? "Next" : "Sign Up")}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* STEP 2 FORM (Only for Vendors) */}
        {step === 2 && (
          <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Store Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setField("storeName", e.target.value)}
                placeholder="Bob's Fashion Hub"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Store Address</label>
              <input
                type="text"
                value={form.storeAddress}
                onChange={(e) => setField("storeAddress", e.target.value)}
                placeholder="Opposite Faculty of Science, EKSU"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Business Category</label>
              <input
                type="text"
                value={form.businessCategory}
                onChange={(e) => setField("businessCategory", e.target.value)}
                placeholder="Food / Electronics / Fashion"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">Cover Image (optional)</label>
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setField("coverImage", e.target.value)}
                placeholder="Image URL"
                className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Sign Up"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account? <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700">Log in</Link>
        </div>
      </div>
    </div>
  );
}
