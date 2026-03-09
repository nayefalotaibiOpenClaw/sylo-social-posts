import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { BarChart3, TrendingUp, Monitor } from 'lucide-react';

export default function DashboardOverviewPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary})` }} />
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}} />

      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] opacity-[0.08] blur-[120px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="dashboard-overview" subtitle="BUSINESS INTELLIGENCE" badge={<><BarChart3 size={12}/> LIVE</>} variant="dark" />

        <DraggableWrapper id="headline-dashboard" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>لوحة تحكم</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>ذكية</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-70" style={{ color: t.primaryLight }}>
            <EditableText>كل أرقام مشروعك في شاشة واحدة، لحظة بلحظة</EditableText>
          </p>
        </DraggableWrapper>

        {/* Desktop Mockup */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-dashboard" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-full h-[320px]' : 'w-[360px] h-[240px]'}`}>
            <DesktopMockup src="/1.jpg" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-dashboard-revenue"
            icon={<TrendingUp size={16} style={{ color: t.accentLime }}/>}
            label="Revenue"
            value="+18%"
            className="absolute -right-4 top-[10%] z-30"
            rotate={-3}
            borderColor={t.accentLime}
          />

          <FloatingCard
            id="stat-dashboard-live"
            icon={<Monitor size={16} style={{ color: t.accentGold }}/>}
            label="Live Data"
            value="Real-time"
            className="absolute -left-6 bottom-[15%] z-30"
            rotate={4}
            borderColor={t.accentGold}
          />
        </div>

        <PostFooter id="dashboard-overview" label="SYLO DASHBOARD" text="أرقامك الحقيقية، قراراتك الصحيحة" icon={<BarChart3 size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
