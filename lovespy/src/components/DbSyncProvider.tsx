"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";

export default function DbSyncProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/db/sync")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to reach database sync API.`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.data) {
          // Clear current local cache to prevent any stale fallbacks
          const authKey = localStorage.getItem("lovespy_user");
          const tokenKey = localStorage.getItem("lovespy_token");
          
          localStorage.clear();
          
          // Re-insert authentication states so session is preserved
          if (authKey) localStorage.setItem("lovespy_user", authKey);
          if (tokenKey) localStorage.setItem("lovespy_token", tokenKey);

          Object.keys(data.data).forEach((key) => {
            localStorage.setItem(key, JSON.stringify(data.data[key]));
          });
          setLoaded(true);
        } else {
          setDbError(data.error || "Failed to load cloud database snapshot.");
        }
      })
      .catch((err) => {
        console.error("Failed to sync DB from MongoDB:", err);
        setDbError(err.message || "Network error. Failed to connect to database server.");
      });
  }, []);

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 glass-card p-10 border border-brand-pink/20 rounded-3xl shadow-xl bg-white">
          <div className="text-4xl text-brand-pink animate-bounce">⚠️</div>
          <h2 className="text-2xl font-display font-extrabold text-brand-charcoal">
            Database Connection Error
          </h2>
          <p className="text-xs text-brand-gray leading-relaxed">
            The application failed to retrieve the live catalog from the database. Stale local fallbacks have been disabled for security.
          </p>
          <div className="text-[10px] text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 font-mono break-all text-left">
            Error: {dbError}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3 bg-brand-pink text-white rounded-xl text-xs font-bold hover:shadow-lg transition-all"
          >
            Retry Sync
          </button>
        </div>
      </div>
    );
  }

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
