import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { UtensilsCrossed, Star, TrendingUp } from 'lucide-react';

export default function SmartMenuPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary} 60%, ${t.accent}22)` }} />
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: `radial-gradient(${t.accentLime} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="smart-menu" subtitle="MENU ENGINE" badge={<><UtensilsCrossed size={12} /> SMART</>} variant="dark" />

        <DraggableWrapper id="headline-smartmenu" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>منيو ذكي</EditableText><br />
            <span style={{ color: t.accentLime }}><EditableText>يبيع لك أكثر</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-60" style={{ color: t.primaryLight }}>
            <EditableText>ترتيب تلقائي للأصناف حسب الربحية والطلب</EditableText>
          </p>
        </DraggableWrapper>

        {/* Angled mockup — perspective tilt */}
        <div className="flex-1 flex items-end justify-center relative mt-4">
          <div className="absolute bottom-8 w-52 h-4 bg-black/30 blur-xl rounded-full" />
          <DraggableWrapper
            id="mockup-smartmenu" variant="mockup"
            className={`relative z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[220px] h-[380px]'}`}
          >
            <IPhoneMockup src="/4.jpg" alt="Smart Menu" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-smartmenu-top"
            icon={<Star size={16} style={{ color: t.accentGold }} />}
            label="Top Item"
            value="برجر دبل"
            className="absolute right-2 top-[15%] z-30"
            rotate={-3}
            borderColor={t.accentGold}
          />
          <FloatingCard
            id="stat-smartmenu-margin"
            icon={<TrendingUp size={16} style={{ color: t.accentLime }} />}
            label="Avg Margin"
            value="72%"
            className="absolute left-2 top-[35%] z-30"
            rotate={4}
          />
        </div>

        <PostFooter id="smart-menu" label="SYLO MENU AI" text="خلّ المنيو يشتغل لك" icon={<UtensilsCrossed size={24} />} variant="dark" />
      </div>
    </div>
  );
}
