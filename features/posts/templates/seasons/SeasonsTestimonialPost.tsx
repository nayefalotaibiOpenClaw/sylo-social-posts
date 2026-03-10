import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Star, MessageCircle } from 'lucide-react';

export default function SeasonsTestimonialPost() {
  const ratio = useAspectRatio();
  const t = useTheme();

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-30 blur-[100px]" 
           style={{ background: `radial-gradient(circle, ${t.accent} 0%, transparent 70%)` }} />

      <div className="relative z-10 w-full h-full flex flex-col p-10 text-white">
        <PostHeader id="seasons-testi" subtitle="HAPPY CUSTOMERS" badge={<><MessageCircle size={12}/> REVIEWS</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
           <div className="flex gap-1 text-yellow-400">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} fill="currentColor" />)}
           </div>

           <DraggableWrapper id="testi-content" className="max-w-md">
              <p className="text-2xl font-bold italic leading-relaxed">
                 <EditableText>"دائماً ما تكون زهور سيزونز هي الخيار الأول لي في جميع المناسبات. الجودة والتوصيل في الموعد هما ما يميزهم."</EditableText>
              </p>
              <div className="mt-8">
                 <h4 className="text-xl font-black" style={{ color: t.accentLime }}><EditableText>سارة العتيبي</EditableText></h4>
                 <p className="text-sm opacity-60 uppercase tracking-widest mt-1"><EditableText>عميلة مخلصة</EditableText></p>
              </div>
           </DraggableWrapper>
        </div>

        <PostFooter id="seasons-testi" label="SEASONS FLOWERS" text="ثقتكم هي سر تميزنا" variant="dark" />
      </div>
    </div>
  );
}
