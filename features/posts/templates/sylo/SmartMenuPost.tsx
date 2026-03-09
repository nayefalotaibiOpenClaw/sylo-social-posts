import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { UtensilsCrossed, Star, TrendingUp } from 'lucide-react';

export default function SmartMenuPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary} 60%, ${t.accent}22)` }} />
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: `radial-gradient(${t.accentLime} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

      {/* Glow Effect */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.1] blur-[120px] rounded-full ${isEditMode ? '' : 'animate-pulse-slow'}`}
           style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="smart-menu" subtitle="MENU ENGINE" badge={<><UtensilsCrossed size={12} /> SMART</>} variant="dark" />

        <DraggableWrapper id="headline-smartmenu" className={`mt-6 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>منيو ذكي</EditableText><br />
            <span style={{ color: t.accentLime }}><EditableText>يبيع لك أكثر</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-60 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primaryLight }}>
            <EditableText>ترتيب تلقائي للأصناف حسب الربحية والطلب</EditableText>
          </p>
        </DraggableWrapper>

        {/* Angled mockup — perspective tilt */}
        <div className="flex-1 flex items-end justify-center relative mt-4">
          <div className="absolute bottom-8 w-52 h-4 bg-black/30 blur-xl rounded-full" />
          <DraggableWrapper
            id="mockup-smartmenu" variant="mockup" 
            className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[220px] h-[380px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}
          >
            <IPhoneMockup src="/4.jpg" alt="Smart Menu" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-smartmenu-top"
            icon={<Star size={16} style={{ color: t.accentGold }} />}
            label="Top Item"
            value="برجر دبل"
            className={`absolute right-2 top-[15%] z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`}
            rotate={-3}
            borderColor={t.accentGold}
            animation={isEditMode ? "none" : "float"}
          />
          <FloatingCard
            id="stat-smartmenu-margin"
            icon={<TrendingUp size={16} style={{ color: t.accentLime }} />}
            label="Avg Margin"
            value="72%"
            className={`absolute left-2 top-[35%] z-30 ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`}
            rotate={4}
            animation={isEditMode ? "none" : "float-slow"}
          />
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="smart-menu" label="SYLO MENU AI" text="خلّ المنيو يشتغل لك" icon={<UtensilsCrossed size={24} />} variant="dark" />
        </div>
      </div>
    </div>
  );
}
