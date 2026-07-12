"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";

export default function DbSyncProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/db/sync")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          Object.keys(data.data).forEach((key) => {
            localStorage.setItem(key, JSON.stringify(data.data[key]));
          });
        } else {
          console.warn("[MongoDB Connection Warning] Server failed to fetch live database snapshot. Falling back to local browser cache. Details:", data.error);
        }
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to sync DB from MongoDB:", err);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Logo className="w-16 h-16 animate-pulse-soft" />
          <span className="text-xs font-semibold text-brand-gray">Syncing database from cloud...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
