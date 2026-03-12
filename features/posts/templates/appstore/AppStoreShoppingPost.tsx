import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ShoppingCart, Heart, Tag, Star } from 'lucide-react';

export default function AppStoreShoppingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.accent, fontFamily: t.font }}>
      {/* Vibrant accent background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.accent}, ${t.accentLight})` }} />
      <div className="absolute bottom-[20%] left-0 w-[300px] h-[300px] rounded-full opacity-15 blur-[80px] bg-white" />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge */}
        <DraggableWrapper id="header-shopping">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <ShoppingCart size={18} color="#fff" />
            </div>
            <div>
              <EditableText className="text-xs font-bold">StyleBox</EditableText>
              <EditableText className="text-[10px] font-bold opacity-60">E-commerce</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-shopping" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`}>
            Shop
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`}>
            Better,
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight opacity-80`}>
            Save More
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-60">
            Discover deals you&apos;ll love
          </EditableText>
        </DraggableWrapper>

        {/* Two phones with product grids — large, bleed off bottom */}
        <DraggableWrapper id="phones-shopping" variant="mockup" className="mt-auto flex justify-center -mb-20">
          <div className="relative" style={{ width: isTall ? 460 : 380, height: isTall ? 440 : 360 }}>
            {/* Left phone */}
            <div className="absolute top-4 left-0 rounded-[2.2rem] border-[4px] border-white/30 overflow-hidden bg-white" style={{
              width: isTall ? 280 : 235,
              height: isTall ? 420 : 350,
              transform: 'rotate(-5deg)',
            }}>
              <div className="px-4 pt-8 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black text-slate-900">Trending</span>
                  <Tag size={14} style={{ color: t.accent }} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { price: '$49', color: t.accent + '15' },
                    { price: '$89', color: t.accentOrange + '15' },
                    { price: '$35', color: t.accentGold + '15' },
                    { price: '$120', color: t.accentLight + '15' },
                    { price: '$67', color: t.accent + '10' },
                    { price: '$42', color: t.accentOrange + '10' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-2.5 relative" style={{ backgroundColor: item.color }}>
                      <div className="aspect-square rounded-lg mb-1.5" style={{ backgroundColor: t.accent + '12' }} />
                      <span className="text-[10px] font-bold text-slate-900">{item.price}</span>
                      <Heart size={10} className="absolute top-2.5 right-2.5 text-slate-300" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right phone */}
            <div className="absolute top-0 right-0 rounded-[2.2rem] border-[4px] border-white/30 overflow-hidden bg-white" style={{
              width: isTall ? 280 : 235,
              height: isTall ? 420 : 350,
              transform: 'rotate(5deg)',
            }}>
              <div className="px-4 pt-8 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black text-slate-900">For You</span>
                  <Star size={14} style={{ color: t.accentGold }} />
                </div>
                {/* Product list */}
                {[
                  { name: 'Classic Tee', price: '$29', disc: '-40%' },
                  { name: 'Sneakers Pro', price: '$89', disc: '-25%' },
                  { name: 'Smart Watch', price: '$199', disc: '-15%' },
                  { name: 'Backpack', price: '$59', disc: '-30%' },
                  { name: 'Sunglasses', price: '$45', disc: '-20%' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50">
                    <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: t.accent + '12' }} />
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-slate-900 block">{item.name}</span>
                      <span className="text-[10px] font-bold" style={{ color: t.accent }}>{item.price}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: t.accent + '15', color: t.accent }}>{item.disc}</span>
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
