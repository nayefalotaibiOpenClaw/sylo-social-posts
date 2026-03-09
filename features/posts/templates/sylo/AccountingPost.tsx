import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { Receipt, TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';

export default function AccountingPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto text-white font-sans" style={{ backgroundColor: t.primary }}>
            {/* Background */}
            <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primary}, ${t.primaryDark})` }}></div>
            <div className="absolute inset-0 opacity-5"
                 style={{backgroundImage: `linear-gradient(${t.accentLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accentLight} 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px'}}>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <DraggableWrapper id="headline-accounting" className="text-center mt-6">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2 leading-tight" style={{ color: t.primaryLight }}>حساباتك واضحة</EditableText>
                    <EditableText as="p" className="text-lg sm:text-xl font-bold" style={{ color: t.accentLight }}>أرباح، مصاريف، وتقارير لحظية</EditableText>
                </DraggableWrapper>

                {/* Central Visual - Financial Dashboard */}
                <div className="w-full max-w-sm flex flex-col gap-4 mt-4">

                    {/* Revenue & Expenses Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Revenue */}
                        <DraggableWrapper id="card-accounting-1" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <EditableText className="text-xs text-gray-300 font-bold">الإيرادات</EditableText>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: t.accent }}>
                                    <TrendingUp size={14} />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">4,820</span>
                            <EditableText className="text-[10px] font-bold" style={{ color: t.accentLight }}>KD هذا الشهر</EditableText>
                        </DraggableWrapper>

                        {/* Expenses */}
                        <DraggableWrapper id="card-accounting-2" className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <EditableText className="text-xs text-gray-300 font-bold">المصروفات</EditableText>
                                <div className="w-6 h-6 bg-red-500/80 rounded-md flex items-center justify-center">
                                    <TrendingDown size={14} />
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white">1,350</span>
                            <EditableText className="text-[10px] text-red-300 font-bold">KD هذا الشهر</EditableText>
                        </DraggableWrapper>
                    </div>

                    {/* Profit Card */}
                    <DraggableWrapper id="card-accounting-3" className="bg-white rounded-xl p-5 shadow-2xl flex items-center justify-between transform scale-105" style={{ color: t.primary }}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.primaryLight }}>
                                <DollarSign size={24} style={{ color: t.primary }} />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="text-xs text-gray-500 font-bold">صافي الربح</EditableText>
                                <span className="text-3xl font-black" style={{ color: t.primary }}>3,470 <span className="text-sm">KD</span></span>
                            </div>
                        </div>
                        <div className="px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1" style={{ backgroundColor: t.primaryLight, color: t.accent }}>
                            <TrendingUp size={12} />
                            <span>+18%</span>
                        </div>
                    </DraggableWrapper>

                    {/* Recent Transactions */}
                    <DraggableWrapper id="card-accounting-4" className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <EditableText className="text-xs text-gray-300 font-bold">آخر المعاملات</EditableText>
                            <ArrowRight size={14} className="text-gray-400" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Receipt size={14} style={{ color: t.accentLight }} />
                                    <EditableText className="font-bold text-gray-200">فاتورة #1042</EditableText>
                                </div>
                                <span className="font-bold" style={{ color: t.accentLight }}>+85 KD</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Receipt size={14} className="text-red-300" />
                                    <EditableText className="font-bold text-gray-200">مشتريات مواد</EditableText>
                                </div>
                                <span className="text-red-300 font-bold">-220 KD</span>
                            </div>
                        </div>
                    </DraggableWrapper>

                </div>

                {/* Footer */}
                <DraggableWrapper id="footer-accounting" className="text-center opacity-80 mt-2">
                    <EditableText as="p" className="text-xs font-bold tracking-widest" style={{ color: t.accentLight }}>SYLO ACCOUNTING</EditableText>
                </DraggableWrapper>

            </div>
      </div>
  );
}
