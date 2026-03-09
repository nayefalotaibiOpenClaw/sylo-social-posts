import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { CheckCircle, Calendar, RefreshCw } from 'lucide-react';

export default function SeasonsSubscriptionBenefitPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background decoration with soft colors */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.1] rounded-full blur-[100px]"
           style={{ backgroundColor: t.accent }} />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-sub-ben" subtitle="WHY SUBSCRIBE?" badge={<><RefreshCw size={12}/> ESSENTIAL</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center gap-6 mt-8">
           <DraggableWrapper id="headline-sub-ben" className="text-right" dir="rtl">
              <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
                 <EditableText>لماذا تشترك في</EditableText><br/>
                 <span style={{ color: t.accent }}><EditableText>خدمة الورد الدورية؟</EditableText></span>
              </h2>
           </DraggableWrapper>

           <div className="space-y-4">
              {[
                { icon: <Calendar size={20} />, text: 'ورد طازج كل أسبوع' },
                { icon: <RefreshCw size={20} />, text: 'تغيير مستمر في التصاميم' },
                { icon: <CheckCircle size={20} />, text: 'توفير يصل إلى 25%' },
              ].map((benefit, i) => (
                <DraggableWrapper key={i} id={`sub-benefit-${i}`} className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between" dir="rtl">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                         {benefit.icon}
                      </div>
                      <span className="text-lg font-black text-gray-900"><EditableText>{benefit.text}</EditableText></span>
                   </div>
                   <CheckCircle className="text-green-500" size={24} />
                </DraggableWrapper>
              ))}
           </div>
        </div>

        <PostFooter id="seasons-sub-ben" label="SEASONS CLUB" text="انضم الآن واجعل حياتك أجمل" variant="light" />
      </div>
    </div>
  );
}
