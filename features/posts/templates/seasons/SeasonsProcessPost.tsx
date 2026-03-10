import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Truck, Flower2, ShoppingBag } from 'lucide-react';

export default function SeasonsProcessPost() {
  const ratio = useAspectRatio();
  const t = useTheme();

  const steps = [
    { icon: <ShoppingBag size={24} />, title: "اختر هديتك", desc: "تشكيلات متنوعة تناسب ذوقك" },
    { icon: <Flower2 size={24} />, title: "نجهزها بكل حب", desc: "تنسيق يدوي بأجود أنواع الورد" },
    { icon: <Truck size={24} />, title: "تصل لبابك", desc: "توصيل سريع في الوقت المحدد" }
  ];

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: 'white', fontFamily: t.font }}>
      
      <div className="absolute top-0 left-0 w-full h-1/3 opacity-20" style={{ backgroundColor: t.primaryLight }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-process" subtitle="OUR PROCESS" badge={<>SIMPLE & EASY</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center gap-6 my-4">
           <DraggableWrapper id="process-title" className="text-center mb-4">
              <h2 className="text-3xl font-black" style={{ color: t.primary }}>
                 <EditableText>ببساطة.. كيف نصل إليك؟</EditableText>
              </h2>
           </DraggableWrapper>

           <div className="space-y-4">
              {steps.map((step, i) => (
                <DraggableWrapper key={i} id={`step-${i}`} className="flex items-center gap-6 p-4 rounded-2xl border-2 transition-all hover:scale-[1.02]" style={{ borderColor: t.primaryLight, backgroundColor: i === 1 ? t.primaryLight : 'transparent' }}>
                   <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: t.primary, color: 'white' }}>
                      {step.icon}
                   </div>
                   <div className="flex-1 text-right" dir="rtl">
                      <h3 className="text-xl font-bold" style={{ color: t.primary }}><EditableText>{step.title}</EditableText></h3>
                      <p className="text-sm opacity-70 font-medium"><EditableText>{step.desc}</EditableText></p>
                   </div>
                   <div className="text-2xl font-black opacity-10 italic" style={{ color: t.primary }}>0{i+1}</div>
                </DraggableWrapper>
              ))}
           </div>
        </div>

        <PostFooter id="seasons-process" label="TRYSEASONS.CO" text="سهولة في الطلب.. رقي في التنفيذ" variant="light" />
      </div>
    </div>
  );
}
