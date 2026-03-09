import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Sparkles, Heart } from 'lucide-react';

export default function SeasonsModernBouquetPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      <img src="/seasons/4.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Modern Bouquet" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-modern" subtitle="MODERN BOUQUETS" badge={<><Sparkles size={12}/> NEW STYLE</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-end">
          <DraggableWrapper id="headline-modern" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>باقة تفيض</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>بالعصرية والجمال</EditableText></span>
            </h2>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-modern" label="SEASONS MODERN" text="تصاميم تواكب ذوقكم الرفيع" icon={<Heart size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
