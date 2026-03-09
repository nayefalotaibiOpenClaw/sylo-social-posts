import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, PostHeader, PostFooter } from '@/app/components/shared';
import { CheckCircle2, ShieldCheck, ClipboardCheck } from 'lucide-react';

export default function QualityControlPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1.5px, transparent 1px)`, backgroundSize: '30px 30px'}} />
      
      <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] opacity-[0.08] blur-[80px] rounded-full"
           style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="quality-control" subtitle="DIGITAL OPS" badge={<><ShieldCheck size={12}/> COMPLIANT</>} variant="light" />

        <DraggableWrapper id="headline-quality" className={`mt-6 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>جودة لا تساوم</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>عليها</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-60 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primary }}>
            <EditableText>قوائم تدقيق رقمية تضمن أعلى معايير الخدمة والنظافة يومياً</EditableText>
          </p>
        </DraggableWrapper>

        {/* Visual area */}
        <div className="flex-1 flex items-center gap-6 relative mt-4">
          <DraggableWrapper id="mockup-quality" variant="mockup" className={`relative shrink-0 z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[220px] h-[320px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <IPadMockup src="/pos-screen.jpg" />
          </DraggableWrapper>

          <div className="flex flex-col gap-4 flex-1" dir="rtl">
            {[
              { id: 'qc-1', icon: <CheckCircle2 size={18}/>, text: 'نظافة الصالة', delay: 'animate-stagger-2' },
              { id: 'qc-2', icon: <ClipboardCheck size={18}/>, text: 'تحضير المواد', delay: 'animate-stagger-3' },
              { id: 'qc-3', icon: <ShieldCheck size={18}/>, text: 'درجات الحرارة', delay: 'animate-stagger-4' }
            ].map((item) => (
              <DraggableWrapper key={item.id} id={item.id} className={`bg-white p-4 rounded-2xl shadow-sm border flex items-center gap-3 transform hover:scale-105 transition-all ${isEditMode ? '' : `animate-slide-left ${item.delay}`}`} style={{ borderColor: t.primary + '1a' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.primaryLight, color: t.accent }}>
                  {item.icon}
                </div>
                <EditableText className="font-black text-sm" style={{ color: t.primary }}>{item.text}</EditableText>
              </DraggableWrapper>
            ))}
          </div>
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="quality" label="SYLO OPERATIONS" text="تحكم رقمي كامل بجودة فروعك" variant="light" />
        </div>
      </div>
    </div>
  );
}
