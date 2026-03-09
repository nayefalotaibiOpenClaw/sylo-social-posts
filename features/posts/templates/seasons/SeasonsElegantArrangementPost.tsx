import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Heart, Sparkles } from 'lucide-react';

export default function SeasonsElegantArrangementPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      <img src="/seasons/7.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Elegant Arrangement" />
      <div className="absolute inset-0 bg-gradient-to-r from-rose-950/80 via-transparent to-transparent" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-elegant" subtitle="ELEGANT ARRANGEMENTS" badge={<><Heart size={12}/> ARTISTIC</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center max-w-[300px]">
          <DraggableWrapper id="headline-elegant" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>فن تنسيق</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>الورد</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-80">
              <EditableText>باقات تُصمم بكل شغف لتصل إلى قلوبكم</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-elegant" label="SEASONS ART" text="الجمال في كل تفصيل" variant="dark" />
      </div>
    </div>
  );
}
