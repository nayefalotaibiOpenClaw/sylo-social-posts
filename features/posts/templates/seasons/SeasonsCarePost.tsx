import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function SeasonsCarePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      
      {/* Background with soft colors */}
      <div className="absolute inset-0 opacity-[0.4]"
        style={{ background: `linear-gradient(to top right, ${t.primaryLight}, white)` }} />
      
      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-care" subtitle="QUALITY CARE" badge={<><ShieldCheck size={12}/> PREMIUM STANDARD</>} variant="light" />

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <DraggableWrapper id="img-care" className={`relative z-20 ${isTall ? 'w-[450px] h-[450px]' : 'w-[350px] h-[350px]'}`}>
             <div className="relative w-full h-full rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-black/5">
                <img src="/seasons/2.jpg" className="w-full h-full object-cover" alt="Quality Care" />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 to-transparent" />
             </div>
          </DraggableWrapper>
          
          <DraggableWrapper id="care-floating" className="absolute -left-4 bottom-20 bg-white p-6 rounded-3xl shadow-2xl border border-gray-50 flex items-center gap-4 rotate-[-4deg] z-30" dir="rtl">
             <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                <Sparkles size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">جودة سيزونز</p>
                <p className="text-base font-black text-gray-900 leading-tight">ورد طبيعي يدوم<br/>لأطول فترة ممكنة</p>
             </div>
          </DraggableWrapper>
        </div>

        <DraggableWrapper id="text-care" className="mt-8 text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>بكل حب، نهتم</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بكل تفصيل</EditableText></span>
          </h2>
        </DraggableWrapper>

        <PostFooter id="seasons-care" label="SEASONS QUALITY" text="سيزونز - التميز في كل وردة" icon={<Heart size={24}/>} variant="light" />
      </div>
    </div>
  );
}
