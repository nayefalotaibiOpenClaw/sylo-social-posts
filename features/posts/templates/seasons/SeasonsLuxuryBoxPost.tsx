import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Star, Sparkles } from 'lucide-react';

export default function SeasonsLuxuryBoxPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      <img src="/seasons/6.jpg" className="absolute inset-0 w-full h-full object-cover opacity-70" alt="Luxury Box" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-luxury" subtitle="LUXURY BOXES" badge={<><Star size={12}/> PREMIUM</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <DraggableWrapper id="headline-luxury" className="z-30">
            <h2 className="text-6xl font-black leading-tight">
              <EditableText>الفخامة في</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>كل تفصيل</EditableText></span>
            </h2>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-luxury" label="SEASONS LUXURY" text="صناديق ورد فاخرة لهداياكم المميزة" icon={<Sparkles size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
