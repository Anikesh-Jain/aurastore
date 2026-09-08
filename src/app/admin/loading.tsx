import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-label="Loading admin content...">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 sm:w-64 bg-muted/60 rounded-lg" />
          <div className="h-4 w-72 sm:w-96 bg-muted/40 rounded" />
        </div>
        <div className="h-9 w-32 bg-muted/60 rounded-lg" />
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border bg-card/60 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-muted/60 rounded" />
              <div className="w-8 h-8 rounded-lg bg-muted/60" />
            </div>
            <div className="h-7 w-28 bg-muted/70 rounded" />
            <div className="h-3 w-36 bg-muted/40 rounded" />
          </div>
        ))}
      </div>

      {/* Main Chart / Content Skeleton */}
      <div className="p-6 rounded-xl border bg-card/60 space-y-4 shadow-sm">
        <div className="h-5 w-44 bg-muted/60 rounded" />
        <div className="h-3 w-64 bg-muted/40 rounded" />
        <div className="h-64 sm:h-72 w-full bg-muted/30 rounded-lg" />
      </div>

      {/* Table / Grid Skeleton */}
      <div className="p-6 rounded-xl border bg-card/60 space-y-4 shadow-sm">
        <div className="h-5 w-36 bg-muted/60 rounded" />
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-muted/40 rounded-lg flex items-center px-4 gap-4">
              <div className="h-4 w-12 bg-muted/60 rounded" />
              <div className="h-4 w-40 bg-muted/50 rounded flex-1" />
              <div className="h-4 w-20 bg-muted/60 rounded" />
              <div className="h-4 w-16 bg-muted/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
