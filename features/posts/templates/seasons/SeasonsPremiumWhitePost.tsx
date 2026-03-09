import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Star, Heart } from 'lucide-react';

export default function SeasonsPremiumWhitePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      
      <img src="/seasons/9.jpg" className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Premium Arrangement" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/80" />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-white" subtitle="PREMIUM SELECTION" badge={<><Star size={12}/> ELITE</>} variant="light" />

        <div className="flex-1 flex flex-col justify-end">
          <DraggableWrapper id="headline-white" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
              <EditableText>باقة تليق</EditableText><br/>
              <span style={{ color: t.accent }}><EditableText>بمناسباتكم الكبرى</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-70" style={{ color: t.primary }}>
              <EditableText>أرقى أنواع الورد العالمي بتنسيق استثنائي</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-white" label="SEASONS PREMIUM" text="اختيار النخبة لكل الأوقات" icon={<Heart size={24}/>} variant="light" />
      </div>
    </div>
  );
}
