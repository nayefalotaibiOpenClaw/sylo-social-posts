import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Palette, Scissors, Sparkles } from 'lucide-react';

export default function SeasonsCustomTrayPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '25px 25px'}} />
      
      {/* Visual content area */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-custom" subtitle="CUSTOM DESIGNS" badge={<><Palette size={12}/> BESPOKE</>} variant="light" />

        <div className="flex-1 flex gap-4 mt-8 items-stretch h-full">
           <DraggableWrapper id="img-custom-1" className="flex-1 rounded-3xl overflow-hidden shadow-xl border-4 border-white rotate-[-2deg]">
              <img src="/seasons/1.jpg" className="w-full h-full object-cover" alt="Custom Tray 1" />
           </DraggableWrapper>
           <DraggableWrapper id="img-custom-2" className="flex-1 rounded-3xl overflow-hidden shadow-xl border-4 border-white rotate-[2deg] mt-12">
              <img src="/seasons/2.jpg" className="w-full h-full object-cover" alt="Custom Tray 2" />
           </DraggableWrapper>
        </div>

        <div className="relative z-30 bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/50 -mt-16 mx-4">
           <DraggableWrapper id="text-custom" className="text-right" dir="rtl">
              <h2 className="text-3xl font-black mb-2" style={{ color: t.primary }}>
                 <EditableText>صمم هديتك</EditableText> <span style={{ color: t.accent }}><EditableText>بلمستك</EditableText></span>
              </h2>
              <div className="flex gap-4 items-center justify-end mt-4">
                 <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-800">
                    <Scissors size={14} /> <EditableText>تطريز خاص</EditableText>
                 </div>
                 <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-rose-800">
                    <Sparkles size={14} /> <EditableText>صواني ورد</EditableText>
                 </div>
              </div>
           </DraggableWrapper>
        </div>

        <PostFooter id="seasons-custom" label="SEASONS CUSTOM" text="خدمات تصميم هدايا ومبالغ مالية متكاملة" variant="light" />
      </div>
    </div>
  );
}
