import React from 'react';
import EditableText from './EditableText';
import { Truck, CheckCircle } from 'lucide-react';
import { useTheme } from './ThemeContext';

export default function DeliveryIntegrationPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
        
            {/* Background Map Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{backgroundImage: `radial-gradient(${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '10px 10px'}}>
            </div>
            
            {/* Road/Path Graphic */}
            <div className="absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 bg-[#E5E7EB] skew-y-6 transform scale-110"></div>
            <div className="absolute top-1/2 left-0 w-full h-24 -translate-y-1/2 bg-[#D1D5DB] skew-y-6 transform scale-110 flex items-center justify-center gap-12 overflow-hidden">
                 <div className="w-16 h-2 bg-white/50 skew-x-12"></div>
                 <div className="w-16 h-2 bg-white/50 skew-x-12"></div>
                 <div className="w-16 h-2 bg-white/50 skew-x-12"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <div className="text-center mt-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-1 leading-tight" style={{ color: t.primary }}>شاشة وحدة</EditableText>
                    <EditableText as="p" className="text-lg sm:text-xl font-bold" style={{ color: t.accent }}>لكل طلبات التوصيل</EditableText>
                </div>

                {/* Central Visual - Merging Logos */}
                <div className="flex-1 w-full flex items-center justify-center relative mt-8">
                    
                    {/* Sylo Tablet - The Destination */}
                    <div className="relative z-20 w-48 h-32 rounded-xl shadow-2xl flex items-center justify-center border-b-8 transform scale-110" style={{ backgroundColor: t.primary, borderColor: t.primaryDark }}>
                         <div className="w-full h-full bg-white m-1 rounded-lg flex flex-col items-center justify-center gap-2 overflow-hidden relative">
                             {/* Incoming Orders Animation */}
                             <div className="absolute top-2 right-2 flex gap-1 animate-pulse">
                                 <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                 <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                             </div>
                             <span className="text-3xl font-black" style={{ color: t.primary }}>SYLO</span>
                             <div className="px-3 py-1 rounded text-xs font-bold" style={{ backgroundColor: t.primaryLight, color: t.accent }}>
                                 +5 طلبات جديدة
                             </div>
                         </div>
                    </div>

                    {/* Logos Flowing In (Left) */}
                    <div className="absolute left-4 sm:left-12 top-1/2 -translate-y-12 flex flex-col gap-4 animate-slide-in-left">
                        <div className="w-14 h-14 bg-[#FF5A00] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs border-4 border-white transform -rotate-12 hover:scale-110 transition-transform">
                            Talabat
                        </div>
                        <div className="w-14 h-14 bg-[#C2002F] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs border-4 border-white transform rotate-6 hover:scale-110 transition-transform ml-8">
                            Jahez
                        </div>
                    </div>

                    {/* Logos Flowing In (Right) */}
                    <div className="absolute right-4 sm:right-12 top-1/2 -translate-y-8 flex flex-col gap-4 animate-slide-in-right">
                         <div className="w-14 h-14 bg-[#00CCBC] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-[10px] border-4 border-white transform rotate-12 hover:scale-110 transition-transform mr-4">
                            Deliveroo
                        </div>
                        <div className="w-14 h-14 bg-[#5433FF] rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xs border-4 border-white transform -rotate-6 hover:scale-110 transition-transform">
                            Cari
                        </div>
                    </div>

                    {/* Connection Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-50">
                        <path d="M100 250 Q 180 300 220 300" fill="none" stroke={t.primary} strokeWidth="2" strokeDasharray="4 4" />
                        <path d="M500 250 Q 420 300 380 300" fill="none" stroke={t.primary} strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                </div>

                {/* Footer Benefit */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mt-4 shadow-sm" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
                    <CheckCircle size={16} />
                    <EditableText>توقف عن استخدام ٥ تابلتات</EditableText>
                </div>

            </div>
      </div>
  );
}
