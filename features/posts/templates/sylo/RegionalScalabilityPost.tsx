import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Globe, MapPin, TrendingUp } from 'lucide-react';

export default function RegionalScalabilityPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.primary} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px'}} />
      
      <div className="absolute top-1/4 right-0 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full translate-x-1/2"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="scaling" subtitle="MULTI-BRANCH" badge={<><Globe size={12}/> GCC READY</>} variant="light" />

        <DraggableWrapper id="headline-scaling" className={`mt-8 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>توسع بلا</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>حدود</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-60 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primary }}>
            <EditableText>أضف فروعك في دقائق، وادرها جميعاً من لوحة تحكم واحدة مركزية</EditableText>
          </p>
        </DraggableWrapper>

        {/* Visual area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <div className={`absolute inset-0 flex items-center justify-center opacity-5 ${isEditMode ? '' : 'animate-spin-slow'}`}>
            <Globe size={300} style={{ color: t.primary }} />
          </div>

          <DraggableWrapper id="mockup-scaling" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[210px] h-[320px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <IPhoneMockup src="/4.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-branches" 
            icon={<MapPin size={16} style={{ color: t.accent }}/>} 
            label="Active Branches" 
            value="+15 Locations" 
            className={`absolute -right-4 top-1/4 z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`} 
            rotate={-3}
            animation={isEditMode ? "none" : "float"}
          />

          <FloatingCard 
            id="stat-growth" 
            icon={<TrendingUp size={16} style={{ color: t.accentLime }}/>} 
            label="Scale Speed" 
            value="Quick Setup" 
            className={`absolute -left-6 bottom-1/3 z-30 shadow-xl ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`} 
            rotate={5}
            borderColor={t.accentLime}
            animation={isEditMode ? "none" : "float-slow"}
          />
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="scaling" label="SYLO GLOBAL" text="نظام ينمو معك من الفرع الأول حتى المائة" variant="light" />
        </div>
      </div>
    </div>
  );
}
