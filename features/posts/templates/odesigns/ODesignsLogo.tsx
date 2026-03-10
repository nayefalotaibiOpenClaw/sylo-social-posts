import React from 'react';

// 1. The Main Strategic Logo
export const ODesignsLogoMain = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="80" fill="url(#paint0_radial)" fillOpacity="0.2"/>
    <path d="M100 40C66.8629 40 40 66.8629 40 100C40 133.137 66.8629 160 100 160C133.137 160 160 133.137 160 100" stroke="#06B6D4" strokeWidth="12" strokeLinecap="round"/>
    <path d="M100 70V130C125 130 145 115 145 100C145 85 125 70 100 70Z" fill="#06B6D4"/>
    <circle cx="160" cy="100" r="10" fill="#F472B6"/>
    <defs>
      <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 100) rotate(90) scale(80)">
        <stop stopColor="#06B6D4"/><stop offset="1" stopColor="#0F172A" stopOpacity="0"/>
      </radialGradient>
    </defs>
  </svg>
);

// 2. The Tech-Geometric Fusion (The "O-D" Shard)
export const ODesignsLogoTech = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M60 100C60 77.9086 77.9086 60 100 60H140V140H100C77.9086 140 60 122.091 60 100Z" fill="#0F172A"/>
    <path d="M100 40L160 100L100 160L40 100L100 40Z" stroke="#06B6D4" strokeWidth="4"/>
    <rect x="90" y="80" width="20" height="40" rx="10" fill="#F472B6" transform="rotate(45 100 100)"/>
    <circle cx="100" cy="100" r="5" fill="white"/>
  </svg>
);

// 3. The Fluid/Organic "O" (The Content Flow)
export const ODesignsLogoFluid = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M100 30C138.66 30 170 61.3401 170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100" stroke="url(#paint1_linear)" strokeWidth="20" strokeLinecap="round"/>
    <path d="M100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140" stroke="#F472B6" strokeWidth="10" strokeLinecap="round" strokeDasharray="1 20"/>
    <defs>
      <linearGradient id="paint1_linear" x1="30" y1="100" x2="170" y2="100" gradientUnits="userSpaceOnUse">
        <stop stopColor="#06B6D4"/><stop offset="1" stopColor="#3B82F6"/>
      </linearGradient>
    </defs>
  </svg>
);

// 4. The Pulse (Growth Rings)
export const ODesignsLogoPulse = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="100" cy="100" r="70" stroke="#06B6D4" strokeWidth="2" strokeDasharray="10 10" opacity="0.3"/>
    <circle cx="100" cy="100" r="50" stroke="#06B6D4" strokeWidth="4" strokeDasharray="5 5" opacity="0.6"/>
    <circle cx="100" cy="100" r="30" stroke="#06B6D4" strokeWidth="8"/>
    <path d="M100 100L140 60" stroke="#F472B6" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="140" cy="60" r="8" fill="#F472B6"/>
  </svg>
);

export const ODesignsLogoMinimal = ({ className = "w-32 h-32" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="40" y="40" width="120" height="120" rx="30" fill="#0F172A"/>
    <path d="M75 70V130H100C116.569 130 130 116.569 130 100V100C130 83.4315 116.569 70 100 70H75Z" stroke="#06B6D4" strokeWidth="15"/>
    <circle cx="100" cy="100" r="15" fill="#F472B6"/>
  </svg>
);
