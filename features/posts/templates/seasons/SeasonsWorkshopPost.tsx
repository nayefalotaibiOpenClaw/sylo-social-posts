import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Scissors, Palette, UserCheck } from 'lucide-react';

export default function SeasonsWorkshopPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      
      {/* Visual background split with texture */}
      <div className="absolute inset-0 grid grid-cols-2">
         <div className="bg-rose-50" />
         <div className="relative overflow-hidden">
            <img src="/seasons/2.jpg" className="w-full h-full object-cover" alt="Workshop" />
            <div className="absolute inset-0 bg-rose-900/10" />
         </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-work" subtitle="FLORAL WORKSHOPS" badge={<><Palette size={12}/> LEARN & CREATE</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center gap-8">
           <DraggableWrapper id="headline-work" className="text-right" dir="rtl">
              <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
                 <EditableText>تعلم فن</EditableText><br/>
                 <span style={{ color: t.accent }}><EditableText>تنسيق الورد</EditableText></span>
              </h2>
              <p className="text-xl font-bold opacity-60 mt-4" style={{ color: t.primary }}>
                 <EditableText>انضم لورش عمل سيزونز الإبداعية</EditableText>
              </p>
           </DraggableWrapper>

           <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Scissors size={18} />, text: 'تنسيق يدوي' },
                { icon: <UserCheck size={18} />, text: 'خبراء مختصين' },
              ].map((item, i) => (
                <DraggableWrapper key={i} id={`work-item-${i}`} className="bg-white p-4 rounded-2xl shadow-xl border border-rose-50 flex items-center gap-3" dir="rtl">
                   <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      {item.icon}
                   </div>
                   <span className="text-xs font-black text-gray-900 uppercase tracking-tight"><EditableText>{item.text}</EditableText></span>
                </DraggableWrapper>
              ))}
           </div>
        </div>

        <PostFooter id="seasons-work" label="SEASONS ACADEMY" text="طور مهاراتك الفنية مع خبرائنا" variant="light" />
      </div>
    </div>
  );
}
