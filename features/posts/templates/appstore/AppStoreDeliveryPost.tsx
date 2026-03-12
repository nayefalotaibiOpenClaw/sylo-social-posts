import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingBag, Search, Clock, Star } from 'lucide-react';

export default function AppStoreDeliveryPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Accent gradient background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(150deg, ${t.accent}, ${t.accentLight}, ${t.accentOrange})` }} />
      <div className="absolute top-[10%] right-0 w-[250px] h-[250px] rounded-full opacity-20 blur-[80px]" style={{ backgroundColor: '#fff' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge */}
        <DraggableWrapper id="header-delivery">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <ShoppingBag size={18} color="#fff" />
            </div>
            <div>
              <EditableText className="text-xs font-bold">QuickBite</EditableText>
              <EditableText className="text-[10px] font-bold opacity-60">Food Delivery</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-delivery" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`}>
            Order
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`}>
            Anything,
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight opacity-80`}>
            Anytime
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-60">
            Delivered to your door in minutes
          </EditableText>
        </DraggableWrapper>

        {/* Phone mockup — large, bleeds off bottom */}
        <DraggableWrapper id="phone-delivery" variant="mockup" className="mt-auto flex justify-center -mb-16">
          <div className={`${isTall ? 'w-[380px]' : 'w-[320px]'} rounded-[2.5rem] border-[4px] border-white/30 overflow-hidden bg-white`}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2 text-slate-900">
              <span className="text-[10px] font-bold opacity-40">9:41</span>
              <div className="w-24 h-6 rounded-full bg-slate-100" />
              <div className="w-4 h-2.5 rounded-sm bg-slate-300" />
            </div>

            {/* Search bar */}
            <div className="px-5">
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-slate-50">
                <Search size={16} className="text-slate-400" />
                <span className="text-sm font-bold text-slate-300">Search restaurants...</span>
              </div>
            </div>

            {/* Food cards */}
            <div className="px-5 pb-8 mt-4">
              <span className="text-sm font-black text-slate-900 mb-3 block">Popular Near You</span>
              <div className="space-y-3">
                {[
                  { name: 'Sushi House', time: '25 min', rating: '4.9', color: t.accent },
                  { name: 'Pizza Roma', time: '30 min', rating: '4.7', color: t.accentOrange },
                  { name: 'Green Bowl', time: '20 min', rating: '4.8', color: t.accentGold },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-2xl p-3" style={{ backgroundColor: item.color + '10' }}>
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: item.color + '25' }}>
                      <ShoppingBag size={18} style={{ color: item.color }} />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-slate-900 block">{item.name}</span>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Clock size={10} />{item.time}</span>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><Star size={10} />{item.rating}</span>
                      </div>
                    </div>
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
