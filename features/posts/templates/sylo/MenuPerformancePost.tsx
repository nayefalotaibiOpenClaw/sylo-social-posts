import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useEditMode, useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, FloatingCard } from '@/app/components/shared';
import { TrendingUp, PieChart } from 'lucide-react';

export default function MenuPerformancePost() {
  const isEditMode = useEditMode();
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background Decor */}
      <div className="absolute inset-0" style={{ backgroundColor: t.primaryLight }}></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" style={{ backgroundColor: t.accentLime }}></div>
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '30px 30px'}}>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">

        <PostHeader
          id="menu"
          subtitle="ANALYTICS"
          badge={<><TrendingUp size={12} className={isEditMode ? '' : 'animate-pulse'} /> MARGIN OPTIMIZER</>}
          variant="light"
        />

        {/* Headline */}
        <DraggableWrapper id="headline-menu" className="mt-12 text-right z-30" dir="rtl">
           <h2 className="text-6xl font-black leading-[0.95] tracking-tighter" style={{ color: t.primary }}>
              <EditableText>هندسة</EditableText> <br/>
              <span className="text-7xl" style={{ color: t.accent }}><EditableText>المنيو</EditableText></span> <br/>
              <EditableText>الذكية</EditableText>
           </h2>
           <p className="font-bold mt-4 text-xl max-w-sm ml-0 mr-auto leading-tight opacity-60" style={{ color: t.primary }}>
              <EditableText>اعرف أكثر الأصناف ربحية، وحلل هوامش الربح لكل منصة توصيل</EditableText>
           </p>
        </DraggableWrapper>

        {/* Visual Section - Mockup at the bottom */}
        <div className="flex-1 flex items-end justify-center relative">
           {/* Ground Shadow */}
           <div className="absolute bottom-16 w-48 h-4 bg-black/10 blur-xl rounded-full"></div>

           <div className={`relative z-20 group transform translate-y-24 transition-all duration-500 ${isTall ? 'w-[300px] h-[580px]' : 'w-[260px] h-[360px]'}`}>

              <DraggableWrapper id="mockup-menu" variant="mockup" className="relative h-full w-full z-20">
                 <IPhoneMockup src="/4.jpg" alt="Analytics" notch="notch" />
              </DraggableWrapper>

              {/* Floating Stat Card */}
              <FloatingCard
                id="stat-card-menu"
                icon={<PieChart size={20} style={{ color: t.accentLime }} />}
                label="Profit Margin"
                value="80.00%"
                className="absolute -right-8 top-12"
                rotate={-2}
                animation="animate-bounce-slow"
                borderColor={t.primaryLight}
              />
           </div>
        </div>

      </div>
    </div>
  );
}
