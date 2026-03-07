import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { Command, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function StaffManagementPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';
  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary, fontFamily: t.font }}>
      {/* Background with Subtle Pattern */}
      <div className="absolute inset-0" style={{ backgroundColor: t.primaryLight }}></div>
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: `linear-gradient(${t.primary} 1px, transparent 1px), linear-gradient(90deg, ${t.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        
        {/* Header */}
        <div className="flex justify-between items-start">
          <DraggableWrapper id="logo-staff" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: t.primary }}>
                <Command size={24} style={{ color: t.accentLime }} strokeWidth={2.5} />
             </div>
             <div className="flex flex-col leading-none">
                <span className="font-black text-xl tracking-tight" style={{ color: t.primary }}>SYLO</span>
                <span className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: t.accent }}>TEAM HUB</span>
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="badge-staff" className="px-4 py-1.5 rounded-full flex items-center gap-2 shadow-md" style={{ backgroundColor: t.primary }}>
             <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: t.accentLime }}></div>
             <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE TRACKING</span>
          </DraggableWrapper>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col mt-6">
           {/* Headline Area - Draggable */}
           <DraggableWrapper id="headline-staff" className="text-right mb-6" dir="rtl">
              <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
                 <EditableText>فريقك..</EditableText> <br/>
                 <span style={{ color: t.accent }}><EditableText>بنظرة وحدة</EditableText></span>
              </h2>
              <p className="font-bold mt-1 text-lg" style={{ color: t.primary + '99' }}>
                 <EditableText>نظام متكامل لمتابعة حضور وانصراف الموظفين</EditableText>
              </p>
           </DraggableWrapper>

           {/* Visual Section */}
           <div className="flex-1 flex items-center gap-6">
              {/* iPhone Mockup (Left) - Draggable */}
              <DraggableWrapper id="mockup-staff" className={`relative shrink-0 transform -rotate-2 z-20 ${isTall ? 'w-[280px] h-[540px]' : 'w-[210px] h-[320px]'}`}>
                 {/* Shadows */}
                 <div className="absolute -bottom-2 w-full h-4 bg-black/10 blur-xl rounded-full"></div>
                 
                 {/* Hardware Buttons */}
                 <div className="absolute -left-[6px] top-16 w-[2px] h-10 rounded-l-md" style={{ backgroundColor: t.primary + '33' }}></div>
                 <div className="absolute -right-[6px] top-24 w-[2px] h-14 rounded-r-md" style={{ backgroundColor: t.primary + '33' }}></div>

                 <div className="relative h-full w-full rounded-[40px] border-[6px] overflow-hidden shadow-2xl" style={{ borderColor: t.primary }}>
                    <div className="absolute inset-0 bg-white">
                        <img src="/2.jpg" alt="Staff List" className="w-full h-full object-cover object-top" />
                        {/* Glass Reflections */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
                    </div>
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-4 rounded-b-xl z-20" style={{ backgroundColor: t.primary }}></div>
                 </div>
              </DraggableWrapper>

              {/* Feature Cards Column - Individual Draggable Cards */}
              <div className="flex flex-col gap-3 w-full" dir="rtl">
                 {[
                    { id: 'card-staff-1', icon: Clock, text: "ساعات العمل بدقة" },
                    { id: 'card-staff-2', icon: ShieldCheck, text: "تقارير الحضور والغياب" },
                    { id: 'card-staff-3', icon: Zap, text: "إدارة الإجازات فوراً" }
                 ].map((item, i) => (
                    <DraggableWrapper key={item.id} id={item.id} className="bg-white border-2 p-3 rounded-2xl flex items-center gap-3 shadow-sm transform transition-transform hover:translate-x-[-4px]" style={{ borderColor: t.primary + '0d' }}>
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
                          <item.icon size={20} />
                       </div>
                       <EditableText className="text-sm font-black" style={{ color: t.primary }}>{item.text}</EditableText>
                    </DraggableWrapper>
                 ))}
              </div>
           </div>
        </div>

        {/* Brand Label */}
        <DraggableWrapper id="label-staff" className="mt-4 pt-4 border-t text-center" style={{ borderColor: t.primary + '1a' }}>
           <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: t.accent }}>TEAM MANAGEMENT REDEFINED</span>
        </DraggableWrapper>

      </div>
    </div>
  );
}
