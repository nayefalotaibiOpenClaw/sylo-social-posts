import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Percent, Gift } from 'lucide-react';

export default function SeasonsOfferPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.accent, fontFamily: t.font }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.primary})` }} />
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.15]"
        style={{backgroundImage: `radial-gradient(white 1px, transparent 1px)`, backgroundSize: '30px 30px'}} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-offer" subtitle="SPECIAL OFFERS" badge={<><Percent size={12}/> SAVE NOW</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
           <DraggableWrapper id="offer-badge" className="absolute -top-4 -right-4 w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center text-rose-900 shadow-2xl rotate-12 z-30">
              <span className="text-xs font-black uppercase tracking-tighter">خصم</span>
              <span className="text-4xl font-black leading-none">20%</span>
           </DraggableWrapper>

           <DraggableWrapper id="img-offer" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}`}>
              <div className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/20">
                 <img src="/seasons/1.jpg" className="w-full h-full object-cover" alt="Special Offer" />
              </div>
           </DraggableWrapper>
        </div>

        <DraggableWrapper id="text-offer" className="mt-8 text-center" dir="rtl">
          <h2 className="text-5xl font-black leading-tight mb-2">
            <EditableText>عروض لا تفوت</EditableText>
          </h2>
          <p className="text-xl font-bold opacity-80">
            <EditableText>باقات مختارة بأسعار استثنائية</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-offer" label="SEASONS DEALS" text="استمتع بجمال الورد بأفضل الأسعار" icon={<Gift size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
