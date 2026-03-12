import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Wind, Heart, Sparkles } from 'lucide-react';

export default function AppStoreMeditationPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Gradient background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primaryDark}, ${t.primary}, ${t.accent})` }} />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full opacity-20 blur-[80px]" style={{ backgroundColor: t.accentLight }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge header */}
        <DraggableWrapper id="header-meditation">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Moon size={18} style={{ color: t.accentLight }} />
            </div>
            <div>
              <EditableText className="text-xs font-bold opacity-60">Mindful</EditableText>
              <EditableText className="text-[10px] font-bold opacity-40">Wellness App</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Big headline */}
        <DraggableWrapper id="headline-meditation" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: '#fff' }}>
            Regain
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: '#fff' }}>
            Inner
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.accentLight }}>
            Control
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-50">
            Guided meditation & breathing exercises
          </EditableText>
        </DraggableWrapper>

        {/* Phone mockup — large, bleeds off bottom */}
        <DraggableWrapper id="phone-meditation" variant="mockup" className="mt-auto flex justify-center -mb-16">
          <div className={`${isTall ? 'w-[380px]' : 'w-[320px]'} rounded-[2.5rem] border-[4px] border-white/20 overflow-hidden`} style={{ backgroundColor: t.primaryDark }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <span className="text-[10px] font-bold opacity-40">9:41</span>
              <div className="w-24 h-6 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <div className="flex gap-1 opacity-40">
                <div className="w-4 h-2.5 rounded-sm bg-white/60" />
              </div>
            </div>

            {/* Screen content */}
            <div className="px-6 pb-8">
              <EditableText className="text-xl font-black mt-2" style={{ color: t.primaryLight }}>Today</EditableText>

              {/* Category cards */}
              <div className="space-y-3 mt-4">
                {[
                  { icon: <Wind size={18} />, label: 'Breathing', dur: '10 min', color: t.accent },
                  { icon: <Heart size={18} />, label: 'Self-Love', dur: '15 min', color: t.accentOrange },
                  { icon: <Sparkles size={18} />, label: 'Focus', dur: '8 min', color: t.accentGold },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '30' }}>
                      <span style={{ color: item.color }}>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold" style={{ color: t.primaryLight }}>{item.label}</span>
                      <span className="text-[10px] font-bold opacity-40 block">{item.dur}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color }}>
                      <span className="text-[10px] font-black text-white">▶</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="mt-5 rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold opacity-40">Weekly streak</span>
                  <span className="text-sm font-black" style={{ color: t.accentLight }}>5 days</span>
                </div>
                <div className="flex gap-1.5">
                  {[1,1,1,1,1,0,0].map((filled, i) => (
                    <div key={i} className="flex-1 h-2 rounded-full" style={{ backgroundColor: filled ? t.accent : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
