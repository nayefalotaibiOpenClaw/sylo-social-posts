import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, ArrowUpRight, Wallet } from 'lucide-react';

export default function AppStoreFinancePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Dark background with warm accent glow */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primaryDark}, ${t.primary})` }} />
      <div className="absolute top-[30%] right-0 w-[300px] h-[300px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: t.accentGold }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge */}
        <DraggableWrapper id="header-finance">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.accentGold + '20' }}>
              <Wallet size={18} style={{ color: t.accentGold }} />
            </div>
            <div>
              <EditableText className="text-xs font-bold opacity-80">Grow</EditableText>
              <EditableText className="text-[10px] font-bold opacity-40">Finance App</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-finance" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryLight }}>
            Finance
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.accentGold }}>
            Made
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryLight }}>
            Simple
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-40">
            Track, invest, and grow your wealth
          </EditableText>
        </DraggableWrapper>

        {/* Phone mockup — large, bleeds off bottom */}
        <DraggableWrapper id="phone-finance" variant="mockup" className="mt-auto flex justify-center -mb-16">
          <div className={`${isTall ? 'w-[380px]' : 'w-[320px]'} rounded-[2.5rem] border-[4px] border-white/15 overflow-hidden`} style={{ backgroundColor: t.primaryDark }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <span className="text-[10px] font-bold opacity-40">9:41</span>
              <div className="w-24 h-6 rounded-full bg-white/5" />
              <div className="w-4 h-2.5 rounded-sm bg-white/30" />
            </div>

            <div className="px-5 pb-8">
              {/* Portfolio value */}
              <div className="text-center mb-4">
                <span className="text-[10px] font-bold opacity-40 block">Total Balance</span>
                <span className="text-3xl font-black" style={{ color: t.primaryLight }}>$24,580</span>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUpRight size={14} style={{ color: t.accentGold }} />
                  <span className="text-xs font-bold" style={{ color: t.accentGold }}>+12.4%</span>
                </div>
              </div>

              {/* CSS stock chart */}
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-end gap-1 h-24">
                  {[30, 45, 35, 55, 40, 65, 50, 70, 60, 80, 75, 90, 85, 95, 88].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-sm" style={{
                      height: `${h}%`,
                      backgroundColor: i >= 12 ? t.accentGold : t.accent + '40',
                    }} />
                  ))}
                </div>
                <div className="flex justify-between mt-3">
                  <span className="text-[9px] font-bold opacity-30">Jan</span>
                  <span className="text-[9px] font-bold opacity-30">Jun</span>
                  <span className="text-[9px] font-bold opacity-30">Dec</span>
                </div>
              </div>

              {/* Holdings */}
              {[
                { name: 'AAPL', change: '+2.4%', color: t.accentGold },
                { name: 'TSLA', change: '+5.1%', color: t.accent },
                { name: 'GOOG', change: '+1.8%', color: t.accentOrange },
              ].map((stock, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: stock.color + '20' }}>
                      <TrendingUp size={14} style={{ color: stock.color }} />
                    </div>
                    <span className="text-sm font-bold opacity-70">{stock.name}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: stock.color }}>{stock.change}</span>
                </div>
              ))}
            </div>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
