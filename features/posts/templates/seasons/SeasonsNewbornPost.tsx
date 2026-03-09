import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Baby, Heart } from 'lucide-react';

export default function SeasonsNewbornPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#FFF5F7', fontFamily: t.font }}>
      
      {/* Soft background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.2] rounded-full blur-[120px]"
           style={{ backgroundColor: t.accentLight }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-newborn" subtitle="NEWBORN COLLECTION" badge={<><Baby size={12}/> WELCOME BABY</>} variant="light" />

        <div className="flex-1 flex items-center justify-center relative">
          <DraggableWrapper id="img-newborn" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[300px] h-[300px]'}`}>
             <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-xl border-4 border-white rotate-3">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Newborn Flowers" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-newborn" 
            icon={<Heart size={16} />} 
            label="باقة" 
            value="مواليد" 
            className="absolute -left-4 top-20" 
            rotate={-12} 
          />
        </div>

        <DraggableWrapper id="text-newborn" className="text-right mt-6" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>أهلاً بمولودكم</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>الجديد</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-60 mt-2" style={{ color: t.primary }}>
            <EditableText>هدايا وتنسيقات ورد تليق بفرحتكم</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-newborn" label="SEASONS NEWBORN" text="شاركهم الفرحة مع سيزونز" variant="light" />
      </div>
    </div>
  );
}
