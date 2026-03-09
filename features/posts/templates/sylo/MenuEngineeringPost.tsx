import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function MenuEngineeringPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{backgroundImage: `radial-gradient(${t.primary} 2px, transparent 2px)`, backgroundSize: '20px 20px'}} />
      
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="menu-eng" subtitle="RESTAURANT ANALYTICS" badge={<><TrendingUp size={12}/> PROFIT MAX</>} variant="light" />

        <DraggableWrapper id="headline-menu-eng" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>هندسة المنيو</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>لأرباح أعلى</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-menu-eng" className={`relative z-20 ${isTall ? 'w-full h-[350px]' : 'w-[360px] h-[240px]'}`}>
            <DesktopMockup src="/pos-screen.jpg" url="admin.sylo.com/analytics" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-menu-1" 
            icon={<BarChart3 size={16} />} 
            label="نمو الأرباح" 
            value="+22%" 
            className="absolute -right-4 top-4" 
            rotate={5} 
          />
          
          <FloatingCard 
            id="stat-menu-2" 
            icon={<PieChart size={16} />} 
            label="الأكثر مبيعًا" 
            value="برجر دبل" 
            className="absolute -left-4 bottom-12" 
            rotate={-5} 
          />
        </div>

        <PostFooter id="menu-eng" label="SYLO ANALYTICS" text="حلل أداء أصنافك وارفع هوامش ربحك بذكاء" variant="light" />
      </div>
    </div>
  );
}
