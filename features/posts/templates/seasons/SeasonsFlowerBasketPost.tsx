import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Gift, Heart } from 'lucide-react';

export default function SeasonsFlowerBasketPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `linear-gradient(${t.primary} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-basket" subtitle="FLOWER BASKETS" badge={<><Gift size={12}/> CLASSIC</>} variant="light" />

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="img-basket" className={`relative z-20 ${isTall ? 'w-[450px] h-[450px]' : 'w-[350px] h-[350px]'}`}>
             <div className="relative w-full h-full rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white">
                <img src="/seasons/10.jpg" className="w-full h-full object-cover" alt="Flower Basket" />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent" />
             </div>
          </DraggableWrapper>
        </div>

        <DraggableWrapper id="text-basket" className="mt-8 text-center" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>سلة مليئة</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بالمشاعر الطيبة</EditableText></span>
          </h2>
        </DraggableWrapper>

        <PostFooter id="seasons-basket" label="SEASONS CLASSIC" text="تنسيقات تقليدية بلمسة سيزونز الخاصة" icon={<Heart size={24}/>} variant="light" />
      </div>
    </div>
  );
}
