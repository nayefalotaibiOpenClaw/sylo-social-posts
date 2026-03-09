import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { ShoppingBag, TrendingUp, Users, FileText, Truck, Brain } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function OnePlatformPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
        
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{backgroundImage: `linear-gradient(${t.primary} 1px, transparent 1px), linear-gradient(90deg, ${t.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">

                {/* Central Hub */}
                <DraggableWrapper id="logo-oneplatform" className="relative z-20 w-32 h-32 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-12 border" style={{ borderColor: t.accent + '1a' }}>
                     <span className="font-black text-2xl tracking-widest" style={{ color: t.primary }}>SYLO</span>
                </DraggableWrapper>

                {/* Orbiting Icons */}
                <div className="absolute inset-0 w-full h-full pointer-events-none">
                    
                    {/* Top Center - POS */}
                    <DraggableWrapper id="card-oneplatform-1" className="absolute top-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg text-white animate-bounce-slow" style={{ backgroundColor: t.primary }}>
                            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <EditableText className="text-xs sm:text-sm font-black tracking-wide" style={{ color: t.primary }}>الكاشير</EditableText>
                    </DraggableWrapper>

                    {/* Top Right - Delivery */}
                    <DraggableWrapper id="card-oneplatform-2" className="absolute top-[28%] right-[12%] sm:right-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow" style={{ backgroundColor: t.accent }}>
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: t.primary }}>توصيل</EditableText>
                    </DraggableWrapper>

                    {/* Bottom Right - Finance */}
                    <DraggableWrapper id="card-oneplatform-3" className="absolute bottom-[28%] right-[12%] sm:right-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow" style={{ backgroundColor: t.accentLight }}>
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: t.primary }}>محاسبة</EditableText>
                    </DraggableWrapper>

                    {/* Bottom Center - Analytics */}
                    <DraggableWrapper id="card-oneplatform-4" className="absolute bottom-[18%] left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg text-white animate-bounce-slow" style={{ backgroundColor: t.primary }}>
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                         <EditableText className="text-xs sm:text-sm font-black tracking-wide" style={{ color: t.primary }}>تقارير</EditableText>
                    </DraggableWrapper>

                    {/* Bottom Left - AI */}
                    <DraggableWrapper id="card-oneplatform-5" className="absolute bottom-[28%] left-[12%] sm:left-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow" style={{ backgroundColor: t.accent }}>
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: t.primary }}>ذكاء</EditableText>
                    </DraggableWrapper>

                    {/* Top Left - HR */}
                    <DraggableWrapper id="card-oneplatform-6" className="absolute top-[28%] left-[12%] sm:left-[15%] flex flex-col items-center gap-1.5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg text-white animate-pulse-slow" style={{ backgroundColor: t.accentLight }}>
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                         <EditableText className="text-[10px] sm:text-xs font-black tracking-wide" style={{ color: t.primary }}>موظفين</EditableText>
                    </DraggableWrapper>

                </div>

                 {/* Connecting Lines (SVG Overlay) */}
                 <svg className="absolute inset-0 w-full h-full z-0 opacity-20 pointer-events-none">
                    <line x1="50%" y1="50%" x2="50%" y2="25%" stroke={t.primary} strokeWidth="2" /> {/* Center to Top */}
                    <line x1="50%" y1="50%" x2="50%" y2="75%" stroke={t.primary} strokeWidth="2" /> {/* Center to Bottom */}
                    <line x1="50%" y1="50%" x2="20%" y2="35%" stroke={t.primary} strokeWidth="2" /> {/* Center to Top Left */}
                    <line x1="50%" y1="50%" x2="80%" y2="35%" stroke={t.primary} strokeWidth="2" /> {/* Center to Top Right */}
                    <line x1="50%" y1="50%" x2="20%" y2="65%" stroke={t.primary} strokeWidth="2" /> {/* Center to Bottom Left */}
                    <line x1="50%" y1="50%" x2="80%" y2="65%" stroke={t.primary} strokeWidth="2" /> {/* Center to Bottom Right */}

                    {/* Dashed Orbit Circle */}
                    <circle cx="50%" cy="50%" r="35%" fill="none" stroke={t.primary} strokeWidth="2" strokeDasharray="8 8" opacity="0.3" className="animate-spin-slow" style={{transformOrigin: 'center'}} />
                </svg>
            </div>

            {/* Bottom Text */}
             <DraggableWrapper id="headline-oneplatform" className="absolute bottom-6 w-full text-center z-30 font-bold" dir="rtl">
                <EditableText as="h2" className="text-4xl font-black mb-1 tracking-tight" style={{ color: t.primary }}>منصة واحدة.</EditableText>
                <EditableText as="p" className="text-lg font-bold" style={{ color: t.accent }}>إمكانيات لا محدودة.</EditableText>
            </DraggableWrapper>

      </div>
  );
}
