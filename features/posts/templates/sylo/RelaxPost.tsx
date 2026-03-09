import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { Plane, Phone, Apple, Play } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// Ensure the font is loaded in your layout
// @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

export default function RelaxPost() {
  const t = useTheme();
  return (
      /* Post Container - Responsive Wrapper */
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto">
        <div 
            className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12 font-sans"
            style={{ background: `linear-gradient(to bottom right, ${t.primaryLight}, #d4eadd)`, color: t.primary, fontFamily: t.font }}
        >
            {/* --- Background Decor --- */}
            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: t.accent + '1a' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-white/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* --- Header Content --- */}
            <DraggableWrapper id="headline-relax" className="relative z-10 text-center space-y-2 mt-4 sm:mt-8">
            <EditableText as="h1" className="text-5xl sm:text-7xl font-black tracking-tight leading-tight" style={{ color: t.primary }}>
                ريّــــح بـالــك
            </EditableText>
            <EditableText as="p" className="text-xl sm:text-3xl font-bold opacity-90" style={{ color: t.accent }}>
                مع نظام الكاشير من كيو
            </EditableText>
            </DraggableWrapper>

            {/* --- Central Visual (Toggle Switch Concept) --- */}
            <DraggableWrapper id="visual-relax" className="relative z-10 flex justify-center items-center my-4 sm:my-8">
                {/* Toggle Track */}
                <div className="w-48 sm:w-64 h-24 sm:h-32 bg-[#CADED3] rounded-full p-2 shadow-inner relative overflow-hidden border border-white/50">
                    {/* Active/Inactive Text (Subtle) */}
                    <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-8 font-bold text-sm sm:text-lg select-none" style={{ color: t.primary + '4d' }}>
                        <span>ON</span>
                        <span>OFF</span>
                    </div>

                    {/* Toggle Knob (Airplane Mode) */}
                    <div className="h-full aspect-square rounded-full shadow-2xl flex items-center justify-center transform translate-x-24 sm:translate-x-32 transition-transform" style={{ backgroundColor: t.primary }}>
                        <Plane className="text-white w-10 h-10 sm:w-14 sm:h-14 transform rotate-[-45deg]" strokeWidth={2} />
                    </div>
                </div>
            </DraggableWrapper>

            {/* --- Footer / Contact --- */}
            <DraggableWrapper id="footer-relax" className="relative z-10 flex items-end justify-between w-full">

                {/* Contact Info */}
                <DraggableWrapper id="card-relax-1" className="flex flex-col items-start gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 sm:p-2 rounded-full text-white" style={{ backgroundColor: t.primary }}>
                            <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <EditableText className="text-lg sm:text-xl font-bold">تواصل معنا</EditableText>
                    </div>
                    <div className="flex flex-col text-xl sm:text-2xl font-black tracking-wider" style={{ color: t.primary }}>
                        <span>97324128</span>
                        <span>96915334</span>
                    </div>
                </DraggableWrapper>

                {/* Logo Mark (Center Bottom - subtle) */}
                <DraggableWrapper id="logo-relax" className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-20 hidden sm:block">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                        <span className="text-white font-bold text-2xl">Q</span>
                    </div>
                </DraggableWrapper>

                {/* App Store Badges */}
                <DraggableWrapper id="card-relax-2" className="flex flex-col gap-2 scale-90 origin-bottom-right sm:scale-100">
                    <div className="text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 w-32 sm:w-36 shadow-lg" style={{ backgroundColor: t.primary }}>
                        <Apple size={20} fill="white" className="shrink-0" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[9px] sm:text-[10px] font-light opacity-80">Download on the</span>
                            <span className="text-[10px] sm:text-[12px] font-bold">App Store</span>
                        </div>
                    </div>
                    <div className="text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 w-32 sm:w-36 shadow-lg" style={{ backgroundColor: t.primary }}>
                        <Play size={20} fill="white" className="shrink-0" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[9px] sm:text-[10px] font-light opacity-80">GET IT ON</span>
                            <span className="text-[10px] sm:text-[12px] font-bold">Google Play</span>
                        </div>
                    </div>
                </DraggableWrapper>

            </DraggableWrapper>
        </div>
      </div>
  );
}
