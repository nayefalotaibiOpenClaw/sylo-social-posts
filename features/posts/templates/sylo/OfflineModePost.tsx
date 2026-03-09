import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { WifiOff, CheckCircle, Zap } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function OfflineModePost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto">
        <div
            className="absolute inset-0 flex flex-col items-center justify-between p-8 font-sans"
            style={{ backgroundColor: t.primaryLight, color: t.primary, fontFamily: t.font }}
        >
            {/* Top Badge */}
            <DraggableWrapper id="logo-offlinemode" className="w-full flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="text-white w-8 h-8 rounded-md flex items-center justify-center font-bold text-xs" style={{ backgroundColor: t.primary }}>S</div>
                    <span className="font-bold text-lg tracking-wide">Sylo</span>
                 </div>
                 <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-red-200">
                    <WifiOff size={14} />
                    <EditableText className="pt-0.5">بدون إنترنت</EditableText>
                 </div>
            </DraggableWrapper>

            {/* Central Visual */}
            <DraggableWrapper id="visual-offlinemode" className="flex-1 flex flex-col items-center justify-center w-full relative">
                {/* Pulse Effect */}
                <div className="absolute w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ backgroundColor: t.accent + '1a' }}></div>

                <div className="relative z-10 flex flex-col items-center gap-6 w-full text-center">
                    <DraggableWrapper id="headline-offlinemode">
                    <h1 className="text-6xl font-black leading-tight" style={{ color: t.primary }}>
                        انقطع النت؟ <br/>
                        <EditableText style={{ color: t.accent }}>ولا يهمك.</EditableText>
                    </h1>
                    </DraggableWrapper>

                    <DraggableWrapper id="card-offlinemode-1" className="bg-white shadow-xl border p-6 rounded-2xl w-full max-w-sm" style={{ borderColor: t.primary + '1a' }}>
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                             <span className="text-gray-500 text-sm font-bold">حالة الاتصال</span>
                             <span className="text-red-500 text-sm font-bold bg-red-50 px-2 py-0.5 rounded">مفصول</span>
                        </div>
                        <div className="space-y-3" dir="rtl">
                             <div className="flex items-center gap-3" style={{ color: t.primary }}>
                                <CheckCircle size={20} style={{ color: t.accent }} fill={t.primaryLight} />
                                <EditableText className="font-bold">تسجيل المبيعات</EditableText>
                             </div>
                             <div className="flex items-center gap-3" style={{ color: t.primary }}>
                                <CheckCircle size={20} style={{ color: t.accent }} fill={t.primaryLight} />
                                <EditableText className="font-bold">حفظ الطلبات (طابور)</EditableText>
                             </div>
                             <div className="flex items-center gap-3" style={{ color: t.primary }}>
                                <CheckCircle size={20} style={{ color: t.accent }} fill={t.primaryLight} />
                                <EditableText className="font-bold">طباعة الفواتير</EditableText>
                             </div>
                        </div>
                    </DraggableWrapper>
                </div>
            </DraggableWrapper>

            {/* Footer */}
            <DraggableWrapper id="footer-offlinemode" className="w-full text-center mt-4">
                <EditableText as="p" className="text-lg font-bold mb-2" style={{ color: t.primary + 'b3' }}>بيعك مستمر حتى لو النت فصل</EditableText>
                <div className="flex justify-center items-center gap-2 text-sm font-bold bg-white/50 py-1 px-4 rounded-full mx-auto w-fit" style={{ color: t.primary }}>
                    <Zap size={16} fill={t.accentOrange} style={{ color: t.accentOrange }} />
                    <EditableText>نظام كاشير يعمل دائماً</EditableText>
                </div>
            </DraggableWrapper>
        </div>
      </div>
  );
}
