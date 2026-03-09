import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { ChefHat, Printer, Clock, CheckCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function KitchenDisplayPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
            {/* Background Decor */}
             <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full" style={{ backgroundColor: t.accent + '1a' }}></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-full" style={{ backgroundColor: t.accentLight + '1a' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">
                
                {/* Header */}
                <DraggableWrapper id="headline-kitchen" className="text-center mt-4">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2" style={{ color: t.primary }}>المطبخ الذكي</EditableText>
                    <EditableText as="p" className="text-lg sm:text-xl font-bold" style={{ color: t.accent }}>نظّم طلباتك بدون ورق</EditableText>
                </DraggableWrapper>

                {/* Central Visual - KDS Cards */}
                <div className="w-full flex flex-col gap-4 items-center">
                    
                    {/* Ticket 1 (Completed) */}
                    <DraggableWrapper id="card-kitchen-1" className="w-full max-w-sm bg-white rounded-xl shadow-lg border-r-4 p-4 opacity-60 scale-95 transform translate-y-2" style={{ borderColor: t.accent }}>
                        <div className="flex justify-between items-center mb-2 text-gray-400">
                             <span className="font-bold">#1023</span>
                             <span className="text-xs">منذ 12 دقيقة</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 line-through">
                            <span className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs">1</span>
                            <span>برجر دجاج كلاسيك</span>
                        </div>
                    </DraggableWrapper>

                    {/* Ticket 2 (Active/Focus) */}
                    <DraggableWrapper id="card-kitchen-2" className="w-full max-w-sm bg-white rounded-xl shadow-2xl border-r-8 p-6 transform scale-105 z-20 relative" style={{ borderColor: t.primary }}>
                        {/* Status Badge */}
                        <div className="absolute -top-3 -right-3 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md" style={{ backgroundColor: t.primary }}>
                            جاري التحضير
                        </div>

                        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-black" style={{ color: t.primary }}>#1024</span>
                                <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-xs font-bold">محلي</span>
                             </div>
                             <div className="flex items-center gap-1 font-bold px-2 py-1 rounded" style={{ color: t.accent, backgroundColor: t.primaryLight }}>
                                <Clock size={14} />
                                <span className="text-sm">04:32</span>
                             </div>
                        </div>
                        
                        <div className="space-y-3">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 text-white rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: t.primary }}>2</span>
                                    <EditableText className="text-lg font-bold" style={{ color: t.primary }}>برجر لحم دبل</EditableText>
                                </div>
                                <CheckCircle size={20} className="text-gray-200" />
                             </div>
                             
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 text-white rounded-lg flex items-center justify-center font-bold" style={{ backgroundColor: t.primary }}>1</span>
                                    <EditableText className="text-lg font-bold" style={{ color: t.primary }}>بطاطس بالجبن</EditableText>
                                </div>
                                <CheckCircle size={20} style={{ color: t.accent }} fill={t.primaryLight} />
                             </div>

                             <div className="p-2 bg-red-50 rounded text-red-600 text-xs font-bold border border-red-100">
                                 ملاحظة: بدون مخلل للبرجر
                             </div>
                        </div>
                    </DraggableWrapper>

                     {/* Ticket 3 (Next) */}
                    <DraggableWrapper id="card-kitchen-3" className="w-full max-w-sm bg-white rounded-xl shadow-lg border-r-4 p-4 opacity-80 scale-95 transform -translate-y-2" style={{ borderColor: t.accentLight }}>
                         <div className="flex justify-between items-center mb-2">
                             <span className="font-bold" style={{ color: t.primary }}>#1025</span>
                             <span className="text-xs text-gray-500">جديد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ backgroundColor: t.primaryLight, color: t.primary }}>3</span>
                            <span className="text-sm font-bold" style={{ color: t.primary }}>بيبسي وسط</span>
                        </div>
                    </DraggableWrapper>

                </div>

                {/* Footer Icon Group */}
                <DraggableWrapper id="footer-kitchen" className="flex gap-8 opacity-60 mt-4">
                    <div className="flex flex-col items-center gap-1">
                        <Printer size={24} />
                        <EditableText className="text-xs font-bold">بدون طابعة</EditableText>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <ChefHat size={24} />
                        <EditableText className="text-xs font-bold">للطهاة</EditableText>
                    </div>
                </DraggableWrapper>

            </div>
      </div>
  );
}
