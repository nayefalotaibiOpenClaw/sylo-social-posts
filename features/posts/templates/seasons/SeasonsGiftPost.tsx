import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Gift, Star } from 'lucide-react';

export default function SeasonsGiftPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      {/* Background with patterns */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.1]"
        style={{backgroundImage: `radial-gradient(${t.accent} 1px, transparent 1px)`, backgroundSize: '30px 30px'}} />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-gift" subtitle="GIFT SETS" badge={<><Gift size={12}/> PERFECT COMBO</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-seasons-gift" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}`}>
             <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10">
                <img src="/seasons/1.jpg" className="w-full h-full object-cover" alt="Gift Arrangement" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-seasons-1" 
            icon={<Star size={16} style={{ color: t.accentLime }} />} 
            label="التقييم" 
            value="4.9/5" 
            className="absolute -right-8 top-12" 
            rotate={5} 
          />
          
          <FloatingCard 
            id="stat-seasons-2" 
            icon={<Gift size={16} style={{ color: t.accent }} />} 
            label="توصيل سريع" 
            value="في نفس اليوم" 
            className="absolute -left-8 bottom-16" 
            rotate={-4} 
          />
        </div>

        <DraggableWrapper id="headline-seasons-gift" className="mt-8 text-center" dir="rtl">
          <h2 className="text-4xl font-black leading-tight text-white mb-2">
            <EditableText>هدايا تعبر عن مشاعرك</EditableText>
          </h2>
          <p className="text-lg font-bold opacity-80 text-white">
            <EditableText>باقات ورد وشوكولاتة فاخرة ومنسقة</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-gift" label="SEASONS GIFTS" text="سيزونز - شريككم في كل مناسبة" variant="dark" />
      </div>
    </div>
  );
}
