import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio, useEditMode } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Heart, Sparkles, Gift } from 'lucide-react';

export default function FloralBackgroundPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      {/* Main Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/background-flowers.jpg" 
          alt="Floral background" 
          className="w-full h-full object-cover"
        />
        {/* Dark Overlay to make text pop */}
        <div className="absolute inset-0 bg-black/40 z-10" />
        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 w-full h-full flex flex-col p-8 justify-between">
        
        <PostHeader id="floral" subtitle="SPECIAL OFFERS" badge={<><Gift size={12}/> REWARDS</>} variant="dark" />

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <DraggableWrapper id="headline-floral" className={`z-30 ${isEditMode ? '' : 'animate-reveal'}`}>
            <h2 className="text-5xl sm:text-6xl font-black leading-tight text-white mb-4 drop-shadow-lg">
              <EditableText>نمو يزهر..</EditableText> <br/>
              <span style={{ color: t.accentLime }}><EditableText>مع كل خطوة</EditableText></span>
            </h2>
            <p className={`text-xl font-bold text-white/90 drop-shadow-md max-w-sm mx-auto ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`}>
              <EditableText>كافئ عملائك الأوفياء بنظام ولاء ذكي يزيد من مبيعاتك بنسبة 35%</EditableText>
            </p>
          </DraggableWrapper>

          {/* Floating Accents */}
          <div className="relative w-full h-24 mt-8">
            <FloatingCard 
              id="stat-floral-loyal" 
              icon={<Heart size={16} className="text-red-400" />} 
              label="Loyal Customers" 
              value="+1,240" 
              className={`absolute left-1/4 -top-4 z-30 ${isEditMode ? '' : 'animate-float'}`} 
              rotate={-5}
            />
            <FloatingCard 
              id="stat-floral-sales" 
              icon={<Sparkles size={16} style={{ color: t.accentLime }} />} 
              label="Sales Boost" 
              value="+35%" 
              className={`absolute right-1/4 top-4 z-30 ${isEditMode ? '' : 'animate-float-slow'}`} 
              rotate={5}
              borderColor={t.accentLime}
            />
          </div>
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="floral" label="SYLO LOYALTY" text="اجعل علامتك التجارية الخيار الأول لعملائك" variant="dark" icon={<Heart size={24} style={{ color: t.accentLime }} />} />
        </div>
      </div>
    </div>
  );
}
