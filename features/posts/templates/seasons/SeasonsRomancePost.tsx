import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Heart, Sparkles } from 'lucide-react';

export default function SeasonsRomancePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Romantic Flowers" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-romance" subtitle="ROMANTIC MOMENTS" badge={<><Heart size={12}/> ANNIVERSARY</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <DraggableWrapper id="headline-romance" className="z-30">
            <h2 className="text-6xl font-black leading-tight">
              <EditableText>للحظات لا</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>تُنسى</EditableText></span>
            </h2>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-romance" 
            icon={<Sparkles size={16} />} 
            label="باقة" 
            value="بريميوم" 
            className="mt-8" 
            rotate={-2} 
          />
        </div>

        <PostFooter id="seasons-romance" label="SEASONS MOMENTS" text="عبر عن مشاعرك بأرقى باقات الورد" variant="dark" />
      </div>
    </div>
  );
}
