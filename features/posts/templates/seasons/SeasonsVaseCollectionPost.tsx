import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Home, Sparkles } from 'lucide-react';

export default function SeasonsVaseCollectionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      
      <div className="absolute inset-0 bg-gray-50 opacity-50" />
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${t.primaryLight}, white)` }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-vase" subtitle="HOME COLLECTION" badge={<><Home size={12}/> VASES</>} variant="light" />

        <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
          <DraggableWrapper id="img-vase" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}`}>
             <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
                <img src="/seasons/5.jpg" className="w-full h-full object-cover" alt="Vase Collection" />
                <div className="absolute inset-0 bg-black/5" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-vase" 
            icon={<Sparkles size={16} />} 
            label="مجموعة" 
            value="المنزل" 
            className="absolute -right-4 top-12" 
            rotate={6} 
          />
        </div>

        <DraggableWrapper id="text-vase" className="mt-8 text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>لمسة جمال</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>لكل زاوية في منزلك</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-60 mt-2" style={{ color: t.primary }}>
            <EditableText>فازات ورد طبيعي بتصاميم عصرية</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-vase" label="SEASONS HOME" text="اجعل منزلك ينبض بالحياة" variant="light" />
      </div>
    </div>
  );
}
