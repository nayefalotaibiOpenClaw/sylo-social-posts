import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Briefcase, Building2 } from 'lucide-react';

export default function SeasonsCorporatePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#111', fontFamily: t.font }}>
      
      {/* Visual background with dark-themed photo */}
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" alt="Corporate Gifting" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 100%)' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="seasons-corp" subtitle="CORPORATE GIFTS" badge={<><Briefcase size={12}/> BUSINESS SOLUTIONS</>} variant="dark" />

        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <DraggableWrapper id="text-corp" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
               <EditableText>هدايا شركات</EditableText><br/>
               <span style={{ color: t.accentLime }}><EditableText>بلمسة احترافية</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-6 opacity-70">
               <EditableText>حلول متكاملة لهدايا الموظفين والعملاء والمناسبات الرسمية</EditableText>
            </p>
          </DraggableWrapper>
          
          <div className="flex gap-4 mt-8">
             <FloatingCard 
              id="card-corp-1" 
              icon={<Building2 size={16} />} 
              label="توصيل" 
              value="للمكاتب" 
              className="mt-4" 
              rotate={-3} 
            />
          </div>
        </div>

        <PostFooter id="seasons-corp" label="SEASONS BUSINESS" text="ارتقِ بعلاقاتك المهنية مع سيزونز" variant="dark" />
      </div>
    </div>
  );
}
