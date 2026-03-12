import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CreditCard, Send, Shield, ArrowUpRight } from 'lucide-react';

export default function AppStoreBankingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Clean white/light background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(170deg, ${t.primaryLight}, #fff, ${t.primaryLight})` }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6" style={{ color: t.primaryDark }}>
        {/* Badge */}
        <DraggableWrapper id="header-banking">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.accent }}>
              <Shield size={18} color="#fff" />
            </div>
            <div>
              <EditableText className="text-xs font-bold" style={{ color: t.primaryDark }}>NeoBank</EditableText>
              <EditableText className="text-[10px] font-bold opacity-40">Smart Banking</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-banking" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryDark }}>
            Smart
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.accent }}>
            Banking
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryDark }}>
            For Everyone
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-40">
            Spend, save, and invest with confidence
          </EditableText>
        </DraggableWrapper>

        {/* Two overlapping phones — large, bleed off bottom */}
        <DraggableWrapper id="phones-banking" variant="mockup" className="mt-auto flex justify-center -mb-20">
          <div className="relative" style={{ width: isTall ? 460 : 380, height: isTall ? 480 : 400 }}>
            {/* Back phone */}
            <div className="absolute top-0 left-0 rounded-[2.2rem] border-[4px] overflow-hidden" style={{
              width: isTall ? 300 : 250,
              height: isTall ? 460 : 380,
              borderColor: t.border,
              backgroundColor: t.primaryDark,
              transform: 'rotate(-6deg)',
            }}>
              <div className="px-5 pt-10 pb-6">
                <span className="text-[10px] font-bold opacity-40 block text-white">Total Balance</span>
                <span className="text-2xl font-black" style={{ color: t.primaryLight }}>$12,450</span>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight size={12} style={{ color: t.accent }} />
                  <span className="text-[10px] font-bold" style={{ color: t.accent }}>+8.2%</span>
                </div>

                {/* Mini card */}
                <div className="mt-5 rounded-2xl p-4 relative overflow-hidden" style={{ backgroundColor: t.accent }}>
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: '#fff', transform: 'translate(30%, -30%)' }} />
                  <span className="text-[10px] font-bold text-white/60">Virtual Card</span>
                  <div className="mt-3 flex gap-2">
                    {['••••', '••••', '••••', '4829'].map((g, i) => (
                      <span key={i} className="text-xs font-bold text-white/80">{g}</span>
                    ))}
                  </div>
                </div>

                {/* Spending */}
                <div className="mt-5">
                  <span className="text-[10px] font-bold text-white/30 block mb-2">This Month</span>
                  <div className="flex gap-1 h-8">
                    {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, backgroundColor: i === 3 ? t.accent : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Front phone */}
            <div className="absolute top-6 rounded-[2.2rem] border-[4px] overflow-hidden" style={{
              width: isTall ? 300 : 250,
              height: isTall ? 460 : 380,
              borderColor: t.border,
              backgroundColor: '#fff',
              right: 0,
              transform: 'rotate(4deg)',
            }}>
              <div className="px-5 pt-10 pb-6">
                <span className="text-base font-black block" style={{ color: t.primaryDark }}>Quick Actions</span>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { icon: <Send size={20} />, label: 'Send', color: t.accent },
                    { icon: <CreditCard size={20} />, label: 'Pay', color: t.accentOrange },
                    { icon: <ArrowUpRight size={20} />, label: 'Invest', color: t.accentGold },
                    { icon: <Shield size={20} />, label: 'Save', color: t.accentLight },
                  ].map((action, i) => (
                    <div key={i} className="rounded-2xl p-4 flex flex-col items-center gap-2" style={{ backgroundColor: action.color + '12' }}>
                      <span style={{ color: action.color }}>{action.icon}</span>
                      <span className="text-xs font-bold" style={{ color: t.primaryDark }}>{action.label}</span>
                    </div>
                  ))}
                </div>

                {/* Recent */}
                <span className="text-[10px] font-bold opacity-30 block mt-5 mb-2">Recent Transactions</span>
                {['Coffee Shop', 'Grocery Store', 'Gas Station'].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: t.primaryDark + '08' }}>
                    <span className="text-xs font-bold" style={{ color: t.primaryDark }}>{item}</span>
                    <span className="text-xs font-bold opacity-40">-${(4.5 + i * 12).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
