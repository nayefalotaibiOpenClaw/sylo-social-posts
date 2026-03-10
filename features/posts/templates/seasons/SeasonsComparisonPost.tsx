import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export default function SeasonsComparisonPost() {
  const ratio = useAspectRatio();
  const t = useTheme();

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: 'white', fontFamily: t.font }}>
      
      <div className="absolute inset-y-0 left-1/2 w-0.5 z-20" style={{ backgroundColor: t.primaryLight }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-compare" subtitle="CHOOSE YOUR LEVEL" badge={<><ArrowLeftRight size={12}/> OPTIONS</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center my-6">
           <DraggableWrapper id="compare-title" className="text-center mb-8">
              <h2 className="text-3xl font-black" style={{ color: t.primary }}>
                 <EditableText>باقات تناسب جميع المناسبات</EditableText>
              </h2>
           </DraggableWrapper>

           <div className="grid grid-cols-2 h-[300px] gap-0">
              <div className="relative group overflow-hidden flex flex-col items-center pt-8 bg-gray-50 rounded-l-3xl">
                 <img src="/seasons/1.jpg" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white mb-4" />
                 <h3 className="text-xl font-black" style={{ color: t.primary }}><EditableText>الكلاسيكية</EditableText></h3>
                 <div className="mt-4 flex flex-col items-center gap-1 opacity-60">
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> <EditableText>15 وردة جوري</EditableText></div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> <EditableText>تغليف راقي</EditableText></div>
                 </div>
                 <div className="mt-auto pb-4 text-xl font-black" style={{ color: t.accent }}><EditableText>199 ر.س</EditableText></div>
              </div>

              <div className="relative group overflow-hidden flex flex-col items-center pt-8 bg-rose-50 rounded-r-3xl">
                 <img src="/seasons/2.jpg" className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-white mb-4" />
                 <h3 className="text-xl font-black" style={{ color: t.primary }}><EditableText>الفاخرة</EditableText></h3>
                 <div className="mt-4 flex flex-col items-center gap-1 opacity-80" style={{ color: t.primary }}>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> <EditableText>30 وردة جوري</EditableText></div>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><CheckCircle2 size={12} /> <EditableText>تنسيق فاخر</EditableText></div>
                 </div>
                 <div className="mt-auto pb-4 text-xl font-black" style={{ color: t.accent }}><EditableText>349 ر.س</EditableText></div>
                 <div className="absolute top-4 right-4 bg-rose-900 text-white text-[10px] font-bold px-2 py-1 rounded-full"><EditableText>أفضل قيمة</EditableText></div>
              </div>
           </div>
        </div>

        <PostFooter id="seasons-compare" label="SEASONS FLOWERS" text="اختر ما يناسبك" variant="light" />
      </div>
    </div>
  );
}
