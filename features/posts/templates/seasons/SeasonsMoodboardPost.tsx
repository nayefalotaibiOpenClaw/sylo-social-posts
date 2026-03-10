import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Palette } from 'lucide-react';

export default function SeasonsMoodboardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-mood" subtitle="SEASONAL PALETTE" badge={<><Palette size={12}/> MOODBOARD</>} variant="light" />

        <div className="flex-1 grid grid-cols-2 gap-3 my-6">
          <div className="rounded-2xl overflow-hidden shadow-sm relative group h-full">
            <img src="/seasons/1.jpg" className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Texture 1" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent" />
          </div>
          <div className="grid grid-rows-2 gap-3 h-full">
             <div className="rounded-2xl overflow-hidden shadow-sm relative group">
                <img src="/seasons/2.jpg" className="w-full h-full object-cover group-hover:scale-110 transition-all" alt="Texture 2" />
             </div>
             <div className="grid grid-cols-2 gap-3 h-full">
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: t.primary }} />
                <div className="rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: t.accent }} />
             </div>
          </div>
        </div>

        <div className="flex justify-between items-end">
           <DraggableWrapper id="mood-text" dir="rtl" className="text-right">
              <h2 className="text-3xl font-black leading-tight" style={{ color: t.primary }}>
                 <EditableText>ألوان منبثقة</EditableText><br/>
                 <span style={{ color: t.accent }}><EditableText>من قلب الطبيعة</EditableText></span>
              </h2>
           </DraggableWrapper>
           <PostFooter id="seasons-mood" label="SEASONS" variant="light" />
        </div>
      </div>
    </div>
  );
}
