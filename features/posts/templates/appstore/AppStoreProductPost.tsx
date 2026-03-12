import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Zap, Award } from 'lucide-react';

export default function AppStoreProductPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Deep indigo gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(170deg, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge */}
        <DraggableWrapper id="header-product">
          <div className="flex items-center gap-2">
            <Award size={14} style={{ color: t.accentGold }} />
            <EditableText className="text-[10px] font-bold tracking-widest uppercase opacity-60">Award Winner 2025</EditableText>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-product" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.90] tracking-tight uppercase`} style={{ color: t.primaryLight }}>
            Device
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.90] tracking-tight uppercase`} style={{ color: t.primaryLight }}>
            Of The
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.90] tracking-tight uppercase`} style={{ color: t.accentGold }}>
            Year
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-40">
            Power meets precision in every detail
          </EditableText>
        </DraggableWrapper>

        {/* Dual device silhouettes — large, bleeds off bottom */}
        <DraggableWrapper id="devices-product" variant="mockup" className="mt-auto flex justify-center items-end gap-6 -mb-12">
          {/* Phone */}
          <div className={`${isTall ? 'w-[200px] h-[400px]' : 'w-[170px] h-[340px]'} rounded-[2.2rem] border-[4px] flex flex-col items-center justify-center relative`} style={{ borderColor: t.accent + '40', backgroundColor: t.accent + '08' }}>
            <div className="absolute inset-4 rounded-[1.6rem] overflow-hidden" style={{ backgroundColor: t.accent + '10' }}>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Zap size={isTall ? 48 : 36} style={{ color: t.accent }} />
                <span className="text-xs font-bold mt-3 opacity-40">Ultra Fast</span>
              </div>
            </div>
            {/* Notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full" style={{ backgroundColor: t.primaryDark }} />
          </div>

          {/* Tablet */}
          <div className={`${isTall ? 'w-[280px] h-[370px]' : 'w-[230px] h-[300px]'} rounded-[2rem] border-[4px] flex flex-col items-center justify-center relative`} style={{ borderColor: t.accent + '40', backgroundColor: t.accent + '08' }}>
            <div className="absolute inset-4 rounded-[1.2rem] overflow-hidden" style={{ backgroundColor: t.accent + '10' }}>
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center" style={{ borderColor: t.accentGold + '50' }}>
                  <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: t.accentGold + '30' }} />
                </div>
                <span className="text-xs font-bold mt-3 opacity-40">Pro Display</span>
              </div>
            </div>
          </div>
        </DraggableWrapper>

        {/* Minimal footer */}
        <DraggableWrapper id="footer-product" className="mt-4 flex items-center justify-center gap-6">
          {['5nm Chip', '120Hz', 'All Day Battery'].map((spec, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accentGold }} />
              <EditableText className="text-[10px] font-bold opacity-40">{spec}</EditableText>
            </div>
          ))}
        </DraggableWrapper>
      </div>
    </div>
  );
}
