import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { MapPin, Store, ArrowLeftRight, Eye } from 'lucide-react';

export default function MultiBranchPost() {
  const t = useTheme();
  return (
      <div className="relative w-full max-w-[600px] aspect-square shadow-2xl overflow-hidden mx-auto bg-[#F9FAFB] font-sans" style={{ color: t.primary }}>

            {/* Background Map Dots */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                 style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '16px 16px'}}>
            </div>

            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-bl-full" style={{ backgroundColor: t.accentLight + '1a' }}></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 rounded-tr-full" style={{ backgroundColor: t.accent + '1a' }}></div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-8">

                {/* Header */}
                <DraggableWrapper id="headline-multibranch" className="text-center mt-4">
                    <h2 className="text-4xl sm:text-5xl font-black mb-2 leading-tight" style={{ color: t.primary }}>كل فروعك<br/><EditableText style={{ color: t.accent }}>بنظرة وحدة</EditableText></h2>
                    <EditableText as="p" className="text-gray-500 text-lg font-bold">تحكّم من مكان واحد</EditableText>
                </DraggableWrapper>

                {/* Central Visual - Branch Cards */}
                <div className="w-full max-w-sm relative mt-2">

                    {/* Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20">
                        <line x1="50%" y1="10%" x2="25%" y2="45%" stroke={t.primary} strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="10%" x2="75%" y2="45%" stroke={t.primary} strokeWidth="2" strokeDasharray="4 4" />
                        <line x1="50%" y1="10%" x2="50%" y2="70%" stroke={t.primary} strokeWidth="2" strokeDasharray="4 4" />
                    </svg>

                    {/* Main HQ Badge */}
                    <DraggableWrapper id="badge-multibranch" className="flex justify-center mb-6 relative z-10">
                        <div className="text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border-2" style={{ backgroundColor: t.primary, borderColor: t.accentLight + '4d' }}>
                            <Eye size={20} />
                            <EditableText className="font-black text-lg">لوحة التحكم</EditableText>
                        </div>
                    </DraggableWrapper>

                    {/* Branch Cards Grid */}
                    <div className="grid grid-cols-2 gap-3 relative z-10">

                        {/* Branch 1 */}
                        <DraggableWrapper id="card-multibranch-1" className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border-t-4" style={{ borderColor: t.primary }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight }}>
                                    <Store size={16} style={{ color: t.primary }} />
                                </div>
                                <EditableText className="font-black text-sm" style={{ color: t.primary }}>الفرع الرئيسي</EditableText>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                <MapPin size={10} />
                                <EditableText>السالمية</EditableText>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-black" style={{ color: t.primary }}>KD 920</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: t.primaryLight, color: t.accent }}>مفتوح</span>
                            </div>
                        </DraggableWrapper>

                        {/* Branch 2 */}
                        <DraggableWrapper id="card-multibranch-2" className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border-t-4" style={{ borderColor: t.accent }}>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight }}>
                                    <Store size={16} style={{ color: t.accent }} />
                                </div>
                                <EditableText className="font-black text-sm" style={{ color: t.primary }}>فرع الأفنيوز</EditableText>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                <MapPin size={10} />
                                <EditableText>الري</EditableText>
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-lg font-black" style={{ color: t.primary }}>KD 1,150</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: t.primaryLight, color: t.accent }}>مفتوح</span>
                            </div>
                        </DraggableWrapper>

                        {/* Branch 3 - Spans full width */}
                        <DraggableWrapper id="card-multibranch-3" className="col-span-2 bg-white rounded-xl shadow-lg p-4 flex items-center justify-between border-t-4" style={{ borderColor: t.accentLight }}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primaryLight }}>
                                    <Store size={16} style={{ color: t.accentLight }} />
                                </div>
                                <div className="flex flex-col">
                                    <EditableText className="font-black text-sm" style={{ color: t.primary }}>فرع الجهراء</EditableText>
                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                        <MapPin size={10} />
                                        <EditableText>الجهراء</EditableText>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-black" style={{ color: t.primary }}>KD 680</span>
                                <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">مغلق</span>
                            </div>
                        </DraggableWrapper>

                    </div>
                </div>

                {/* Footer */}
                <DraggableWrapper id="footer-multibranch" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mt-4 shadow-sm" style={{ backgroundColor: t.primaryLight, color: t.primary }}>
                    <ArrowLeftRight size={16} />
                    <EditableText>تنقّل بين الفروع بضغطة</EditableText>
                </DraggableWrapper>

            </div>
      </div>
  );
}
