import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Quote } from 'lucide-react';

export default function SeasonsQuotePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -mr-20 -mt-20" style={{ backgroundColor: t.accent }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 rounded-full blur-3xl -ml-20 -mb-20" style={{ backgroundColor: t.accent }} />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <Quote size={240} style={{ color: t.primary }} />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col p-10">
        <PostHeader id="seasons-quote" subtitle="WORDS OF BLOOM" badge={<>INSPIRATION</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <DraggableWrapper id="quote-text-seasons" className="space-y-6">
            <h2 className="text-3xl font-light italic leading-relaxed" style={{ color: t.primary }}>
              "<EditableText>الأزهار هي لغة الطبيعة الصامتة التي تفهمها جميع القلوب</EditableText>"
            </h2>
            <div className="w-12 h-0.5 mx-auto" style={{ backgroundColor: t.accent }} />
            <p className="text-lg font-bold tracking-widest uppercase opacity-70" style={{ color: t.primary }}>
              <EditableText>سيزونز فلورز</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-quote" label="SEASONS" text="عبر عن مشاعرك بوردة" variant="light" />
      </div>
    </div>
  );
}
