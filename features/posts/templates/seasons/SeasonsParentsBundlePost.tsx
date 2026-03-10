import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Heart, Star, ShoppingBag, Gift, Users, Trophy } from 'lucide-react';

export type ParentsVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function SeasonsParentsBundlePost({ variant = 1 }: { variant: ParentsVariant }) {
  const t = useTheme();

  const renderContent = () => {
    switch (variant) {
      case 1: // The "Duality" Split - Diagonal
        return (
          <div className="relative w-full h-full overflow-hidden bg-white">
            <div className="absolute inset-0 flex">
              <div className="w-1/2 h-full relative overflow-hidden">
                 <img src="/seasons/1.jpg" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-rose-500/20" />
              </div>
              <div className="w-1/2 h-full relative overflow-hidden">
                 <img src="/seasons/2.jpg" className="w-full h-full object-cover scale-x-[-1]" />
                 <div className="absolute inset-0 bg-blue-900/20" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[120%] h-32 bg-white -rotate-12 flex items-center justify-center shadow-2xl border-y-4 border-rose-100">
                  <h2 className="text-4xl font-black text-rose-950 uppercase tracking-tighter">
                    <EditableText>FOR BOTH OF THEM</EditableText>
                  </h2>
               </div>
            </div>
            <PostFooter id="p-1" label="PARENT BUNDLES" variant="light" />
          </div>
        );
      case 2: // The "King & Queen" Elegant Card
        return (
          <div className="relative w-full h-full bg-[#1a1a1a] p-10 flex flex-col items-center justify-center text-center text-white">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-amber-200 to-blue-400" />
            <div className="flex gap-8 mb-8">
               <div className="flex flex-col items-center">
                  <Trophy size={48} className="text-amber-200 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">To the King</span>
               </div>
               <div className="flex flex-col items-center">
                  <Heart size={48} className="text-rose-400 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-50">To the Queen</span>
               </div>
            </div>
            <DraggableWrapper id="p-2-text">
               <h2 className="text-4xl font-black mb-4 leading-tight">
                 <EditableText>لأنهما سر السعادة</EditableText>
              </h2>
              <p className="text-xl font-bold text-amber-100/60">هدية مشتركة تليق بمقامهما</p>
            </DraggableWrapper>
            <div className="mt-10 px-8 py-3 rounded-full border-2 border-white/20 font-black hover:bg-white hover:text-black transition-all">
               EXPLORE THE DUO
            </div>
          </div>
        );
      case 3: // Minimalist Equation
        return (
          <div className="relative w-full h-full bg-rose-50 flex flex-col items-center justify-center p-12">
             <div className="flex items-center gap-6 text-6xl font-black text-rose-900">
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl"><img src="/seasons/1.jpg" className="w-full h-full object-cover" /></div>
                <span>+</span>
                <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl"><img src="/seasons/2.jpg" className="w-full h-full object-cover" /></div>
             </div>
             <div className="mt-12 text-center">
                <h2 className="text-5xl font-black text-rose-950 mb-2 underline decoration-rose-300 decoration-8 underline-offset-8">
                   <EditableText>فرحة مضاعفة</EditableText>
                </h2>
                <p className="text-lg font-bold opacity-60 mt-6"><EditableText>باقة الأم + تنسيق الأب في طلب واحد</EditableText></p>
             </div>
          </div>
        );
      case 4: // Checklist "Don't Forget Him"
        return (
          <div className="relative w-full h-full bg-white p-10 flex flex-col">
            <PostHeader id="p-4" subtitle="GIFTING REMINDER" badge={<Users size={12}/>} variant="light" />
            <div className="flex-1 flex flex-col justify-center space-y-6">
               <DraggableWrapper id="p-4-check-1" className="flex items-center gap-6 p-6 rounded-3xl bg-rose-50 border-2 border-rose-100">
                  <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white font-black">1</div>
                  <div className="text-right flex-1" dir="rtl">
                     <h3 className="text-xl font-black text-rose-900">أجمل باقة ورد للأم</h3>
                     <p className="text-xs font-bold opacity-50 tracking-widest uppercase">For Her</p>
                  </div>
               </DraggableWrapper>
               <DraggableWrapper id="p-4-check-2" className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border-2 border-slate-100">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-black">2</div>
                  <div className="text-right flex-1" dir="rtl">
                     <h3 className="text-xl font-black text-slate-900 underline decoration-amber-400 decoration-4">ولا تنسى هدية الأب</h3>
                     <p className="text-xs font-bold opacity-50 tracking-widest uppercase">Don't Forget Him</p>
                  </div>
               </DraggableWrapper>
            </div>
            <div className="mt-4 bg-amber-400 p-4 rounded-2xl text-center font-black text-amber-950 shadow-lg">
               خصم خاص عند طلب الباقة المزدوجة
            </div>
          </div>
        );
      case 5: // The "Scale" of Gratitude
        return (
          <div className="relative w-full h-full bg-stone-100 p-12 flex flex-col items-center">
             <div className="flex-1 w-full relative flex items-center justify-center">
                <div className="absolute w-full h-1 bg-rose-900 rounded-full" />
                <div className="flex justify-between w-full px-4 relative z-10">
                   <div className="w-32 h-40 bg-white rounded-2xl shadow-xl -mt-10 border-t-8 border-rose-400 p-2">
                      <img src="/seasons/1.jpg" className="w-full h-full object-cover rounded-lg" />
                   </div>
                   <div className="w-32 h-40 bg-white rounded-2xl shadow-xl -mt-2 border-t-8 border-blue-400 p-2">
                      <img src="/seasons/3.jpg" className="w-full h-full object-cover rounded-lg" />
                   </div>
                </div>
             </div>
             <div className="text-center mt-12">
                <h2 className="text-3xl font-black" style={{ color: t.primary }}>
                   <EditableText>برُّهما.. سعادةٌ لا تنتهي</EditableText>
                </h2>
                <p className="font-bold opacity-60 mt-2">اهديهما معاً بلمسة واحدة</p>
             </div>
          </div>
        );
      case 6: // Visual Grid - Contrast
        return (
          <div className="relative w-full h-full grid grid-cols-2">
            <div className="relative group overflow-hidden">
               <img src="/seasons/2.jpg" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
               <div className="absolute inset-0 bg-rose-900/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-black">لها</h3>
               </div>
            </div>
            <div className="relative group overflow-hidden">
               <img src="/seasons/3.jpg" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
               <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-black">له</h3>
               </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 bg-white rounded-full shadow-2xl flex items-center justify-center font-black text-rose-900 italic tracking-tighter">
               THE PERFECT PAIR
            </div>
          </div>
        );
      case 7: // Soft Calligraphy / Roots & Wings
        return (
          <div className="relative w-full h-full bg-[#fdfaf6] p-12 flex flex-col items-center text-center">
             <div className="w-24 h-24 rounded-full border-4 border-rose-200 mb-6 flex items-center justify-center">
                <Users size={40} className="text-rose-300" />
             </div>
             <DraggableWrapper id="p-7-text">
                <h2 className="text-4xl font-black text-rose-950 mb-6 leading-tight">
                   <EditableText>أبي.. أمي..<br/>أنتما حياة الحياة</EditableText>
                </h2>
                <div className="flex gap-4 justify-center items-center">
                   <div className="w-12 h-0.5 bg-rose-200" />
                   <span className="text-sm font-bold opacity-40 uppercase tracking-[0.4em]">One Love</span>
                   <div className="w-12 h-0.5 bg-rose-200" />
                </div>
             </DraggableWrapper>
             <div className="mt-auto grid grid-cols-2 gap-4 w-full">
                <div className="h-24 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black border border-rose-50">FOR MOM</div>
                <div className="h-24 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black border border-rose-50">FOR DAD</div>
             </div>
          </div>
        );
      case 8: // Instagram Mockup Style
        return (
          <div className="relative w-full h-full bg-slate-900 flex items-center justify-center p-8">
            <div className="relative w-full h-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
               <div className="h-2/3 relative">
                  <img src="/seasons/1.jpg" className="w-full h-full object-cover" />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-2xl flex justify-between items-center shadow-lg">
                     <div>
                        <h4 className="font-black text-rose-950">Parent Bundle #01</h4>
                        <p className="text-[10px] font-bold opacity-50 uppercase">Best Seller</p>
                     </div>
                     <Star fill="#fbbf24" className="text-amber-400" />
                  </div>
               </div>
               <div className="flex-1 p-6 flex flex-col justify-center text-right" dir="rtl">
                  <h2 className="text-2xl font-black text-rose-950 mb-1">اجعلهما يشعران بالفخر</h2>
                  <p className="text-sm font-bold opacity-60 italic">ورد للأم + هدية فاخرة للأب</p>
                  <div className="mt-4 flex items-center gap-2 text-rose-600 font-black">
                     <ShoppingBag size={16} /> اطلب الباقة الآن
                  </div>
               </div>
            </div>
          </div>
        );
      case 9: // Luxury Black & Gold Duo
        return (
          <div className="relative w-full h-full bg-black p-1">
             <div className="h-full w-full border border-amber-400/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-1 w-24 bg-amber-400 mb-8" />
                <h3 className="text-amber-400 text-sm font-black uppercase tracking-[0.6em] mb-4">The Royal Pair</h3>
                <h2 className="text-5xl font-black text-white mb-2 leading-tight">
                   <EditableText>للملك والملكة</EditableText>
                </h2>
                <p className="text-lg text-amber-100/50 mb-10 font-bold italic">Because one gift isn't enough for those who gave you everything.</p>
                <div className="flex gap-4">
                   <div className="px-6 py-2 border border-amber-400/50 text-amber-400 text-xs font-black rounded-lg">SHOP HER</div>
                   <div className="px-6 py-2 border border-amber-400/50 text-amber-400 text-xs font-black rounded-lg">SHOP HIM</div>
                </div>
             </div>
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
