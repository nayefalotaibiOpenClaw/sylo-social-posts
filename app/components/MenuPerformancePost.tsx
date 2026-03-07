import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { Command, TrendingUp, PieChart } from 'lucide-react';

export default function MenuPerformancePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary, fontFamily: t.font }}>
      {/* Background Decor */}
      <div className="absolute inset-0" style={{ backgroundColor: t.primaryLight }}></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" style={{ backgroundColor: t.accentLime }}></div>
      <div className="absolute inset-0 opacity-[0.05]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '30px 30px'}}>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-menu" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                <Command size={24} style={{ color: t.accentLime }} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tight" style={{ color: t.primary }}>SYLO</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: t.accent }}>ANALYTICS</span>
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="badge-menu" className="px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg" style={{ backgroundColor: t.primary }}>
             <TrendingUp size={12} style={{ color: t.accentLime }} />
             <span className="text-[9px] font-black text-white tracking-widest uppercase">MARGIN OPTIMIZER</span>
          </DraggableWrapper>
        </div>

        {/* Headline */}
        <DraggableWrapper id="headline-menu" className="mt-12 text-right z-30" dir="rtl">
           <h2 className="text-6xl font-black leading-[0.95] tracking-tighter" style={{ color: t.primary }}>
              <EditableText>هندسة</EditableText> <br/>
              <span className="text-7xl" style={{ color: t.accent }}><EditableText>المنيو</EditableText></span> <br/>
              <EditableText>الذكية</EditableText>
           </h2>
           <p className="font-bold mt-4 text-xl max-w-sm ml-0 mr-auto leading-tight" style={{ color: t.primary + '99' }}>
              <EditableText>اعرف أكثر الأصناف ربحية، وحلل هوامش الربح لكل منصة توصيل</EditableText>
           </p>
        </DraggableWrapper>

        {/* Visual Section - Mockup at the bottom */}
        <div className="flex-1 flex items-end justify-center relative">
           {/* Ground Shadow */}
           <div className="absolute bottom-16 w-48 h-4 blur-xl rounded-full" style={{ backgroundColor: t.primary + '1a' }}></div>
           
           <div className={`relative z-20 group transform translate-y-24 ${isTall ? 'w-[320px] h-[600px]' : 'w-[260px] h-[360px]'}`}>
              
              {/* Hardware Details */}
              <div className="absolute -left-[6px] top-24 w-[3px] h-10 rounded-l-md" style={{ backgroundColor: t.primary + '33' }}></div>
              <div className="absolute -right-[6px] top-32 w-[3px] h-14 rounded-r-md" style={{ backgroundColor: t.primary + '33' }}></div>

              {/* iPhone Frame */}
              <DraggableWrapper id="mockup-menu" className="relative h-full w-full rounded-[42px] border-[6px] overflow-hidden shadow-[0_30px_60px_-15px_rgba(27,67,50,0.3)] bg-white z-20" style={{ borderColor: t.primary }}>
                 <img src="/4.jpg" alt="Analytics" className="w-full h-full object-cover object-top" />
                 
                 {/* Glass Reflection Overlays */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none"></div>
                 <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                 {/* Notch */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#1B4332] rounded-b-xl z-20"></div>
              </DraggableWrapper>

              {/* Floating Stat Card */}
              <DraggableWrapper id="stat-card-menu" className="absolute -right-8 top-12 bg-white p-3 rounded-2xl shadow-xl flex items-center gap-4 transform -rotate-2 border-2 border-[#EAF4EE] z-30">
                 <div className="w-10 h-10 bg-[#1B4332] rounded-xl flex items-center justify-center text-[#B7FF5B]">
                    <PieChart size={20} />
                 </div>
                 <div className="flex flex-col leading-none">
                    <span className="text-[8px] text-gray-400 font-bold uppercase mb-1 leading-none">Profit Margin</span>
                    <span className="text-lg font-black text-[#1B4332] leading-none">80.00%</span>
                 </div>
              </DraggableWrapper>
           </div>
        </div>

      </div>
    </div>
  );
}
