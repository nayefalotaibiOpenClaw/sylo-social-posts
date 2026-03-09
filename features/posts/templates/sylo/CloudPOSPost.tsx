import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Cloud, Zap, Globe } from 'lucide-react';

export default function CloudPOSPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `radial-gradient(${t.primaryLight} 1px, transparent 1px)`, backgroundSize: '30px 30px'}} />
      
      {/* Blur circles */}
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />
      <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="cloud-pos" subtitle="CLOUD TECHNOLOGY" badge={<><Cloud size={12}/> LIVE SYNC</>} variant="dark" />

        <DraggableWrapper id="headline-cloud-pos" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>نظامك السحابي</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>في كل مكان</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-cloud-pos" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
            <IPhoneMockup src="/pos-screen.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-cloud-1" 
            icon={<Zap size={16} style={{ color: t.accentLime }} />} 
            label="السرعة" 
            value="100%" 
            className="absolute -left-4 top-20" 
            rotate={-5} 
          />
          
          <FloatingCard 
            id="stat-cloud-2" 
            icon={<Globe size={16} style={{ color: t.accent }} />} 
            label="وصول عالمي" 
            value="24/7" 
            className="absolute -right-8 bottom-32" 
            rotate={8} 
          />
        </div>

        <PostFooter id="cloud-pos" label="SYLO POS" text="أدر مطعمك من أي مكان في العالم" variant="dark" />
      </div>
    </div>
  );
}
