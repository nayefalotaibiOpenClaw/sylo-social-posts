import React, { useMemo } from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';

type LayoutType = 'split' | 'centered' | 'floating' | 'grid' | 'minimal';

interface UniversalPostProps {
  layout?: LayoutType;
  imagePath?: string;
  hasGlassmorphism?: boolean;
  ornamentType?: 'flowers' | 'geometric' | 'none';
}

export default function SeasonsUniversalPost({ 
  layout = 'centered', 
  imagePath = '/seasons/1.jpg',
  hasGlassmorphism = true,
  ornamentType = 'flowers'
}: UniversalPostProps) {
  const t = useTheme();

  // Generative Background Blobs
  const blobs = useMemo(() => [
    { left: '-10%', top: '20%', size: '300px', color: t.primary, opacity: 0.15 },
    { right: '-5%', bottom: '10%', size: '250px', color: t.accent, opacity: 0.1 },
  ], [t]);

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-3xl overflow-hidden mx-auto"
         style={{ backgroundColor: 'white', fontFamily: t.font }}>
      
      {/* 1. BACKGROUND ENGINE */}
      <div className="absolute inset-0 z-0">
        {blobs.map((b, i) => (
          <div key={i} className="absolute rounded-full blur-[80px]" 
               style={{ ...b, backgroundColor: b.color, width: b.size, height: b.size }} />
        ))}
      </div>

      {/* 2. LAYOUT ENGINE */}
      <div className={`relative z-10 w-full h-full flex p-8 ${
        layout === 'centered' ? 'flex-col items-center justify-center text-center' :
        layout === 'split' ? 'flex-row items-center gap-8' : 
        'flex-col justify-between'
      }`}>
        
        <PostHeader id="universal" subtitle="CREATIVE ENGINE" variant="light" />

        <div className={`flex-1 flex w-full ${layout === 'centered' ? 'flex-col items-center justify-center' : 'items-center'}`}>
          
          {/* IMAGE CONTAINER WITH DYNAMIC MASK */}
          <DraggableWrapper id="universal-img" className={`relative ${layout === 'centered' ? 'w-48 h-48 mb-6' : 'w-1/2 h-4/5'}`}>
            <div className="w-full h-full overflow-hidden shadow-2xl transition-all duration-700 hover:rotate-3"
                 style={{ 
                   borderRadius: layout === 'centered' ? '50%' : '2rem',
                   border: `8px solid ${t.primaryLight}`
                 }}>
              <img src={imagePath} className="w-full h-full object-cover" alt="Visual" />
            </div>
            {/* FLOATING ORNAMENT */}
            {ornamentType === 'flowers' && (
              <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-bounce"
                   style={{ backgroundColor: t.accent, color: 'white' }}>
                🌸
              </div>
            )}
          </DraggableWrapper>

          {/* CONTENT WITH GLASSMORPHISM OPTION */}
          <DraggableWrapper id="universal-content" className={`
            ${layout === 'centered' ? 'max-w-md' : 'flex-1'} 
            ${hasGlassmorphism ? 'backdrop-blur-md bg-white/30 p-6 rounded-3xl border border-white/50' : ''}
          `}>
            <h2 className="text-4xl font-black leading-tight mb-4" style={{ color: t.primary }}>
              <EditableText>تصميم لا حدود له</EditableText>
            </h2>
            <p className="text-lg font-bold opacity-70" dir="rtl">
              <EditableText>هذا التصميم تم إنشاؤه عبر محرك سيزونز الإبداعي الذي يسمح بتغيير الأنماط والألوان والخطوط بضغطة زر واحدة.</EditableText>
            </p>
          </DraggableWrapper>
        </div>

        <PostFooter id="universal" label="TRYSEASONS.CO" variant="light" />
      </div>

      {/* NOISE OVERLAY FOR TEXTURE */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] contrast-150 brightness-100" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
    </div>
  );
}
