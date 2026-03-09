import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useEditMode, useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader } from '@/app/components/shared';
import { RefreshCcw, Boxes, AlertTriangle } from 'lucide-react';

export default function InventoryStockPost() {
  const isEditMode = useEditMode();
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background Texture */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top right, ${t.primary}, ${t.primaryDark})` }}></div>
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px'}}>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">

        <PostHeader
          id="inv"
          subtitle="INVENTORY AI"
          badge={<><RefreshCcw size={12} className={`${isEditMode ? '' : 'animate-spin-slow'}`} /> AUTO-SYNC ON</>}
          variant="dark"
        />

        {/* Headline */}
        <DraggableWrapper id="headline-inv" className="mt-8 text-center z-30" dir="rtl">
           <h2 className="text-5xl font-black leading-tight mb-3" style={{ color: t.primaryLight }}>
              <EditableText>وداعاً لنقص</EditableText> <br/>
              <span style={{ color: t.accentLime }}><EditableText>المخزون</EditableText></span>
           </h2>
           <p className="font-bold max-w-sm mx-auto text-lg leading-relaxed opacity-70" style={{ color: t.primaryLight }}>
              <EditableText>تحكم كامل بمخزنك، تنبيهات ذكية، وتقارير دقيقة للمواد الأولية</EditableText>
           </p>
        </DraggableWrapper>

        {/* iPhone Mockup (Center) */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
           <div className="absolute bottom-4 w-48 h-4 bg-black/40 blur-xl rounded-full"></div>

           <div className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[230px] h-[330px]'} transform translate-y-4`}>

              <DraggableWrapper id="mockup-inv" variant="mockup" className="absolute inset-0 z-20">
                 <IPhoneMockup src="/3.jpg" alt="Inventory" notch="notch" />
              </DraggableWrapper>

              {/* Floating Alert Card */}
              <DraggableWrapper id="alert-inv" className={`absolute -left-10 bottom-1/2 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-red-500 z-30 ${isEditMode ? '' : 'animate-float-slow'}`}>
                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <AlertTriangle size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Alert</span>
                    <span className="text-xs font-black text-gray-900">مخزون منخفض!</span>
                 </div>
              </DraggableWrapper>

              {/* Floating Success Card */}
              <DraggableWrapper id="success-inv" className={`absolute -right-8 top-10 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 z-30 ${isEditMode ? '' : 'animate-float'}`} style={{ borderLeftColor: t.accentLime }}>
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
                    <Boxes size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Success</span>
                    <span className="text-xs font-black text-gray-900">قطعة 100+</span>
                 </div>
              </DraggableWrapper>
           </div>
        </div>

      </div>
    </div>
  );
}
