import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { CreditCard, Gift, Sparkles } from 'lucide-react';

export default function SeasonsGiftCardPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      {/* Background decoration with geometric patterns */}
      <div className="absolute inset-0 opacity-[0.1]"
        style={{backgroundImage: `linear-gradient(45deg, ${t.primaryDark} 25%, transparent 25%, transparent 75%, ${t.primaryDark} 75%, ${t.primaryDark}), linear-gradient(45deg, ${t.primaryDark} 25%, transparent 25%, transparent 75%, ${t.primaryDark} 75%, ${t.primaryDark})`, backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px'}} />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-card" subtitle="E-GIFT CARDS" badge={<><CreditCard size={12}/> INSTANT</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <DraggableWrapper id="gift-card-visual" className={`relative z-20 ${isTall ? 'w-[400px] h-[250px]' : 'w-[320px] h-[200px]'} bg-gradient-to-br from-rose-500 to-rose-900 rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col justify-between overflow-hidden rotate-[-5deg]`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
             <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                   <Gift size={24} className="text-white" />
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Seasons Card</p>
                   <p className="text-xl font-black">بطاقة هدايا</p>
                </div>
             </div>
             <div className="flex justify-between items-end">
                <div className="text-left font-mono text-lg tracking-widest opacity-80">**** **** **** 2024</div>
                <div className="text-3xl font-black">50 <span className="text-sm">KD</span></div>
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-gift-1" 
            icon={<Sparkles size={16} />} 
            label="هدية" 
            value="مرنة" 
            className="absolute -right-4 bottom-12" 
            rotate={8} 
          />
        </div>

        <DraggableWrapper id="headline-card" className="mt-12 text-center" dir="rtl">
          <h2 className="text-4xl font-black leading-tight mb-2">
            <EditableText>الحل الأمثل للحيرة</EditableText>
          </h2>
          <p className="text-lg font-bold opacity-70">
            <EditableText>أرسل بطاقة هدايا سيزونز واترك لهم حرية الاختيار</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-card" label="SEASONS E-GIFT" text="هدية فورية تصلهم برسالة" variant="dark" />
      </div>
    </div>
  );
}
