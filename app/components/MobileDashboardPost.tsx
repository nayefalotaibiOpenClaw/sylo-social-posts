import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { Command, Sparkles, Smartphone } from 'lucide-react';

export default function MobileDashboardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background with Brand Texture */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }}></div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-mobile" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(183,255,91,0.4)]" style={{ backgroundColor: t.accentLime }}>
                <Command size={24} style={{ color: t.primary }} strokeWidth={3} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="font-black text-2xl tracking-tighter" style={{ color: t.primaryLight }}>SYLO</span>
             </div>
          </DraggableWrapper>
          
          <DraggableWrapper id="badge-mobile" className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full flex items-center gap-2 backdrop-blur-md">
             <Sparkles size={12} style={{ color: t.accentLime }} />
             <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: t.primaryLight }}>REAL-TIME DATA</span>
          </DraggableWrapper>
        </div>

        {/* Headline */}
        <DraggableWrapper id="headline-mobile" className="mt-8 text-right z-30" dir="rtl">
           <h2 className="text-5xl sm:text-6xl font-black leading-[1.1] mb-2" style={{ color: t.primaryLight }}>
              <EditableText>أرقامك</EditableText> <br/>
              <span style={{ color: t.accentLime }}><EditableText>تحت السيطرة</EditableText></span>
           </h2>
        </DraggableWrapper>

        {/* Realistic iPhone Mockup */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
           {/* Ground Shadow */}
           <div className="absolute bottom-4 w-48 h-4 bg-black/40 blur-xl rounded-full"></div>
           
           <DraggableWrapper id="mockup-mobile" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
              {/* iPhone Hardware Buttons */}
              <div className="absolute -left-[7px] top-24 w-[3px] h-12 rounded-l-md" style={{ backgroundColor: t.border }}></div>
              <div className="absolute -left-[7px] top-40 w-[3px] h-12 rounded-l-md" style={{ backgroundColor: t.border }}></div>
              <div className="absolute -right-[7px] top-32 w-[3px] h-16 rounded-r-md" style={{ backgroundColor: t.border }}></div>

              {/* iPhone Frame */}
              <div className="absolute inset-0 rounded-[42px] border-[7px] shadow-2xl overflow-hidden" style={{ backgroundColor: t.primaryDark, borderColor: t.border }}>
                 {/* Screen Content */}
                 <div className="absolute inset-0 bg-white">
                    <img src="/1.jpg" alt="Dashboard" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                 </div>
                 {/* Notch */}
                 <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-30"></div>
              </div>
           </DraggableWrapper>

           {/* Floating Stat Card */}
           <DraggableWrapper id="stat-card-mobile" className="absolute -right-8 top-16 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transform rotate-3 border-2 z-30" style={{ backgroundColor: t.primaryLight, borderColor: t.accentLime }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primary, color: t.accentLime }}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
              </div>
              <div className="flex flex-col leading-none">
                 <span className="text-[8px] text-gray-500 font-bold uppercase mb-1">Growth</span>
                 <span className="text-sm font-black" style={{ color: t.primary }}>+24%</span>
              </div>
           </DraggableWrapper>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-end border-t border-white/10 pt-6" dir="rtl">
           <DraggableWrapper id="footer-text-mobile" className="flex flex-col gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: t.accentLight }}>SYLO BUSINESS INTELLIGENCE</span>
              <EditableText className="text-sm font-bold" style={{ color: t.primaryLight }}>تابع مشروعك من أي مكان وفي أي وقت</EditableText>
           </DraggableWrapper>
           <DraggableWrapper id="footer-icon-mobile" className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(183,255,91,0.2)]" style={{ backgroundColor: t.accentLime, color: t.primary }}>
              <Smartphone size={24} />
           </DraggableWrapper>
        </div>

      </div>
    </div>
  );
}
