import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Smile, Sparkles } from 'lucide-react';

export default function SeasonsThankYouPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      {/* Visual split layout background */}
      <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-2">
         <div className="relative overflow-hidden">
            <img src="/seasons/1.jpg" className="w-full h-full object-cover" alt="Thank You Gift" />
            <div className="absolute inset-0 bg-black/20" />
         </div>
         <div className="bg-rose-950" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-ty" subtitle="APPRECIATION" badge={<><Smile size={12}/> THANK YOU</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center items-end text-right">
          <DraggableWrapper id="headline-ty" className="max-w-xs" dir="rtl">
            <h2 className="text-6xl font-black leading-none mb-6">
              <EditableText>شكراً</EditableText><br/>
              <span className="text-4xl opacity-80"><EditableText>لكل من</EditableText></span><br/>
              <span style={{ color: t.accentLime }}><EditableText>نُحب</EditableText></span>
            </h2>
            <p className="text-xl font-bold opacity-60">
              <EditableText>باقات تعبر عن امتنانك بأرقى طريقة</EditableText>
            </p>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-ty" 
            icon={<Sparkles size={16} />} 
            label="هدية" 
            value="تقدير" 
            className="mt-12 mr-8" 
            rotate={-3} 
          />
        </div>

        <PostFooter id="seasons-ty" label="SEASONS GRATITUDE" text="الكلمات لا تكفي، الورد يقول الكثير" variant="dark" />
      </div>
    </div>
  );
}
