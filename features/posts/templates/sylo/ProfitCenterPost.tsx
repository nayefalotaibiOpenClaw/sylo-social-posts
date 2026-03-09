import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { BarChart2, TrendingUp, DollarSign } from 'lucide-react';

export default function ProfitCenterPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primaryDark}, ${t.primary})` }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px'}} />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.1] blur-[120px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="profit-center" subtitle="BUSINESS INSIGHTS" badge={<><TrendingUp size={12}/> PERFORMANCE</>} variant="dark" />

        <DraggableWrapper id="headline-profit" className={`mt-8 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>حول بياناتك..</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>إلى أرباح</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-70 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primaryLight }}>
            <EditableText>تقارير تحليلية دقيقة تساعدك على اتخاذ قرارات ذكية لنمو مشروعك</EditableText>
          </p>
        </DraggableWrapper>

        {/* Visual area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-profit" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[480px] h-[340px]' : 'w-[380px] h-[260px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <DesktopMockup src="/1.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-revenue" 
            icon={<DollarSign size={16} style={{ color: t.accentLime }}/>} 
            label="Net Profit" 
            value="+28.4%" 
            className={`absolute -right-4 top-1/4 z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`} 
            borderColor={t.accentLime}
            animation={isEditMode ? "none" : "float"}
          />

          <FloatingCard 
            id="stat-orders" 
            icon={<BarChart2 size={16} style={{ color: t.accentGold }}/>} 
            label="Monthly Sales" 
            value="16,420 KD" 
            className={`absolute -left-6 bottom-1/4 z-30 ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`} 
            rotate={-2}
            animation={isEditMode ? "none" : "float-slow"}
          />
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="profit" label="SYLO ANALYTICS" text="رؤية شاملة لأداء مطعمك المالي" variant="dark" />
        </div>
      </div>
    </div>
  );
}
