import React from "react";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-lg"
      >
        <defs>
          <filter id="nextRibbonShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#55000A" floodOpacity="0.45" />
          </filter>
          <linearGradient id="nextRibbonGradLeft" x1="16" y1="12" x2="60" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="50%" stopColor="#C1121F" />
            <stop offset="100%" stopColor="#5F0008" />
          </linearGradient>
          <linearGradient id="nextRibbonGradRight" x1="84" y1="12" x2="40" y2="82" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF4D6D" />
            <stop offset="50%" stopColor="#C1121F" />
            <stop offset="100%" stopColor="#5F0008" />
          </linearGradient>
          <linearGradient id="nextFoldGrad" x1="45" y1="75" x2="55" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C1121F" />
            <stop offset="100%" stopColor="#3F0005" />
          </linearGradient>
        </defs>
        <g filter="url(#nextRibbonShadow)">
          <path
            d="M 50,82 C 28,70 16,50 16,32 C 16,18 28,10 40,18 C 48,24 54,34 54,46 C 54,58 48,68 40,74"
            stroke="url(#nextRibbonGradLeft)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 50,82 C 28,70 16,50 16,32 C 16,18 28,10 40,18 C 48,24 54,34 54,46 C 54,58 48,68 40,74"
            stroke="#FFCCD5"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 50,82 C 72,70 84,50 84,32 C 84,18 72,10 60,18 C 52,24 46,34 46,46 C 46,58 52,68 60,74"
            stroke="url(#nextRibbonGradRight)"
            strokeWidth="11"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 50,82 C 72,70 84,50 84,32 C 84,18 72,10 60,18 C 52,24 46,34 46,46 C 46,58 52,68 60,74"
            stroke="#FFCCD5"
            strokeWidth="0.75"
            strokeDasharray="2 2"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M 45,78 L 50,83.5 L 55,78"
            stroke="url(#nextFoldGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
}
