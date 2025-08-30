"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import Link from "next/link";
import { parseApiError, getFieldErrorMessage, isRetryableError, getSuccessMessage } from "@/utils/errorHandler";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  // Clear errors when user starts typing
  useEffect(() => {
    if (error && (email || password)) {
      setError("");
    }
  }, [email, password, error]);

  // Clear field errors when user types
  const handleFieldChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Real-time validation
  const validateField = (field: string, value: string): string | null => {
    return getFieldErrorMessage(field, value);
  };

  const handleBlur = (field: string, value: string) => {
    const errorMessage = validateField(field, value);
    if (errorMessage) {
      setFieldErrors(prev => ({ ...prev, [field]: errorMessage }));
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return fieldErrors[field];
  };

  const isFieldValid = (field: string): boolean => {
    const value = field === 'email' ? email : password;
    return !getFieldError(field) && Boolean(value.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError("");
    setSuccess("");
    
    // Validate fields
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);
    
    if (emailError || passwordError) {
      setFieldErrors({
        email: emailError || "",
        password: passwordError || ""
      });
      setError("Please fix the errors below to continue");
      return;
    }

    setLoading(true);
    
    try {
      await login(email.trim(), password);
      setSuccess(getSuccessMessage('login'));
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
      
    } catch (error: unknown) {
      console.error("Login failed:", error);
      
      const errorMessage = parseApiError(error);
      setError(errorMessage);
      
      // Increment retry count for retryable errors
      if (isRetryableError(error)) {
        setRetryCount(prev => prev + 1);
      }
      
      // Clear field errors to avoid confusion
      setFieldErrors({});
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setRetryCount(0);
    handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(148,163,184,0.18),transparent_70%),radial-gradient(800px_400px_at_100%_10%,rgba(148,163,184,0.12),transparent_60%)]" />
      
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-slate-200/20"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-400 text-slate-900 font-black">LU</div>
          <span className="text-lg font-semibold tracking-wide">ListUp</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Welcome back</h2>
        
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
              <div className="flex-1">
                <p className="font-medium text-green-800">{success}</p>
                <div className="mt-2 text-xs text-green-600 bg-green-100 p-2 rounded-lg">
                  <p className="font-medium mb-1">🎉 Welcome back to ListUp!</p>
                  <p>You'll be redirected to your dashboard in a few seconds...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
              <div className="flex-1 space-y-2">
                <p className="font-medium text-red-800">{error}</p>
                
                {/* Helpful suggestions based on error type */}
                {error.toLowerCase().includes('email') && (
                  <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                    <p className="font-medium mb-1">💡 Helpful tips:</p>
                    <ul className="space-y-1">
                      <li>• Check if your email address is spelled correctly</li>
                      <li>• Make sure you're using the email you registered with</li>
                      <li>• Try copying and pasting your email address</li>
                    </ul>
                  </div>
                )}
                
                {error.toLowerCase().includes('password') && (
                  <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                    <p className="font-medium mb-1">💡 Helpful tips:</p>
                    <ul className="space-y-1">
                      <li>• Check if Caps Lock is turned off</li>
                      <li>• Make sure you're using the correct password</li>
                      <li>• Try typing your password slowly</li>
                    </ul>
                  </div>
                )}
                
                {error.toLowerCase().includes('account not found') && (
                  <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                    <p className="font-medium mb-1">💡 Don't have an account?</p>
                    <p>You can create a new account by clicking the "Sign up" link below.</p>
                  </div>
                )}
                
                {/* Retry button for retryable errors */}
                {isRetryableError(error) && retryCount < 3 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 inline-flex items-center gap-2 text-xs text-red-600 hover:text-red-700 underline bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Try again
                  </button>
                )}
                
                {/* Contact support for persistent errors */}
                {retryCount >= 3 && (
                  <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
                    <p className="font-medium mb-1">Still having trouble?</p>
                    <p>Please contact our support team for assistance.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4 mb-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={(e) => handleBlur("email", e.target.value)}
              className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                getFieldError("email") 
                  ? "border-red-300 bg-red-50" 
                  : isFieldValid("email") 
                  ? "border-green-300 bg-green-50" 
                  : "border-slate-300"
              }`}
            />
            {getFieldError("email") && (
              <div className="mt-1 text-xs text-red-600">
                <div className="flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">{getFieldError("email")}</span>
                </div>
                <div className="ml-4 text-red-500 bg-red-50 p-2 rounded-lg">
                  <p className="font-medium mb-1">💡 Email format:</p>
                  <p>Use format: yourname@example.com</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                className={`w-full border p-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("password") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("password") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {getFieldError("password") && (
              <div className="mt-1 text-xs text-red-600">
                <div className="flex items-center gap-1 mb-1">
                  <AlertCircle className="w-3 h-3" />
                  <span className="font-medium">{getFieldError("password")}</span>
                </div>
                <div className="ml-4 text-red-500 bg-red-50 p-2 rounded-lg">
                  <p className="font-medium mb-1">💡 Password requirements:</p>
                  <ul className="space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Mix of letters, numbers, and symbols</li>
                    <li>• Avoid common passwords</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Helpful Tips */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">💡 Having trouble logging in?</p>
            <ul className="space-y-1">
              <li>• Make sure Caps Lock is turned off</li>
              <li>• Check that you're using the correct email address</li>
              <li>• Try copying and pasting your password</li>
              <li>• Use the "Forgot password" link if needed</li>
            </ul>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Login
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        
        {/* Help Links */}
        <div className="mt-6 space-y-3 text-center text-sm text-slate-600">
          <div>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-lime-600 hover:text-lime-700">
              Sign up
            </Link>
          </div>
          <div>
            <Link href="/forgot-password" className="text-slate-500 hover:text-slate-700 underline">
              Forgot your password?
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
