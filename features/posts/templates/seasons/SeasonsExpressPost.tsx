import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Truck, Zap, Smartphone } from 'lucide-react';

export default function SeasonsExpressPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.1]"
        style={{backgroundImage: `linear-gradient(${t.accent} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.accent} 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px'}} />
      
      {/* Dynamic movement lines (CSS only) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         {[...Array(6)].map((_, i) => (
           <div key={i} className="absolute h-[1px] bg-white/20 animate-pulse" 
                style={{ top: `${i * 20}%`, left: '-10%', width: '120%', transform: `rotate(-15deg)` }} />
         ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-express" subtitle="EXPRESS SERVICE" badge={<><Zap size={12}/> ULTRA FAST</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center relative">
          <DraggableWrapper id="img-express" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
             <div className="relative w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white/20 scale-110">
                <img src="/seasons/2.jpg" className="w-full h-full object-cover" alt="Fast Flowers" />
                <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/60 to-transparent" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-express-1" 
            icon={<Truck size={16} />} 
            label="توصيل سريع" 
            value="خلال 90 دقيقة" 
            className="absolute -right-12 top-24" 
            rotate={8} 
            borderColor={t.accentLime}
          />
          
          <FloatingCard 
            id="card-express-2" 
            icon={<Smartphone size={16} />} 
            label="بدون عنوان" 
            value="برقم الهاتف فقط" 
            className="absolute -left-12 bottom-20" 
            rotate={-5} 
            borderColor={t.accent}
          />
        </div>

        <DraggableWrapper id="text-express" className="mt-8 text-center">
          <h2 className="text-4xl font-black leading-tight text-white">
            <EditableText>هديتك تصل</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>بأسرع وقت</EditableText></span>
          </h2>
        </DraggableWrapper>

        <PostFooter id="seasons-express" label="SEASONS EXPRESS" text="لا تقلق بشأن الوقت أو العنوان" variant="dark" />
      </div>
    </div>
  );
}
