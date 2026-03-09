import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, DesktopMockup, PostHeader, PostFooter } from '@/app/components/shared';
import { ArrowLeftRight, Smartphone } from 'lucide-react';

export default function DualScreenPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: `radial-gradient(${t.primary} 1.2px, transparent 1px)`, backgroundSize: '26px 26px' }} />
      {/* Glow blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.08] blur-[100px]" style={{ backgroundColor: t.accent }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.06] blur-[80px]" style={{ backgroundColor: t.accentGold }} />

      {/* Background decoration lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
           style={{ backgroundImage: `linear-gradient(${t.primary} 1px, transparent 1px), linear-gradient(90deg, ${t.primary} 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="dual-screen" subtitle="MULTI VIEW" badge={<><ArrowLeftRight size={12} /> SYNC</>} variant="light" />

        <DraggableWrapper id="headline-dual" className={`mt-6 text-center z-30 ${isEditMode ? '' : 'animate-reveal'}`}>
          <h2 className="text-4xl sm:text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>شاشتين،</EditableText><br />
            <span style={{ color: t.accent }}><EditableText>نظام واحد</EditableText></span>
          </h2>
          <p className={`text-base font-bold mt-2 opacity-60 max-w-xs mx-auto ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primary }}>
            <EditableText>تابع الكاشير والمطبخ بنفس الوقت</EditableText>
          </p>
        </DraggableWrapper>

        {/* iPad and Desktop side by side */}
        <div className="flex-1 flex flex-col items-center justify-center relative mt-4 gap-4">
          {/* Ground shadow */}
          <div className="absolute bottom-12 w-72 h-5 bg-black/15 blur-xl rounded-full" />

          {/* Desktop Mockup (Back) */}
          <DraggableWrapper id="mockup-dual-desktop" variant="mockup" className={`relative z-10 transition-all duration-500 ${isTall ? 'w-[420px] h-[280px]' : 'w-[320px] h-[220px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <DesktopMockup src="/1.jpg" alt="Admin Dashboard" />
          </DraggableWrapper>

          {/* iPad Mockup (Front) */}
          <DraggableWrapper id="mockup-dual-ipad" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[360px] h-[260px]' : 'w-[280px] h-[200px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-3'} -mt-20 transform translate-x-12 translate-y-4`}>
            <IPadMockup src="/pos-screen.jpg" alt="POS Tablet" />
          </DraggableWrapper>
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="dual-screen" label="SYLO CONNECTED" text="كل شي متصل، كل شي واضح" icon={<Smartphone size={24} />} variant="light" />
        </div>
      </div>
    </div>
  );
}
