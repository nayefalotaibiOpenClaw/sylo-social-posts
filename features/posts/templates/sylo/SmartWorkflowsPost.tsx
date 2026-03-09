import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { ListChecks, Clock, Zap, Star } from 'lucide-react';

export default function SmartWorkflowsPost() {
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
      
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.05]"
           style={{ background: `linear-gradient(135deg, ${t.accentLime} 0%, transparent 50%)` }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="workflows" subtitle="SMART WORKFLOWS" badge={<><Zap size={12}/> AUTOMATED</>} variant="light" />

        <DraggableWrapper id="headline-workflows" className={`mt-8 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>سير عمل..</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>أذكى وأسرع</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-60 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primary }}>
            <EditableText>نظم مهام فريقك، تتبع الإنجاز، وقلل الأخطاء التشغيلية بنظام واحد</EditableText>
          </p>
        </DraggableWrapper>

        {/* Visual area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-workflows" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[440px] h-[330px]' : 'w-[340px] h-[240px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <IPadMockup src="/pos-screen.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-workflow-1" 
            icon={<ListChecks size={16} style={{ color: t.accentLime }}/>} 
            label="Daily Tasks" 
            value="100% Done" 
            className={`absolute -right-2 top-1/4 z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`} 
            borderColor={t.accentLime}
            animation={isEditMode ? "none" : "float"}
          />

          <FloatingCard 
            id="stat-workflow-2" 
            icon={<Clock size={16} style={{ color: t.accentGold }}/>} 
            label="Avg. Service" 
            value="-15% Time" 
            className={`absolute -left-4 bottom-1/4 z-30 ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`} 
            rotate={-4}
            animation={isEditMode ? "none" : "float-slow"}
          />

          {/* Animated element */}
          <div className={`absolute top-1/2 left-1/4 opacity-20 ${isEditMode ? '' : 'animate-spin-slow'}`}>
            <Star size={80} style={{ color: t.accentLime }} fill="currentColor" />
          </div>
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="workflows" label="SYLO WORKFLOWS" text="كفاءة تشغيلية تصل إلى أقصى حدودها" variant="light" />
        </div>
      </div>
    </div>
  );
}
