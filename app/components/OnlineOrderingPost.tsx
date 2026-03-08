import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio, useEditMode } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { ShoppingBag, Sparkles, Heart, MousePointer2 } from 'lucide-react';

export default function OnlineOrderingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isEditMode = useEditMode();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom right, ${t.primary}, ${t.primaryDark})` }} />
      
      {/* Dynamic particles style */}
      <div className="absolute inset-0 opacity-[0.1]">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`absolute rounded-full ${isEditMode ? '' : 'animate-pulse-slow'}`}
            style={{ 
              top: `${15 + i * 15}%`, 
              left: `${10 + (i % 3) * 25}%`, 
              width: '4px', 
              height: '4px', 
              backgroundColor: t.accentLime,
              animationDelay: `${i * 0.5}s`
            }} 
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="ordering" subtitle="ONLINE STORE" badge={<><ShoppingBag size={12}/> BRANDED</>} variant="dark" />

        <DraggableWrapper id="headline-ordering" className={`mt-8 text-right z-30 ${isEditMode ? '' : 'animate-reveal'}`} dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>متجرك..</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>بلمسة واحدة</EditableText></span>
          </h2>
          <p className={`text-lg font-bold mt-2 opacity-70 ${isEditMode ? '' : 'animate-reveal animate-stagger-1'}`} style={{ color: t.primaryLight }}>
            <EditableText>موقع لطلب الطعام بهوية مطعمك، عمولة 0%، وتحكم كامل بالمنيو</EditableText>
          </p>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-ordering" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'} ${isEditMode ? '' : 'animate-zoom-in animate-stagger-2'}`}>
            <IPhoneMockup src="/4.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-order-fee" 
            icon={<Heart size={16} style={{ color: t.accentLime }}/>} 
            label="Order Commission" 
            value="0% Fee" 
            className={`absolute -right-6 top-1/4 z-30 ${isEditMode ? '' : 'animate-slide-left animate-stagger-3'}`} 
            borderColor={t.accentLime}
            animation={isEditMode ? "none" : "float"}
          />

          {/* Interaction indicator */}
          <div className={`absolute bottom-1/4 left-1/4 z-30 pointer-events-none opacity-80 ${isEditMode ? 'hidden' : 'animate-bounce-slow animate-stagger-4'}`}>
            <MousePointer2 size={32} style={{ color: t.accentLime }} fill="currentColor" className="transform -rotate-12" />
          </div>

          <FloatingCard 
            id="stat-order-growth" 
            icon={<Sparkles size={16} style={{ color: t.accentGold }}/>} 
            label="Direct Sales" 
            value="+45% Growth" 
            className={`absolute -left-8 bottom-1/3 z-30 ${isEditMode ? '' : 'animate-slide-right animate-stagger-4'}`} 
            rotate={-5}
            animation={isEditMode ? "none" : "float-slow"}
          />
        </div>

        <div className={isEditMode ? '' : 'animate-reveal animate-stagger-4'}>
          <PostFooter id="ordering" label="SYLO DIRECT" text="استقبل طلباتك مباشرة ووفر رسوم المنصات" variant="dark" />
        </div>
      </div>
    </div>
  );
}
