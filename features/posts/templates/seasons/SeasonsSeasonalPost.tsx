import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Calendar, Leaf } from 'lucide-react';

export default function SeasonsSeasonalPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      <img src="/seasons/8.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Seasonal Flowers" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-seasonal" subtitle="SEASONAL PICKS" badge={<><Leaf size={12}/> FRESH CUT</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-end items-center text-center pb-8">
          <DraggableWrapper id="headline-seasonal" className="z-30">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>ألوان الموسم</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>بكل نضارتها</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-80">
              <EditableText>اكتشف مجموعتنا الجديدة لهذا الموسم</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-seasonal" label="SEASONS COLLECTION" text="نقطف لكم الجمال في وقته" icon={<Calendar size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
