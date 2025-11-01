"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border bg-white text-black shadow-sm p-6">
          <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-600 mb-4">
            {error?.message || "An unexpected error occurred."}
          </p>
          {error?.digest && (
            <p className="text-xs text-gray-500 mb-4">Digest: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex items-center rounded-md bg-black text-white px-3 py-2 text-sm hover:bg-gray-800"
            >
              Try again
            </button>
            <a
              href="/"
              className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}