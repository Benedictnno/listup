import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-6">Page Not Found</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center px-6 py-3 bg-lime-400 text-slate-900 font-semibold rounded-xl hover:bg-lime-300 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
