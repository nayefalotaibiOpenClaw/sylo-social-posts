import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Users, Heart, Repeat, Star } from 'lucide-react';

export default function CustomerInsightsPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1.5px, transparent 1px)`, backgroundSize: '28px 28px'}} />

      {/* Glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] opacity-[0.08] blur-[100px] rounded-full"
           style={{ backgroundColor: t.accentGold }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] opacity-[0.06] blur-[80px] rounded-full"
           style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="customer-insights" subtitle="CUSTOMER AI" badge={<><Heart size={12}/> LOYALTY</>} variant="light" />

        <DraggableWrapper id="headline-customers" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>اعرف عملاءك</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>قبل ما يطلبون</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-60" style={{ color: t.primary }}>
            <EditableText>تحليلات ذكية تكشف أنماط الشراء وتزيد ولاء العملاء</EditableText>
          </p>
        </DraggableWrapper>

        {/* Visual area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-customers" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[220px] h-[340px]'}`}>
            <IPhoneMockup src="/2.jpg" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-retention"
            icon={<Repeat size={16} style={{ color: t.accentGold }}/>}
            label="Retention Rate"
            value="89%"
            className="absolute -right-6 top-[20%] z-30"
            rotate={-3}
            borderColor={t.accentGold}
          />

          <FloatingCard
            id="stat-satisfaction"
            icon={<Star size={16} style={{ color: t.accentLight }}/>}
            label="Satisfaction"
            value="4.8 / 5"
            className="absolute -left-8 bottom-[25%] z-30"
            rotate={4}
          />

          {/* Small floating icon bubble */}
          <DraggableWrapper id="bubble-customers" className="absolute -left-2 top-[15%] z-30">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-float"
                 style={{ backgroundColor: t.primary }}>
              <Users size={20} style={{ color: t.accentLime }} />
            </div>
          </DraggableWrapper>
        </div>

        <PostFooter id="customers" label="SYLO CUSTOMER INTELLIGENCE" text="حوّل بيانات عملاءك إلى قرارات ذكية" icon={<Heart size={24}/>} variant="light" />
      </div>
    </div>
  );
}
