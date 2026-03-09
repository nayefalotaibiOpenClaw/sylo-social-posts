import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Sparkles, Smartphone } from 'lucide-react';

export default function MobileDashboardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background with Theme Gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }}></div>

      {/* Subtle Grid Pattern using Theme Light color */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">

        <PostHeader id="mobile" badge={<><Sparkles size={12} /> REAL-TIME DATA</>} variant="dark" />

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

           <DraggableWrapper id="mockup-mobile" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
              <IPhoneMockup src="/1.jpg" alt="Dashboard" />
           </DraggableWrapper>

           {/* Floating Stat Card */}
           <FloatingCard
             id="stat-card-mobile"
             icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>}
             label="Growth"
             value="+24%"
             className="absolute -right-8 top-16"
             rotate={3}
             animation="animate-bounce-slow"
           />
        </div>

        <PostFooter id="mobile" label="SYLO BUSINESS INTELLIGENCE" text="تابع مشروعك من أي مكان وفي أي وقت" icon={<Smartphone size={24} />} variant="dark" />

      </div>
    </div>
  );
}
