"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { parseApiError, getFieldErrorMessage, isRetryableError } from "@/utils/errorHandler";
import api from "@/utils/axios";

type Step = 'email' | 'verification' | 'reset';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);
  
  const router = useRouter();

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    if (field === 'verificationCode') setVerificationCode(value);
    if (field === 'newPassword') setNewPassword(value);
    if (field === 'confirmPassword') setConfirmPassword(value);
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

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
    const value = field === 'email' ? email : 
                  field === 'verificationCode' ? verificationCode :
                  field === 'newPassword' ? newPassword :
                  field === 'confirmPassword' ? confirmPassword : '';
    return !getFieldError(field) && Boolean(value.trim());
  };

  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendVerificationCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    
    const emailError = validateField('email', email);
    if (emailError) {
      setFieldErrors({ email: emailError });
      setError("Please fix the errors below to continue");
      return;
    }

    setLoading(true);
    
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("Verification code sent to your email! Please check your inbox.");
      setStep('verification');
      startCountdown();
    } catch (error: unknown) {
      console.error("Failed to send verification code:", error);
      const errorMessage = parseApiError(error);
      setError(errorMessage);
      
      if (isRetryableError(error)) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setFieldErrors({ verificationCode: "Verification code is required" });
      setError("Please enter the verification code");
      return;
    }

    setLoading(true);
    
    try {
      await api.post("/auth/verify-reset-code", { 
        email: email.trim(), 
        code: verificationCode.trim() 
      });
      setSuccess("Code verified! Now set your new password.");
      setStep('reset');
    } catch (error: unknown) {
      console.error("Failed to verify code:", error);
      const errorMessage = parseApiError(error);
      setError(errorMessage);
      
      if (isRetryableError(error)) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError("");
    setSuccess("");
    
    const newPasswordError = validateField('password', newPassword);
    const confirmPasswordError = newPassword !== confirmPassword ? "Passwords do not match" : null;
    
    if (newPasswordError || confirmPasswordError) {
      setFieldErrors({
        newPassword: newPasswordError || "",
        confirmPassword: confirmPasswordError || ""
      });
      setError("Please fix the errors below to continue");
      return;
    }

    setLoading(true);
    
    try {
      await api.post("/auth/reset-password", {
        email: email.trim(),
        code: verificationCode.trim(),
        newPassword: newPassword
      });
      
      setSuccess("Password reset successfully! Redirecting to login...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      
    } catch (error: unknown) {
      console.error("Failed to reset password:", error);
      const errorMessage = parseApiError(error);
      setError(errorMessage);
      
      if (isRetryableError(error)) {
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSuccess("New verification code sent!");
      startCountdown();
    } catch (error: unknown) {
      const errorMessage = parseApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setError("");
    setRetryCount(0);
    if (step === 'email') {
      handleSendVerificationCode(new Event('submit') as any);
    } else if (step === 'verification') {
      handleVerifyCode(new Event('submit') as any);
    } else if (step === 'reset') {
      handleResetPassword(new Event('submit') as any);
    }
  };

  const goBack = () => {
    if (step === 'verification') {
      setStep('email');
      setVerificationCode("");
      setError("");
      setSuccess("");
    } else if (step === 'reset') {
      setStep('verification');
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
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
        
        {step !== 'email' && (
          <button
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        
        <h2 className="text-2xl font-bold mb-2 text-slate-800">
          {step === 'email' && 'Forgot Password'}
          {step === 'verification' && 'Verify Code'}
          {step === 'reset' && 'Reset Password'}
        </h2>
        
        <p className="text-slate-600 mb-6">
          {step === 'email' && 'Enter your email address and we\'ll send you a verification code to reset your password.'}
          {step === 'verification' && `We've sent a 6-digit verification code to ${email}`}
          {step === 'reset' && 'Enter your new password below'}
        </p>
        
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'email' ? 'bg-lime-400' : 'bg-slate-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'verification' ? 'bg-lime-400' : 'bg-slate-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'reset' ? 'bg-lime-400' : 'bg-slate-300'}`} />
          </div>
          <p className="text-center text-sm text-slate-500 mt-2">
            Step {step === 'email' ? 1 : step === 'verification' ? 2 : 3} of 3
          </p>
        </div>
        
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                {isRetryableError(error) && retryCount < 3 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {step === 'email' && (
          <form onSubmit={handleSendVerificationCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  onBlur={(e) => handleBlur("email", e.target.value)}
                  className={`w-full border p-3 pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                    getFieldError("email") 
                      ? "border-red-300 bg-red-50" 
                      : isFieldValid("email") 
                      ? "border-green-300 bg-green-50" 
                      : "border-slate-300"
                  }`}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
              {getFieldError("email") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("email")}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Verification Code
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </button>
          </form>
        )}
        
        {step === 'verification' && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Verification Code
              </label>
              <input
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => handleFieldChange("verificationCode", e.target.value)}
                maxLength={6}
                className={`w-full border p-3 rounded-xl text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("verificationCode") 
                    ? "border-red-300 bg-red-50" 
                    : verificationCode.trim() && !getFieldError("verificationCode")
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
              />
              {getFieldError("verificationCode") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("verificationCode")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </>
              )}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0 || loading}
                className="text-sm text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed underline"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
        
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => handleFieldChange("newPassword", e.target.value)}
                onBlur={(e) => handleBlur("password", e.target.value)}
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("newPassword") 
                    ? "border-red-300 bg-red-50" 
                    : isFieldValid("newPassword") 
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
              />
              {getFieldError("newPassword") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("newPassword")}
                </p>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                className={`w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-200 focus:border-lime-400 transition-colors ${
                  getFieldError("confirmPassword") 
                    ? "border-red-300 bg-red-50" 
                    : confirmPassword && newPassword === confirmPassword
                    ? "border-green-300 bg-green-50" 
                    : "border-slate-300"
                }`}
              />
              {getFieldError("confirmPassword") && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {getFieldError("confirmPassword")}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-slate-900 shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)] transition hover:-translate-y-0.5 hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-lime-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                <>
                  Reset Password
                  <CheckCircle className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-lime-600 hover:text-lime-700">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
