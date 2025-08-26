"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.push("/dashboard"); // redirect after login
    } catch (error: unknown) {
      console.error("Login failed:", error);
              const errorMessage = error instanceof Error ? error.message : "Invalid email or password. Please try again.";
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200/20"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-lg font-semibold tracking-wide">ListUp</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Welcome back</h2>
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-xl mb-1 focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400"
            />
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? "Logging in..." : "Login"}
          <ArrowRight className="h-4 w-4" />
        </button>
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account? <Link href="/signup" className="font-semibold text-lime-600 hover:text-lime-700">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
