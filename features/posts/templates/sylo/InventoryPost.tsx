import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { Package, AlertTriangle, ArrowDownUp, CheckCircle } from 'lucide-react';

export default function InventoryPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-72 h-72 rounded-br-full" style={{ backgroundColor: t.accentLight + '1a' }}></div>
            <div className="absolute bottom-0 right-0 w-56 h-56 rounded-tl-full" style={{ backgroundColor: t.accent + '1a' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <DraggableWrapper id="headline-inventory" className="text-center mt-4">
                    <EditableText as="h2" className="text-4xl sm:text-5xl font-black mb-2" style={{ color: t.primary }}>مخزونك تحت السيطرة</EditableText>
                    <EditableText as="p" className="text-lg sm:text-xl font-bold" style={{ color: t.accent }}>تتبّع كل صنف بلحظته</EditableText>
                </DraggableWrapper>

                {/* Central Visual - Inventory Cards */}
                <div className="w-full max-w-sm flex flex-col gap-3 relative mt-4">

                    {/* Item 1 - Low Stock Warning */}
                    <DraggableWrapper id="card-inventory-1" className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-r-4 border-orange-400">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={20} className="text-orange-500" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black" style={{ color: t.primary }}>دجاج طازج</EditableText>
                                <EditableText className="text-xs text-orange-500 font-bold">مخزون منخفض</EditableText>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-orange-500">3</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">كرتون</EditableText>
                        </div>
                    </DraggableWrapper>

                    {/* Item 2 - Good Stock */}
                    <DraggableWrapper id="card-inventory-2" className="bg-white rounded-xl shadow-2xl p-5 flex items-center justify-between border-r-8 transform scale-105 z-10" style={{ borderColor: t.accent }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight }}>
                                <Package size={20} style={{ color: t.primary }} />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black" style={{ color: t.primary }}>خبز برجر</EditableText>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <CheckCircle size={10} style={{ color: t.accent }} />
                                    <EditableText className="text-xs font-bold" style={{ color: t.accent }}>متوفر</EditableText>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black" style={{ color: t.primary }}>48</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">كرتون</EditableText>
                        </div>
                    </DraggableWrapper>

                    {/* Item 3 - Out of Stock */}
                    <DraggableWrapper id="card-inventory-3" className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-r-4 border-red-400 opacity-70">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                                <Package size={20} className="text-red-400" />
                            </div>
                            <div className="flex flex-col">
                                <EditableText className="font-black line-through" style={{ color: t.primary }}>صوص سبايسي</EditableText>
                                <EditableText className="text-xs text-red-500 font-bold">نفذ - طلب تلقائي</EditableText>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-red-400">0</span>
                            <EditableText className="text-[10px] text-gray-400 font-bold">علبة</EditableText>
                        </div>
                    </DraggableWrapper>

                </div>

                {/* Footer */}
                <DraggableWrapper id="footer-inventory" className="flex gap-6 mt-4 opacity-70">
                    <div className="flex flex-col items-center gap-1">
                        <ArrowDownUp size={20} style={{ color: t.primary }} />
                        <EditableText className="text-[10px] font-bold">جرد تلقائي</EditableText>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <AlertTriangle size={20} style={{ color: t.primary }} />
                        <EditableText className="text-[10px] font-bold">تنبيهات ذكية</EditableText>
                    </div>
                </DraggableWrapper>

            </div>
      </div>
  );
}
