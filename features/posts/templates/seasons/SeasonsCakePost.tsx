import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { UtensilsCrossed, Star } from 'lucide-react';

export default function SeasonsCakePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Visual background pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '35px 35px'}} />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-cake" subtitle="FLOWERS & CAKES" badge={<><UtensilsCrossed size={12}/> SWEET COMBO</>} variant="light" />

        <div className="flex-1 flex gap-4 mt-8 relative">
           <DraggableWrapper id="cake-img-1" className="flex-1 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white rotate-[-3deg] h-[80%]">
              <img src="/seasons/1.jpg" className="w-full h-full object-cover" alt="Cake + Flowers" />
           </DraggableWrapper>
           <DraggableWrapper id="cake-img-2" className="flex-1 rounded-[40px] overflow-hidden shadow-2xl border-4 border-white rotate-[4deg] mt-12 h-[80%]">
              <img src="/seasons/2.jpg" className="w-full h-full object-cover" alt="Sweets" />
           </DraggableWrapper>
           
           <FloatingCard 
            id="card-cake" 
            icon={<Star size={16} />} 
            label="مجموعة" 
            value="حفلات" 
            className="absolute left-1/2 -translate-x-1/2 bottom-12" 
            rotate={2} 
          />
        </div>

        <DraggableWrapper id="text-cake" className="mt-8 text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>كيك وورد</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بكل حب</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-70" style={{ color: t.primary }}>
            <EditableText>أفضل تشكيلة كيك طازج مع أرقى أنواع الورد</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-cake" label="SEASONS SWEETS" text="دلع ضيوفك بأفخم تنسيق" variant="light" />
      </div>
    </div>
  );
}
