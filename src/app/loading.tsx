import React from "react";

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center py-16 px-4">
      <div className="relative flex items-center justify-center">
        {/* Animated aura rings */}
        <div className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute w-8 h-8 rounded-full bg-primary/10 animate-pulse" />
      </div>
      <p className="text-xs font-semibold text-muted-foreground mt-4 tracking-wider uppercase">
        Loading AuraStore...
      </p>
    </div>
  );
}
