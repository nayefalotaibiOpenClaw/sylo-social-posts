import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter } from './shared';
import { ArrowLeftRight, Smartphone } from 'lucide-react';

export default function DualScreenPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  const phoneH = isTall ? 'h-[480px]' : 'h-[320px]';
  const phoneW = isTall ? 'w-[230px]' : 'w-[160px]';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{ backgroundImage: `radial-gradient(${t.primary} 1.2px, transparent 1px)`, backgroundSize: '26px 26px' }} />
      {/* Glow blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-[0.08] blur-[100px]" style={{ backgroundColor: t.accent }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full opacity-[0.06] blur-[80px]" style={{ backgroundColor: t.accentGold }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="dual-screen" subtitle="MULTI VIEW" badge={<><ArrowLeftRight size={12} /> SYNC</>} variant="light" />

        <DraggableWrapper id="headline-dual" className="mt-6 text-center z-30">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>شاشتين،</EditableText><br />
            <span style={{ color: t.accent }}><EditableText>نظام واحد</EditableText></span>
          </h2>
          <p className="text-base font-bold mt-2 opacity-60 max-w-xs mx-auto" style={{ color: t.primary }}>
            <EditableText>تابع الكاشير والمطبخ بنفس الوقت</EditableText>
          </p>
        </DraggableWrapper>

        {/* Two angled phones side by side */}
        <div className="flex-1 flex items-end justify-center gap-0 relative mt-2">
          {/* Ground shadow */}
          <div className="absolute bottom-4 w-72 h-5 bg-black/15 blur-xl rounded-full" />

          {/* Left phone */}
          <DraggableWrapper id="mockup-dual-left" className={`relative z-20 ${phoneW} ${phoneH} -mr-3`}>
            <IPhoneMockup src="/1.jpg" alt="POS Screen" />
          </DraggableWrapper>

          {/* Right phone */}
          <DraggableWrapper id="mockup-dual-right" className={`relative z-10 ${phoneW} ${phoneH} -ml-3`}>
            <IPhoneMockup src="/2.jpg" alt="Kitchen Screen" />
          </DraggableWrapper>
        </div>

        <PostFooter id="dual-screen" label="SYLO CONNECTED" text="كل شي متصل، كل شي واضح" icon={<Smartphone size={24} />} variant="light" />
      </div>
    </div>
  );
}
