import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPadMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Layout, Users, Star } from 'lucide-react';

export default function TableManagementPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: `linear-gradient(${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, ${t.primaryLight} 0.5px, transparent 0.5px)`, backgroundSize: '25px 25px'}} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="table-mgmt" subtitle="RESTAURANT OPS" badge={<><Layout size={12}/> FLOOR PLAN</>} variant="dark" />

        <DraggableWrapper id="headline-table-mgmt" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>خريطة طاولات</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>ذكية ومرنة</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-table-mgmt" className={`relative z-20 ${isTall ? 'w-full h-[300px]' : 'w-[320px] h-[220px]'}`}>
            <IPadMockup src="/pos-screen.jpg" orientation="landscape" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-table-1" 
            icon={<Users size={16} />} 
            label="الإشغال" 
            value="92%" 
            className="absolute -right-4 top-12" 
            rotate={4} 
          />
          
          <FloatingCard 
            id="stat-table-2" 
            icon={<Star size={16} />} 
            label="الخدمة" 
            value="5.0" 
            className="absolute -left-4 bottom-20" 
            rotate={-3} 
          />
        </div>

        <PostFooter id="table-mgmt" label="SYLO OPERATIONS" text="تحكم كامل في مساحة مطعمك وتوزيع الطاولات" variant="dark" />
      </div>
    </div>
  );
}
