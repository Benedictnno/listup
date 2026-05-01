import React from 'react';

export default function ListingGridSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="h-4 w-20 bg-slate-100 animate-pulse rounded" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-square w-full bg-slate-200 animate-pulse rounded-2xl" />
            <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-slate-100 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}
