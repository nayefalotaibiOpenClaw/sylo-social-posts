import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Layers, Sparkles } from 'lucide-react';

export default function SeasonsMultiBrandPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      {/* Visual background with split-like items */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-[0.4]">
         <img src="/seasons/1.jpg" className="w-full h-full object-cover border-[0.5px] border-white/10" alt="" />
         <img src="/seasons/2.jpg" className="w-full h-full object-cover border-[0.5px] border-white/10" alt="" />
         <img src="/seasons/3.jpg" className="w-full h-full object-cover border-[0.5px] border-white/10" alt="" />
         <img src="/seasons/2.jpg" className="w-full h-full object-cover border-[0.5px] border-white/10" alt="" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.9))' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-multi" subtitle="MARKETPLACE" badge={<><Layers size={12}/> MULTI-BRAND</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <DraggableWrapper id="headline-multi" className="max-w-md">
            <h2 className="text-5xl font-black leading-tight mb-4">
              <EditableText>وجهة واحدة</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>لعالم من الجمال</EditableText></span>
            </h2>
            <div className="flex justify-center gap-2 mt-8 opacity-60 flex-wrap">
               {['BLOMMA', 'LE FLEURE', 'MOMENTS', 'PETALS'].map((brand, i) => (
                  <div key={i} className="px-4 py-2 border border-white/30 rounded-full text-xs font-black tracking-widest">{brand}</div>
               ))}
            </div>
          </DraggableWrapper>
        </div>

        <PostFooter id="seasons-multi" label="SEASONS MARKETPLACE" text="براندات عالمية ومحلية في مكان واحد" icon={<Sparkles size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
