import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Coffee, Star } from 'lucide-react';

export default function SeasonsChocolatePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#2D1B1B', fontFamily: t.font }}>
      
      {/* Background decoration with warm overlay */}
      <img src="/seasons/1.jpg" className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Chocolate Pairings" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(45,27,27,0.8), rgba(45,27,27,1))' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-choc" subtitle="FLOWERS & CHOCOLATES" badge={<><Coffee size={12}/> LUXURY BITE</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center text-center relative">
          <DraggableWrapper id="img-choc" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}`}>
             <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/10">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Flower Gift" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2D1B1B]/60 to-transparent" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-choc" 
            icon={<Star size={16} style={{ color: t.accentGold }} />} 
            label="شوكولاتة" 
            value="فاخرة" 
            className="absolute -right-8 top-12" 
            rotate={6} 
          />
        </div>

        <DraggableWrapper id="text-choc" className="mt-8 text-center" dir="rtl">
          <h2 className="text-4xl font-black leading-tight mb-2">
            <EditableText>ثنائي السعادة</EditableText>
          </h2>
          <p className="text-lg font-bold opacity-80">
            <EditableText>تنسيقات ورد مع أفخم أنواع الشوكولاتة السويسرية والبلجيكية</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-choc" label="SEASONS LUXURY" text="هدية تكتمل بها الحواس" variant="dark" />
      </div>
    </div>
  );
}
