import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { Calendar, Sparkles } from 'lucide-react';

export default function SeasonsSubscriptionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      
      {/* Soft Background */}
      <div className="absolute inset-0 opacity-[0.4]"
        style={{ background: `linear-gradient(to bottom, ${t.primaryLight}, white)` }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.05] rounded-full blur-[100px]"
           style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-sub" subtitle="SUBSCRIPTIONS" badge={<><Calendar size={12}/> WEEKLY FRESH</>} variant="light" />

        <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-seasons-sub" className={`relative z-20 ${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}`}>
             <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-black/5">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Flower Subscription" />
             </div>
          </DraggableWrapper>
          
          <DraggableWrapper id="stat-seasons-sub" className="absolute -right-4 bottom-24 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 rotate-6" dir="rtl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                   <Sparkles className="text-green-600" size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">الاشتراك</p>
                   <p className="text-sm font-black text-gray-900">يبدأ من 15 د.ك</p>
                </div>
             </div>
          </DraggableWrapper>
        </div>

        <DraggableWrapper id="headline-seasons-sub" className="mt-8 text-right" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>جدد منزلك</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بالورد الطبيعي</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-70 mt-4" style={{ color: t.primary }}>
            <EditableText>اشتراكات أسبوعية تصلك طازجة إلى باب بيتك</EditableText>
          </p>
        </DraggableWrapper>

        <PostFooter id="seasons-sub" label="SEASONS SUBSCRIPTIONS" text="الجمال المستمر في حياتك" variant="light" />
      </div>
    </div>
  );
}
