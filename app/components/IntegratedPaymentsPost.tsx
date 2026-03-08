import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio, useEditMode } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { CreditCard, Zap, ShieldCheck } from 'lucide-react';

export default function IntegratedPaymentsPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Background with Theme Gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primaryDark}, ${t.primary})` }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px'}} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="payments" subtitle="INTEGRATED PAYMENTS" badge={<><Zap size={12}/> INSTANT</>} variant="dark" />

        <DraggableWrapper id="headline-pay" className={`mt-8 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>مدفوعاتك..</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>بلمحة بصر</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-70 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primaryLight }}>
            <EditableText>ربط مباشر مع أجهزة الدفع لعمليات أسرع بدون أخطاء بشرية</EditableText>
          </p>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-pay" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <IPhoneMockup src="/1.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-pay-speed" 
            icon={<Zap size={16} style={{ color: t.accentLime }}/>} 
            label="Payment Speed" 
            value="< 2 Sec" 
            className={`absolute -right-6 top-1/3 z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`} 
            borderColor={t.accentLime}
            animation={isEditMode ? "none" : "float"}
          />

          <FloatingCard 
            id="stat-pay-secure" 
            icon={<ShieldCheck size={16} style={{ color: t.accentGold }}/>} 
            label="Security" 
            value="Encrypted" 
            className={`absolute -left-10 top-1/4 z-30 ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`} 
            rotate={4}
            animation={isEditMode ? "none" : "float-slow"}
          />

          <div className={`absolute -bottom-4 right-1/4 z-30 opacity-40 ${isEditMode ? '' : 'animate-pulse-slow'}`}>
            <CreditCard size={120} style={{ color: t.accentLime }} />
          </div>
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="payments" label="SYLO PAYMENTS" text="سرعة في الإنجاز، دقة في الحسابات" variant="dark" />
        </div>
      </div>
    </div>
  );
}
