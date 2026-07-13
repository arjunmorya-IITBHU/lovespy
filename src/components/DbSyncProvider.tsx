"use client";

import React, { useState, useEffect } from "react";
import Logo from "@/components/Logo";

export default function DbSyncProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    fetch("/api/db/sync", { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FCF8F8] transition-all duration-700 ease-out">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full text-brand-pink drop-shadow-lg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Detective Hat (Spy cap) */}
            <path d="M20 50C20 30 35 25 50 25C65 25 80 30 80 50H20Z" fill="#2D221E" />
            <ellipse cx="50" cy="50" rx="36" ry="6" fill="#2D221E" />
            <rect x="35" y="42" width="30" height="5" fill="#FF6FAE" />
            {/* Magnifying Glass */}
            <g className="animate-bounce">
              <circle cx="60" cy="60" r="14" stroke="#C8A2FF" strokeWidth="4.5" fill="white" fillOpacity="0.25" />
              <path d="M70 70L84 84" stroke="#C8A2FF" strokeWidth="5.5" strokeLinecap="round" />
            </g>
          </svg>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-pink border-transparent animate-spin"></div>
        </div>
        <h3 className="font-display font-bold text-sm tracking-wider text-brand-charcoal mt-6">Lovespy Gifting Detective</h3>
        <p className="text-[10px] text-brand-gray mt-1 animate-pulse">Cracking your custom surprise templates... 🔎</p>
      </div>
    );
  }

  return <>{children}</>;
}
