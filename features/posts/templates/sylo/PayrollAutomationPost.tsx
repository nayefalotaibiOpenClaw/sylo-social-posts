import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { DollarSign, Clock, Users } from 'lucide-react';

export default function PayrollAutomationPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `linear-gradient(${t.primary} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px'}} />
      
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.05] rounded-full blur-[100px]"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="payroll" subtitle="HR & PAYROLL" badge={<><DollarSign size={12}/> AUTOMATED</>} variant="light" />

        <DraggableWrapper id="headline-payroll" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>رواتب فريقك</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بلمسة واحدة</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-payroll" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
            <IPhoneMockup src="/4.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-payroll-1" 
            icon={<Clock size={16} />} 
            label="توفير الوقت" 
            value="85%" 
            className="absolute -right-8 top-16" 
            rotate={3} 
          />
          
          <FloatingCard 
            id="stat-payroll-2" 
            icon={<Users size={16} />} 
            label="موظف" 
            value="50+" 
            className="absolute -left-8 bottom-24" 
            rotate={-2} 
          />
        </div>

        <PostFooter id="payroll" label="SYLO HR" text="أتمتة الرواتب والحضور والانصراف بدقة" variant="light" />
      </div>
    </div>
  );
}
