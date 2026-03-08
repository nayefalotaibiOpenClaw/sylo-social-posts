import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { MapPin, Clock, Truck } from 'lucide-react';

export default function LiveTrackingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.05]"
           style={{ backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '32px 32px' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="live-tracking" subtitle="DELIVERY" badge={<><MapPin size={12} /> LIVE</>} variant="dark" />

        <DraggableWrapper id="headline-tracking" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>تتبّع طلباتك</EditableText><br />
            <span style={{ color: t.accentLime }}><EditableText>لحظة بلحظة</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-60" style={{ color: t.primaryLight }}>
            <EditableText>من المطبخ للعميل، كل خطوة واضحة</EditableText>
          </p>
        </DraggableWrapper>

        {/* Big angled phone — hero style, bottom-left anchored */}
        <div className="flex-1 flex items-end justify-start relative mt-2">
          <div className="absolute bottom-2 left-16 w-56 h-5 bg-black/40 blur-xl rounded-full" />

          <DraggableWrapper
            id="mockup-tracking" variant="mockup"
            className={`relative z-20 ${isTall ? 'w-[270px] h-[520px]' : 'w-[210px] h-[370px]'}`}
          >
            <IPhoneMockup src="/3.jpg" alt="Live Tracking" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-tracking-eta"
            icon={<Clock size={16} style={{ color: t.accentLime }} />}
            label="ETA"
            value="12 min"
            className="absolute right-4 top-[10%] z-30"
            rotate={-4}
            animation="animate-float"
          />

          <FloatingCard
            id="stat-tracking-active"
            icon={<Truck size={16} style={{ color: t.accentGold }} />}
            label="Active Orders"
            value="8"
            className="absolute right-8 bottom-[30%] z-30"
            rotate={3}
            borderColor={t.accentGold}
            animation="animate-float-slow"
          />
        </div>

        <PostFooter id="live-tracking" label="SYLO DELIVERY" text="توصيل أسرع، عملاء أسعد" icon={<Truck size={24} />} variant="dark" />
      </div>
    </div>
  );
}
