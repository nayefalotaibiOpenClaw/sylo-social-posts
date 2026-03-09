import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Smartphone, MousePointer2, CheckCircle2 } from 'lucide-react';

export default function SeasonsAppExperiencePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background decoration with soft pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `linear-gradient(${t.primary} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '20px 20px'}} />
      
      <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full"
        style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-app" subtitle="SHOPPING EXPERIENCE" badge={<><Smartphone size={12}/> MOBILE FIRST</>} variant="light" />

        <div className="flex-1 flex gap-8 items-center justify-center relative mt-4">
           <DraggableWrapper id="mockup-app" className={`relative z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[220px] h-[350px]'}`}>
              <IPhoneMockup src="/seasons/1.jpg" />
           </DraggableWrapper>
           
           <div className="hidden md:flex flex-col gap-4">
              {[
                { icon: <MousePointer2 size={16} />, text: 'سهولة الطلب' },
                { icon: <CheckCircle2 size={16} />, text: 'دفع آمن' },
                { icon: <Smartphone size={16} />, text: 'تتبع مباشر' },
              ].map((item, i) => (
                <DraggableWrapper key={i} id={`app-feature-${i}`} className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3" dir="rtl">
                   <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                      {item.icon}
                   </div>
                   <span className="text-sm font-black text-gray-900"><EditableText>{item.text}</EditableText></span>
                </DraggableWrapper>
              ))}
           </div>
        </div>

        <DraggableWrapper id="headline-app" className="mt-8 text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>تطبيق سيزونز</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بين يديك</EditableText></span>
          </h2>
        </DraggableWrapper>

        <PostFooter id="seasons-app" label="SEASONS APP" text="حمل التطبيق واستمتع بتجربة تسوق فريدة" variant="light" />
      </div>
    </div>
  );
}
