import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { UtensilsCrossed, Clock, Receipt } from 'lucide-react';

export default function TableOrderingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.04]"
           style={{backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px'}} />

      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] opacity-[0.1] blur-[120px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="table-ordering" subtitle="TABLE SERVICE" badge={<><UtensilsCrossed size={12}/> DINE-IN</>} variant="dark" />

        <DraggableWrapper id="headline-table" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>طلبات الطاولات</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>بلا ورق</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-70" style={{ color: t.primaryLight }}>
            <EditableText>نظام طلبات رقمي يربط الطاولة بالمطبخ مباشرة</EditableText>
          </p>
        </DraggableWrapper>

        {/* iPad Mockup */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-table" variant="mockup" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-full h-[300px]' : 'w-[320px] h-[220px]'}`}>
            <IPadMockup src="/pos-screen.jpg" orientation="landscape" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-table-speed"
            icon={<Clock size={16} style={{ color: t.accentLime }}/>}
            label="Order Speed"
            value="< 30 Sec"
            className="absolute -right-4 top-[15%] z-30"
            rotate={-3}
            borderColor={t.accentLime}
          />

          <FloatingCard
            id="stat-table-orders"
            icon={<Receipt size={16} style={{ color: t.accentGold }}/>}
            label="Daily Orders"
            value="350+"
            className="absolute -left-6 bottom-[20%] z-30"
            rotate={4}
            borderColor={t.accentGold}
          />
        </div>

        <PostFooter id="table-ordering" label="SYLO TABLE SERVICE" text="من الطاولة للمطبخ بدون تأخير" icon={<UtensilsCrossed size={24}/>} variant="dark" />
      </div>
    </div>
  );
}
