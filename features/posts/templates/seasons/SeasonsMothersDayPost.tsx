import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Heart, Sparkles, Gift, CheckCircle } from 'lucide-react';

export type MothersDayVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function SeasonsMothersDayPost({ variant = 1 }: { variant: MothersDayVariant }) {
  const t = useTheme();

  const renderContent = () => {
    switch (variant) {
      case 1: // Hero Tribute
        return (
          <div className="relative w-full h-full">
            <img src="/seasons/1.jpg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            <div className="relative z-10 h-full flex flex-col p-8 text-white justify-between">
              <PostHeader id="md-1" subtitle="MOTHER'S DAY" badge={<Heart size={12} fill="white"/>} variant="dark" />
              <DraggableWrapper id="md-1-text" className="text-right" dir="rtl">
                <h2 className="text-5xl font-black mb-4">ست الحبايب</h2>
                <p className="text-xl opacity-90 font-bold">لأنها تستحق الأجمل.. باقات مختارة بعناية</p>
              </DraggableWrapper>
              <PostFooter id="md-1-f" label="SEASONS" variant="dark" />
            </div>
          </div>
        );
      case 2: // Checklist
        return (
          <div className="relative w-full h-full bg-white p-8 flex flex-col">
            <PostHeader id="md-2" subtitle="DAILY GUIDE" variant="light" />
            <div className="flex-1 flex flex-col justify-center gap-4">
              <h2 className="text-3xl font-black text-center mb-6" style={{ color: t.primary }}>كيف تسعدها اليوم؟</h2>
              {[ "اطلب باقتها المفضلة", "اكتب لها رسالة حب", "فاجئها بزيارة غير متوقعة" ].map((text, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border-2" style={{ borderColor: t.primaryLight }}>
                   <CheckCircle className="shrink-0" style={{ color: t.accent }} />
                   <span className="text-lg font-bold" dir="rtl"><EditableText>{text}</EditableText></span>
                </div>
              ))}
            </div>
            <PostFooter id="md-2-f" label="TRYSEASONS.CO" variant="light" />
          </div>
        );
      case 3: // Minimalist Calligraphy Style
        return (
          <div className="relative w-full h-full flex items-center justify-center p-12" style={{ backgroundColor: t.primaryLight }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, currentcolor 1px, transparent 1px)', backgroundSize: '24px 24px', color: t.primary }} />
            <div className="relative z-10 text-center">
              <h1 className="text-8xl font-black opacity-10 absolute -top-20 left-1/2 -translate-x-1/2 w-full whitespace-nowrap">MOTHER</h1>
              <DraggableWrapper id="md-3-text">
                 <h2 className="text-7xl font-black mb-4" style={{ color: t.primary }}>أمي</h2>
                 <p className="text-xl font-bold tracking-[0.2em]" style={{ color: t.accent }}>جنة الدنيا</p>
              </DraggableWrapper>
            </div>
            <PostFooter id="md-3-f" className="absolute bottom-8" label="SEASONS" variant="light" />
          </div>
        );
      case 4: // Product Bundle
        return (
          <div className="relative w-full h-full bg-white p-8 flex flex-col">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <div className="rounded-3xl overflow-hidden shadow-xl"><img src="/seasons/2.jpg" className="w-full h-full object-cover" /></div>
              <div className="flex flex-col justify-center text-right" dir="rtl">
                <span className="text-sm font-black uppercase tracking-widest" style={{ color: t.accent }}>عرض خاص</span>
                <h2 className="text-3xl font-black my-2" style={{ color: t.primary }}>باقة الامتنان</h2>
                <p className="text-sm font-bold opacity-60">ورد جوري + تغليف فاخر + بطاقة إهداء</p>
                <div className="mt-4 text-2xl font-black" style={{ color: t.primary }}>249 ر.س</div>
              </div>
            </div>
            <PostFooter id="md-4-f" label="SEASONS" variant="light" />
          </div>
        );
      case 5: // Soft Collage
        return (
          <div className="relative w-full h-full p-6 flex flex-col gap-4 bg-gray-50">
            <div className="grid grid-cols-3 gap-4 h-2/3">
              <img src="/seasons/1.jpg" className="rounded-2xl h-full object-cover shadow-md" />
              <img src="/seasons/2.jpg" className="rounded-2xl h-full object-cover shadow-md mt-8" />
              <img src="/seasons/3.jpg" className="rounded-2xl h-full object-cover shadow-md" />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center">
               <h2 className="text-3xl font-black italic" style={{ color: t.primary }}>Celebrating Her</h2>
               <p className="font-bold opacity-50">Because she gave us everything</p>
            </div>
          </div>
        );
      case 6: // Floating Glass Card
        return (
          <div className="relative w-full h-full">
            <img src="/seasons/3.jpg" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div className="w-full h-full backdrop-blur-md bg-white/20 rounded-[3rem] border border-white/30 flex flex-col p-8 items-center justify-center text-center text-white shadow-2xl">
                 <Sparkles size={40} className="mb-4 text-yellow-300" />
                 <h2 className="text-4xl font-black mb-4">يوم أم سعيد</h2>
                 <p className="text-lg font-bold">باقاتنا تترجم مشاعرك</p>
              </div>
            </div>
          </div>
        );
      case 7: // Quote Style
        return (
          <div className="relative w-full h-full bg-white p-12 border-[20px]" style={{ borderColor: t.primaryLight }}>
            <div className="h-full border-2 border-dashed flex flex-col items-center justify-center text-center p-8" style={{ borderColor: t.accent }}>
               <Heart size={48} className="mb-6" style={{ color: t.accent }} />
               <h2 className="text-2xl font-bold italic leading-relaxed" style={{ color: t.primary }}>
                 "ليس في العالم وسادة أنعم من حضن الأم"
               </h2>
               <div className="w-10 h-1 mt-6" style={{ backgroundColor: t.accent }} />
            </div>
          </div>
        );
      case 8: // Promo / Offer
        return (
          <div className="relative w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: t.primary }}>
            <div className="h-1/2 relative">
               <img src="/seasons/2.jpg" className="w-full h-full object-cover opacity-80" />
               <div className="absolute top-4 left-4 bg-white text-rose-900 px-4 py-2 rounded-full font-black text-xs">MOTHERS DAY SPECIAL</div>
            </div>
            <div className="flex-1 p-8 text-white text-right" dir="rtl">
               <h2 className="text-4xl font-black mb-2">خصم 20%</h2>
               <p className="text-xl font-bold opacity-80">على جميع باقات عيد الأم</p>
               <div className="mt-6 inline-flex items-center gap-2 bg-white text-rose-900 px-6 py-3 rounded-xl font-black">
                  كود: MOM20 <Gift size={18} />
               </div>
            </div>
          </div>
        );
      case 9: // Modern Minimal Image
        return (
          <div className="relative w-full h-full p-12 bg-white flex flex-col items-center">
             <div className="w-full aspect-[4/5] rounded-t-full overflow-hidden mb-8 shadow-2xl">
                <img src="/seasons/1.jpg" className="w-full h-full object-cover" />
             </div>
             <h2 className="text-3xl font-black tracking-tighter" style={{ color: t.primary }}>BLOOM FOR HER</h2>
             <p className="text-sm font-bold opacity-50 uppercase tracking-[0.3em] mt-2">The Seasons Selection</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-3xl overflow-hidden mx-auto"
         style={{ fontFamily: t.font }}>
      {renderContent()}
    </div>
  );
}
