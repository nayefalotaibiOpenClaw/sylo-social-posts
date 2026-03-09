import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { UserCheck, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function HRAttendancePost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                 style={{backgroundImage: `linear-gradient(${t.primary} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primary} 0.5px, transparent 0.5px)`, backgroundSize: '20px 20px'}}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <DraggableWrapper id="headline-hrattendance" className="text-center mt-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-1 leading-tight" style={{ color: t.primary }}>دوامك مضبوط</EditableText>
                    <EditableText as="p" className="text-lg sm:text-xl font-bold" style={{ color: t.accent }}>بصمة ذكية للموظفين</EditableText>
                </DraggableWrapper>

                {/* Central Visual - Phone Check-in */}
                <DraggableWrapper id="visual-hrattendance" className="w-full flex-1 flex items-center justify-center relative mt-6">
                    
                    {/* Background Circle */}
                    <div className="absolute w-64 h-64 rounded-full blur-2xl" style={{ backgroundColor: t.accentLight + '33' }}></div>

                    {/* Phone Frame */}
                    <div className="w-40 h-72 bg-white rounded-[2rem] border-[6px] shadow-2xl relative overflow-hidden z-20 flex flex-col items-center justify-center" style={{ borderColor: t.primary }}>
                         {/* Dynamic Island */}
                         <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-3 bg-black rounded-full z-30"></div>

                         {/* Screen Content - Successful Scan */}
                         <div className="flex flex-col items-center gap-4 animate-fade-in-up">
                             <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-inner relative" style={{ backgroundColor: t.primaryLight }}>
                                 <div className="absolute inset-0 border-4 rounded-full border-t-transparent animate-spin" style={{ borderColor: t.accent, borderTopColor: 'transparent' }}></div>
                                 <UserCheck size={32} style={{ color: t.primary }} />
                             </div>
                             <div className="text-center">
                                 <EditableText as="h3" className="text-lg font-black" style={{ color: t.primary }}>تم التحضير</EditableText>
                                 <p className="text-xs text-gray-500 font-bold">08:59 AM</p>
                             </div>
                             <div className="px-4 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1" style={{ backgroundColor: t.primaryLight, color: t.accent }}>
                                 <CheckCircle size={10} />
                                 <EditableText>في الموقع</EditableText>
                             </div>
                         </div>
                    </div>

                    {/* Floating Avatars (Staff) */}
                    <div className="absolute left-8 top-1/3 w-12 h-12 bg-[#FDE68A] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[#92400E] font-bold text-xs animate-bounce-slow delay-100">
                        AA
                    </div>
                    <div className="absolute right-8 top-1/4 w-12 h-12 bg-[#BFDBFE] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[#1E3A8A] font-bold text-xs animate-bounce-slow delay-300">
                        MK
                    </div>
                    <div className="absolute right-12 bottom-1/3 w-12 h-12 bg-[#FECACA] rounded-full border-4 border-white shadow-lg flex items-center justify-center text-[#991B1B] font-bold text-xs animate-bounce-slow delay-200">
                        SA
                    </div>

                </DraggableWrapper>

                {/* Feature Tags */}
                <DraggableWrapper id="footer-hrattendance" className="w-full flex justify-center gap-4 mt-4">
                    <div className="flex flex-col items-center gap-1" style={{ color: t.primary + 'b3' }}>
                        <Clock size={20} />
                        <EditableText className="text-[10px] font-bold">بدون تأخير</EditableText>
                    </div>
                    <div className="flex flex-col items-center gap-1" style={{ color: t.primary + 'b3' }}>
                        <CalendarDays size={20} />
                        <EditableText className="text-[10px] font-bold">جدول الشفتات</EditableText>
                    </div>
                </DraggableWrapper>

            </div>
      </div>
  );
}
