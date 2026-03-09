import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Heart, Sparkles } from 'lucide-react';

export default function SeasonsHeroPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background Image */}
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Seasons Flowers" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-hero" subtitle="PREMIUM FLOWERS" badge={<><Sparkles size={12}/> LUXURY</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-end mb-12">
          <DraggableWrapper id="headline-seasons-hero" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>أجمل اللحظات</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>تبدأ بوردة</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-90">
              <EditableText>تشكيلات راقية لكل مناسباتكم السعيدة</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-hero" label="SEASONS FLOWERS" text="نحتفل معكم بكل لحظة" icon={<Heart size={24} fill="currentColor"/>} variant="dark" />
      </div>
    </div>
  );
}
