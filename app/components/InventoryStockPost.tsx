import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { Command, RefreshCcw, Boxes, AlertTriangle } from 'lucide-react';

export default function InventoryStockPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background Texture */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to top right, ${t.primary}, ${t.primary}, ${t.primaryDark})` }}></div>
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `linear-gradient(${t.accentLime} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLime} 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px'}}>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-inv" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.accentLime }}>
                <Command size={24} style={{ color: t.primary }} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tight" style={{ color: t.primaryLight }}>SYLO</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: t.accentLight }}>INVENTORY AI</span>
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="badge-inv" className="px-4 py-1.5 bg-white/10 border border-white/20 rounded-full flex items-center gap-2">
             <RefreshCcw size={12} className="animate-spin-slow" style={{ color: t.accentLime }} />
             <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: t.primaryLight }}>AUTO-SYNC ON</span>
          </DraggableWrapper>
        </div>

        {/* Headline */}
        <DraggableWrapper id="headline-inv" className="mt-8 text-center z-30" dir="rtl">
           <h2 className="text-5xl font-black leading-tight mb-3" style={{ color: t.primaryLight }}>
              <EditableText>وداعاً لنقص</EditableText> <br/>
              <span style={{ color: t.accentLime }}><EditableText>المخزون</EditableText></span>
           </h2>
           <p className="font-bold max-w-sm mx-auto text-lg leading-relaxed" style={{ color: t.primaryLight + 'b3' }}>
              <EditableText>تحكم كامل بمخزنك، تنبيهات ذكية، وتقارير دقيقة للمواد الأولية</EditableText>
           </p>
        </DraggableWrapper>

        {/* iPhone Mockup (Center) */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
           {/* Ground Shadow */}
           <div className="absolute bottom-4 w-48 h-4 bg-black/40 blur-xl rounded-full"></div>
           
           <div className={`relative z-20 transform translate-y-4 ${isTall ? 'w-[300px] h-[560px]' : 'w-[230px] h-[330px]'}`}>
              
              {/* Hardware Buttons */}
              <div className="absolute -left-[6px] top-16 w-[3px] h-10 rounded-l-md" style={{ backgroundColor: t.border }}></div>
              <div className="absolute -right-[6px] top-24 w-[3px] h-14 rounded-r-md" style={{ backgroundColor: t.border }}></div>

              {/* iPhone Frame */}
              <DraggableWrapper id="mockup-inv" className="absolute inset-0 rounded-[40px] border-[6px] shadow-2xl overflow-hidden z-20" style={{ backgroundColor: t.primaryDark, borderColor: t.border }}>
                 <div className="absolute inset-0 bg-white">
                    <img src="/3.jpg" alt="Inventory" className="w-full h-full object-cover object-top" />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
                 </div>
                 {/* Notch */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 rounded-b-xl z-20" style={{ backgroundColor: t.primaryDark }}></div>
              </DraggableWrapper>

              {/* Floating Alert Card */}
              <DraggableWrapper id="alert-inv" className="absolute -left-10 bottom-1/2 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 border-red-500 animate-float-slow z-30">
                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                    <AlertTriangle size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Alert</span>
                    <span className="text-xs font-black" style={{ color: t.primary }}>مخزون منخفض!</span>
                 </div>
              </DraggableWrapper>

              {/* Floating Success Card */}
              <DraggableWrapper id="success-inv" className="absolute -right-8 top-10 bg-white p-3 rounded-2xl shadow-2xl flex items-center gap-3 border-l-4 animate-float z-30" style={{ borderColor: t.accentLime }}>
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
                    <Boxes size={18} />
                 </div>
                 <div className="flex flex-col leading-none" dir="rtl">
                    <span className="text-[8px] text-gray-500 font-bold uppercase mb-0.5">Success</span>
                    <span className="text-xs font-black" style={{ color: t.primary }}>قطعة 100+</span>
                 </div>
              </DraggableWrapper>
           </div>
        </div>

      </div>
    </div>
  );
}
