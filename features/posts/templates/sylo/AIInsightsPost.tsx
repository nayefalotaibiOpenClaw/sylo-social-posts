import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { Brain, Sparkles, TrendingUp, Lightbulb, Zap } from 'lucide-react';

export default function AIInsightsPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary }}>

            {/* Background Glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full blur-[120px]" style={{ backgroundColor: t.accentLight + '33' }}></div>
            <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px]"></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <DraggableWrapper id="headline-aiinsights" className="text-center mt-6">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Sparkles size={20} style={{ color: t.accentGold }} fill={t.accentGold} />
                        <EditableText className="text-xs font-bold tracking-widest uppercase" style={{ color: t.accentGold }}>Powered by AI</EditableText>
                        <Sparkles size={20} style={{ color: t.accentGold }} fill={t.accentGold} />
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black mb-2 leading-tight">
                        <EditableText style={{ color: t.accentLight }}>قرارات</EditableText> أذكى
                    </h2>
                    <EditableText as="p" className="text-gray-400 text-lg sm:text-xl font-bold">الذكاء الاصطناعي يشتغل لك</EditableText>
                </DraggableWrapper>

                {/* Central Visual - AI Suggestion Cards */}
                <div className="w-full max-w-sm flex flex-col gap-3 mt-4 relative">

                    {/* Brain Icon Floating */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-20 border-2 border-white/20" style={{ background: `linear-gradient(to bottom right, ${t.accentLight}, ${t.accent})` }}>
                        <Brain size={28} className="text-white" />
                    </div>

                    {/* Suggestion 1 */}
                    <DraggableWrapper id="card-aiinsights-1" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-start gap-3 mt-4">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: t.accentLight + '33' }}>
                            <TrendingUp size={16} style={{ color: t.accentLight }} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <EditableText className="text-sm font-black text-white">مبيعات البرجر ترتفع الخميس</EditableText>
                            <EditableText className="text-xs text-gray-400 font-bold">ننصح بزيادة المخزون 20% يوم الأربعاء</EditableText>
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold shrink-0" style={{ backgroundColor: t.accentLight + '33', color: t.accentLight }}>
                            اقتراح
                        </div>
                    </DraggableWrapper>

                    {/* Suggestion 2 - Highlighted */}
                    <DraggableWrapper id="card-aiinsights-2" className="bg-white shadow-2xl rounded-xl p-5 flex items-start gap-3 transform scale-105 border-r-4" style={{ borderColor: t.accentGold }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: t.accentGold + '33' }}>
                            <Lightbulb size={16} style={{ color: t.accentGold }} fill={t.accentGold} />
                        </div>
                        <div className="flex flex-col gap-1">
                            <EditableText className="text-sm font-black" style={{ color: t.primary }}>وفّر 15% من تكلفة المواد</EditableText>
                            <EditableText className="text-xs text-gray-500 font-bold">3 أصناف ممكن تشتريها من مورد أرخص</EditableText>
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold text-[#92400E] shrink-0" style={{ backgroundColor: t.accentGold + '33' }}>
                            توفير
                        </div>
                    </DraggableWrapper>

                    {/* Suggestion 3 */}
                    <DraggableWrapper id="card-aiinsights-3" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Zap size={16} className="text-purple-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <EditableText className="text-sm font-black text-white">ساعات الذروة: 1-3 مساءً</EditableText>
                            <EditableText className="text-xs text-gray-400 font-bold">أضف موظف إضافي لتسريع الخدمة</EditableText>
                        </div>
                        <div className="bg-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-purple-300 shrink-0">
                            تنبيه
                        </div>
                    </DraggableWrapper>

                </div>

                {/* Footer */}
                <DraggableWrapper id="footer-aiinsights" className="text-center mt-4">
                    <EditableText as="p" className="text-xs font-bold tracking-widest" style={{ color: t.accentLight }}>SYLO AI INSIGHTS</EditableText>
                </DraggableWrapper>

            </div>
      </div>
  );
}
