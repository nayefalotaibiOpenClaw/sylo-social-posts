import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from '@/app/components/shared';
import { Truck, Package, ShoppingCart } from 'lucide-react';

export default function SupplierConnectPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      
      {/* Background decoration */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute inset-0 opacity-[0.1]"
        style={{backgroundImage: `radial-gradient(${t.accent} 1px, transparent 1px)`, backgroundSize: '40px 40px'}} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="supplier" subtitle="INVENTORY & SUPPLY" badge={<><Truck size={12}/> AUTO-REORDER</>} variant="dark" />

        <DraggableWrapper id="headline-supplier" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>مخزونك دائمًا</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>مكتمل</EditableText></span>
          </h2>
        </DraggableWrapper>

        {/* Mockup area */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-supplier" className={`relative z-20 ${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}`}>
            <IPhoneMockup src="/3.jpg" />
          </DraggableWrapper>
          
          <FloatingCard 
            id="stat-supplier-1" 
            icon={<Package size={16} />} 
            label="المنتجات" 
            value="1200" 
            className="absolute -left-12 top-24" 
            rotate={-8} 
          />
          
          <FloatingCard 
            id="stat-supplier-2" 
            icon={<ShoppingCart size={16} />} 
            label="طلب تلقائي" 
            value="نشط" 
            className="absolute -right-4 bottom-28" 
            rotate={5} 
          />
        </div>

        <PostFooter id="supplier" label="SYLO INVENTORY" text="ربط مباشر مع الموردين وإعادة طلب تلقائية" variant="dark" />
      </div>
    </div>
  );
}
