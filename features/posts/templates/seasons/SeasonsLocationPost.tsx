import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter } from '@/app/components/shared';
import { MapPin } from 'lucide-react';

export default function SeasonsLocationPost() {
  const ratio = useAspectRatio();
  const t = useTheme();

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: 'white', fontFamily: t.font }}>
      
      {/* Abstract Map Background */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-loc" subtitle="NOW DELIVERING" badge={<><MapPin size={12}/> NEW AREA</>} variant="light" />

        <div className="flex-1 flex flex-col justify-center items-center text-center">
           <DraggableWrapper id="loc-pin" className="mb-6 relative">
              <div className="w-24 h-24 rounded-full animate-ping absolute inset-0 opacity-20" style={{ backgroundColor: t.accent }} />
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 shadow-xl" style={{ backgroundColor: t.primary, color: 'white' }}>
                 <MapPin size={48} fill="currentColor" />
              </div>
           </DraggableWrapper>

           <DraggableWrapper id="loc-content">
              <h2 className="text-4xl font-black mb-4" style={{ color: t.primary }}>
                 <EditableText>وصلنا لمدينة الرياض!</EditableText>
              </h2>
              <p className="text-xl font-bold opacity-70 mb-8 max-w-sm mx-auto">
                 <EditableText>الآن يمكنكم طلب أجمل باقات الورد لتصلكم أينما كنتم في العاصمة</EditableText>
              </p>
              <div className="inline-block px-8 py-3 rounded-full font-black text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: t.accent }}>
                 <EditableText>اطلب الآن</EditableText>
              </div>
           </DraggableWrapper>
        </div>

        <PostFooter id="seasons-loc" label="TRYSEASONS.CO" text="نتوسع لخدمتكم بشكل أفضل" variant="light" />
      </div>
    </div>
  );
}
