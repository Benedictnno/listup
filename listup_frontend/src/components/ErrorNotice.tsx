"use client";
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
// import { isRetryableError } from "@/utils/errorHandler";

interface Props {
  message: string;
  rawError?: unknown;
  retryCount?: number;
  onRetry?: () => void;
}

export default function ErrorNotice({ message, rawError, retryCount = 0, onRetry }: Props) {
  const lower = message ? message.toLowerCase() : "";
console.log(lower);

  return (
    <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-500" />
        <div className="flex-1 space-y-2">
          <p className="font-medium text-red-800">{message}</p>

          {lower && (
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
              <p className="font-medium mb-1">💡 Helpful tips:</p>
              <ul className="space-y-1">
                <li>• Check if your email address is spelled correctly</li>
                <li>• Make sure you're using the email you registered with</li>
              <ul className="space-y-1">
                <li>• Check if Caps Lock is turned off</li>
                <li>• Make sure you're using the correct password</li>
              </ul>
              </ul>
            </div>
          )}

          {lower.includes('password') && (
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
              <p className="font-medium mb-1">💡 Helpful tips:</p>
            </div>
          )}

          {lower.includes('account not found') && (
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
              <p className="font-medium mb-1">💡 Don't have an account?</p>
              <p>You can create a new account by clicking the "Sign up" link.</p>
            </div>
          )}

          {/* {isRetryableError(rawError) && retryCount < 3 && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-2 text-xs text-red-600 hover:text-red-700 underline bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          )} */}

          {retryCount >= 3 && (
            <div className="text-xs text-red-600 bg-red-100 p-2 rounded-lg">
              <p className="font-medium mb-1">Still having trouble?</p>
              <p>Please contact our support team for assistance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
