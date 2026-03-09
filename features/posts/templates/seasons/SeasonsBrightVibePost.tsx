import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Sparkles, Sun } from 'lucide-react';

export default function SeasonsBrightVibePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.accentLime, fontFamily: t.font }}>
      
      <img src="/seasons/11.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Bright Vibe" />
      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 to-transparent" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-bright" subtitle="BRIGHT VIBES" badge={<><Sun size={12}/> CHEERFUL</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-end">
          <DraggableWrapper id="headline-bright" className="text-right" dir="rtl">
            <h2 className="text-6xl font-black leading-tight">
              <EditableText>يومك</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>أجمل بوردنا</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-90">
              <EditableText>طاقة إيجابية وألوان تفتح النفس</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-bright" label="SEASONS BRIGHT" text="انشر البهجة مع سيزونز" icon={<Sparkles size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
