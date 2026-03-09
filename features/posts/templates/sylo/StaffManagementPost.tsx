import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useEditMode, useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader } from '@/app/components/shared';
import { Clock, ShieldCheck, Zap } from 'lucide-react';

export default function StaffManagementPost() {
  const isEditMode = useEditMode();
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background with Subtle Pattern */}
      <div className="absolute inset-0" style={{ backgroundColor: t.primaryLight }}></div>
      <div className="absolute inset-0 opacity-[0.03]"
           style={{backgroundImage: `linear-gradient(${t.primary} 1px, transparent 1px), linear-gradient(90deg, ${t.primary} 1px, transparent 1px)`, backgroundSize: '40px 40px'}}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">

        <PostHeader
          id="staff"
          subtitle="TEAM HUB"
          badge={<><div className={`w-1.5 h-1.5 rounded-full ${isEditMode ? '' : 'animate-pulse'}`} style={{ backgroundColor: t.accentLime }}></div> LIVE TRACKING</>}
          variant="light"
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col mt-6">
           {/* Headline Area - Draggable */}
           <DraggableWrapper id="headline-staff" className="text-right mb-6" dir="rtl">
              <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
                 <EditableText>فريقك..</EditableText> <br/>
                 <span style={{ color: t.accent }}><EditableText>بنظرة وحدة</EditableText></span>
              </h2>
              <p className="font-bold mt-1 text-lg opacity-60" style={{ color: t.primary }}>
                 <EditableText>نظام متكامل لمتابعة حضور وانصراف الموظفين</EditableText>
              </p>
           </DraggableWrapper>

           {/* Visual Section */}
           <div className="flex-1 flex items-center gap-6">
              {/* iPhone Mockup (Left) - Draggable */}
              <DraggableWrapper id="mockup-staff" variant="mockup" className={`relative shrink-0 z-20 transition-all duration-500 ${isTall ? 'w-[280px] h-[540px]' : 'w-[210px] h-[320px]'} ${isEditMode ? '' : 'transform -rotate-2'}`}>
                 {/* Shadows */}
                 <div className="absolute -bottom-2 w-full h-4 bg-black/10 blur-xl rounded-full"></div>
                 <IPhoneMockup src="/2.jpg" alt="Staff List" notch="notch" />
              </DraggableWrapper>

              {/* Feature Cards Column - Individual Draggable Cards */}
              <div className="flex flex-col gap-3 w-full" dir="rtl">
                 {[
                    { id: 'card-staff-1', icon: Clock, text: "ساعات العمل بدقة" },
                    { id: 'card-staff-2', icon: ShieldCheck, text: "تقارير الحضور والغياب" },
                    { id: 'card-staff-3', icon: Zap, text: "إدارة الإجازات فوراً" }
                 ].map((item) => (
                    <DraggableWrapper key={item.id} id={item.id} className="bg-white border-2 p-3 rounded-2xl flex items-center gap-3 shadow-sm transform transition-transform hover:translate-x-[-4px]" style={{ borderColor: `${t.primary}0D` }}>
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
        <DraggableWrapper id="label-staff" className="mt-4 pt-4 border-t text-center" style={{ borderTopColor: `${t.primary}1A` }}>
           <span className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: t.accent }}>TEAM MANAGEMENT REDEFINED</span>
        </DraggableWrapper>

      </div>
    </div>
  );
}
