import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Heart, Activity } from 'lucide-react';

export default function SeasonsGetWellSoonPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#F0FDFA', fontFamily: t.font }}>
      
      {/* Background decoration with soft teal/green elements */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `radial-gradient(#14B8A6 1px, transparent 1px)`, backgroundSize: '30px 30px'}} />
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] opacity-[0.1] rounded-full blur-[100px]"
           style={{ backgroundColor: '#14B8A6' }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="seasons-gw" subtitle="GET WELL SOON" badge={<><Activity size={12}/> CARE PACKAGE</>} variant="light" />

        <div className="flex-1 flex items-center justify-center relative">
          <DraggableWrapper id="img-gw" className={`relative z-20 ${isTall ? 'w-[450px] h-[450px]' : 'w-[350px] h-[350px]'}`}>
             <div className="relative w-full h-full rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-black/5">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Get Well Soon Flowers" />
                <div className="absolute inset-0 bg-gradient-to-t from-teal-900/10 to-transparent" />
             </div>
          </DraggableWrapper>
          
          <FloatingCard 
            id="card-gw" 
            icon={<Heart size={16} fill="#14B8A6" stroke="#14B8A6" />} 
            label="سلامتك" 
            value="ما تشوف شر" 
            className="absolute -right-4 bottom-24" 
            rotate={6} 
            borderColor="#14B8A6"
          />
        </div>

        <DraggableWrapper id="text-gw" className="mt-8 text-right" dir="rtl">
          <h2 className="text-4xl font-black leading-tight" style={{ color: '#0F172A' }}>
            <EditableText>سلامتكم تهُمنا</EditableText><br/>
            <span style={{ color: '#0D9488' }}><EditableText>باقة ورد تشافي الروح</EditableText></span>
          </h2>
        </DraggableWrapper>

        <PostFooter id="seasons-gw" label="SEASONS CARE" text="ورد طبيعي يبعث الأمل والشفاء" variant="light" />
      </div>
    </div>
  );
}
