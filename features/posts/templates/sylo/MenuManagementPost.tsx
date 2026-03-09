import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { BookOpen, Layers, Sparkles } from 'lucide-react';

export default function MenuManagementPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1.5px, transparent 1px)`, backgroundSize: '28px 28px'}} />
      <div className="absolute top-[-15%] right-[-15%] w-[400px] h-[400px] opacity-[0.08] blur-[100px] rounded-full"
           style={{ backgroundColor: t.accent }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] opacity-[0.06] blur-[80px] rounded-full"
           style={{ backgroundColor: t.accentOrange }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="menu-mgmt" subtitle="MENU ENGINE" badge={<><BookOpen size={12}/> DIGITAL</>} variant="light" />

        <DraggableWrapper id="headline-menu-mgmt" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>قائمتك..</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>بين يديك</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-60" style={{ color: t.primary }}>
            <EditableText>عدّل أصنافك وأسعارك لحظياً من أي مكان</EditableText>
          </p>
        </DraggableWrapper>

        {/* iPad Mockup - Portrait */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-menu-mgmt" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[240px] h-[340px]' : 'w-[200px] h-[280px]'}`}>
            <IPadMockup src="/pos-screen.jpg" orientation="portrait" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-menu-items"
            icon={<Layers size={16} style={{ color: t.accent }}/>}
            label="Menu Items"
            value="120+"
            className="absolute -right-6 top-[20%] z-30"
            rotate={-2}
          />

          <FloatingCard
            id="stat-menu-ai"
            icon={<Sparkles size={16} style={{ color: t.accentOrange }}/>}
            label="AI Suggestions"
            value="Smart Pricing"
            className="absolute -left-8 bottom-[25%] z-30"
            rotate={3}
            borderColor={t.accentOrange}
          />
        </div>

        <PostFooter id="menu-mgmt" label="SYLO MENU ENGINE" text="تحكم كامل بقائمتك الرقمية" icon={<BookOpen size={24}/>} variant="light" />
      </div>
    </div>
  );
}
