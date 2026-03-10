import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Heart, Flame, Sparkles, Calendar } from 'lucide-react';

export type ValentinesVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export default function SeasonsValentinesPost({ variant = 1 }: { variant: ValentinesVariant }) {
  const t = useTheme();

  const renderContent = () => {
    switch (variant) {
      case 1: // Romantic Dark Hero
        return (
          <div className="relative w-full h-full bg-black">
            <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-red-950/90 via-transparent to-red-950/40" />
            <div className="relative z-10 h-full flex flex-col p-10 items-center justify-center text-center">
              <Heart size={60} fill="#ef4444" className="mb-6 animate-pulse" />
              <h2 className="text-5xl font-black text-white mb-4">حب بلا حدود</h2>
              <p className="text-xl text-red-200 font-bold">عبّر عن مشاعرك بأرقى الزهور</p>
            </div>
            <PostFooter id="v-1-f" label="VALENTINE SELECTION" variant="dark" />
          </div>
        );
      case 2: // Countdown
        return (
          <div className="relative w-full h-full bg-red-50 p-8 flex flex-col items-center justify-center">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-200 rounded-full blur-3xl opacity-50" />
            <Calendar size={48} className="text-red-600 mb-4" />
            <h2 className="text-3xl font-black text-red-900 mb-8">اقترب يوم الحب</h2>
            <div className="flex gap-4">
              {[ "03", "12", "45" ].map((v, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl font-black text-red-600 border border-red-100">{v}</div>
                  <span className="text-[10px] font-bold text-red-900/40 uppercase mt-2">{i === 0 ? 'Days' : i === 1 ? 'Hrs' : 'Min'}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 font-bold text-red-900/60 italic">لا تدع الوقت يداهمك.. اطلب الآن</p>
          </div>
        );
      case 3: // Modern Split
        return (
          <div className="relative w-full h-full flex flex-row">
            <div className="w-1/2 h-full bg-red-600 flex flex-col p-8 justify-between text-white">
               <h2 className="text-4xl font-black leading-tight">Love is<br/>in the<br/>air.</h2>
               <div className="w-12 h-1 bg-white" />
               <p className="text-sm font-bold opacity-80 uppercase tracking-widest">Seasons Flowers</p>
            </div>
            <div className="w-1/2 h-full overflow-hidden">
               <img src="/seasons/1.jpg" className="w-full h-full object-cover" />
            </div>
          </div>
        );
      case 4: // Heart Ornament Engine
        return (
          <div className="relative w-full h-full flex items-center justify-center bg-white">
            <div className="absolute inset-0 overflow-hidden">
               {[...Array(20)].map((_, i) => (
                 <Heart key={i} size={Math.random() * 40 + 10} 
                        className="absolute opacity-5 text-red-600 animate-bounce"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
               ))}
            </div>
            <div className="relative z-10 w-64 h-64 rounded-full border-[10px] border-red-50 overflow-hidden shadow-2xl">
               <img src="/seasons/3.jpg" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-12 text-center">
               <h2 className="text-3xl font-black text-red-900">أحبك.. بالورد</h2>
            </div>
          </div>
        );
      case 5: // Poetry Post
        return (
          <div className="relative w-full h-full bg-stone-900 p-12 text-white flex flex-col items-center justify-center text-center">
            <Sparkles className="text-red-500 mb-8" size={32} />
            <div className="space-y-6 max-w-sm">
               <p className="text-2xl font-medium italic leading-relaxed" dir="rtl">
                 "وما الوردُ إلا جسرٌ بين قلبينِ،<br/>
                 يقولُ ما لا تستطيعُ اللغاتُ قولَهُ."
               </p>
               <div className="w-8 h-0.5 bg-red-500 mx-auto" />
               <p className="text-sm uppercase tracking-widest opacity-50">فالنتين 2024</p>
            </div>
          </div>
        );
      case 6: // Comparison "For Him / For Her"
        return (
          <div className="relative w-full h-full flex flex-col">
            <div className="h-1/2 relative bg-red-50 flex flex-row items-center p-6 gap-6">
               <img src="/seasons/1.jpg" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" />
               <div className="text-left">
                  <h3 className="text-xl font-black text-red-900">لها</h3>
                  <p className="text-sm opacity-60">باقة من الجوري الوردي الناعم</p>
               </div>
               <div className="ml-auto font-black text-red-600">199 ر.س</div>
            </div>
            <div className="h-1/2 relative bg-red-950 flex flex-row items-center p-6 gap-6 text-white">
               <img src="/seasons/2.jpg" className="w-24 h-24 rounded-full object-cover border-4 border-red-900 shadow-lg" />
               <div className="text-left">
                  <h3 className="text-xl font-black">له</h3>
                  <p className="text-sm opacity-60">بوكس فاخر مع شوكولاتة</p>
               </div>
               <div className="ml-auto font-black text-red-400">299 ر.س</div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-xl z-20">
               <Heart fill="#ef4444" className="text-red-600" />
            </div>
          </div>
        );
      case 7: // Passion Quote
        return (
          <div className="relative w-full h-full flex items-center justify-center p-12" style={{ backgroundColor: '#450a0a' }}>
             <Flame className="absolute top-12 left-12 text-red-600 opacity-20" size={120} />
             <div className="relative z-10 text-center text-white">
                <h2 className="text-6xl font-black mb-4 tracking-tighter">RED HOT</h2>
                <div className="h-1 w-full bg-red-600 mb-4" />
                <p className="text-xl font-bold italic text-red-200">The Ultimate Valentine's Gift</p>
             </div>
          </div>
        );
      case 8: // Instagram Grid Style
        return (
          <div className="relative w-full h-full grid grid-cols-2 grid-rows-2 gap-2 p-2 bg-white">
             <img src="/seasons/1.jpg" className="w-full h-full object-cover rounded-xl" />
             <div className="bg-red-50 rounded-xl flex items-center justify-center p-4 text-center">
                <p className="text-red-900 font-black text-xl leading-tight">لحظات<br/>لا تُنسى</p>
             </div>
             <div className="bg-red-600 rounded-xl flex items-center justify-center">
                <Heart fill="white" className="text-white" size={40} />
             </div>
             <img src="/seasons/3.jpg" className="w-full h-full object-cover rounded-xl" />
          </div>
        );
      case 9: // Elegant Card
        return (
          <div className="relative w-full h-full bg-red-950 p-1 bg-[url('/seasons/3.jpg')] bg-cover">
             <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm" />
             <div className="relative h-full border border-red-400/30 rounded-2xl m-4 flex flex-col items-center justify-center text-center p-8">
                <h3 className="text-red-400 text-sm font-black uppercase tracking-[0.5em] mb-4">The Valentine Collection</h3>
                <h2 className="text-4xl font-black text-white mb-6">فخامة الحب</h2>
                <div className="inline-block border-2 border-red-400 px-8 py-3 text-red-400 font-bold uppercase hover:bg-red-400 hover:text-white transition-all cursor-pointer">
                   Shop the Collection
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
