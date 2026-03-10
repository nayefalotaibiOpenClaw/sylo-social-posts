export const EXAMPLE_DARK_MOCKUP = `// EXAMPLE A: Dark bg + device-aware phone mockup + floating stats
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { useDeviceType } from './DeviceContext';
import { IPhoneMockup, IPadMockup, DesktopMockup, AndroidPhoneMockup, AndroidTabletMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { Cloud, Zap, Globe } from 'lucide-react';

export default function CloudPOSPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';
  const deviceType = useDeviceType();
  const DeviceMockup =
    deviceType === 'android' ? AndroidPhoneMockup :
    deviceType === 'ipad' ? IPadMockup :
    deviceType === 'android_tablet' ? AndroidTabletMockup :
    deviceType === 'desktop' ? DesktopMockup :
    IPhoneMockup;
  const isPhoneDevice = deviceType === 'iphone' || deviceType === 'android';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: \`linear-gradient(to bottom right, \${t.primary}, \${t.primaryDark})\` }} />
      <div className="absolute inset-0 opacity-[0.05]"
        style={{backgroundImage: \`radial-gradient(\${t.primaryLight} 1px, transparent 1px)\`, backgroundSize: '30px 30px'}} />
      <div className="absolute -top-20 -left-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />
      <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] opacity-[0.1] blur-[80px] rounded-full"
        style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="cloud-pos" subtitle="CLOUD TECHNOLOGY" badge={<><Cloud size={12}/> LIVE SYNC</>} variant="dark" />

        <DraggableWrapper id="headline" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>نظامك السحابي</EditableText><br/>
            <span style={{ color: t.accentLime }}><EditableText>في كل مكان</EditableText></span>
          </h2>
        </DraggableWrapper>

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isPhoneDevice ? (isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]') : (isTall ? 'w-[340px] h-[230px]' : 'w-[300px] h-[200px]')}\`}>
            <DeviceMockup src="/pos-screen.jpg" />
          </DraggableWrapper>
          <FloatingCard id="stat1" icon={<Zap size={16} style={{ color: t.accentLime }} />} label="السرعة" value="100%" className="absolute -left-4 top-20" rotate={-5} />
          <FloatingCard id="stat2" icon={<Globe size={16} style={{ color: t.accent }} />} label="وصول عالمي" value="24/7" className="absolute -right-8 bottom-32" rotate={8} />
        </div>

        <PostFooter id="cloud-pos" label="SYLO POS" text="أدر مطعمك من أي مكان في العالم" variant="dark" />
      </div>
    </div>
  );
}`;

export const EXAMPLE_HERO_IMAGE = `// EXAMPLE B: Full-bleed image + cinematic gradient + bottom text
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter } from './shared';
import { Heart, Sparkles } from 'lucide-react';

export default function HeroPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="hero" subtitle="PREMIUM FLOWERS" badge={<><Sparkles size={12}/> LUXURY</>} variant="dark" />
        <div className="flex-1 flex flex-col justify-end mb-12">
          <DraggableWrapper id="headline" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
              <EditableText>أجمل اللحظات</EditableText><br/>
              <span style={{ color: t.accentLime }}><EditableText>تبدأ بوردة</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-4 opacity-90">
              <EditableText>تشكيلات راقية لكل مناسباتكم السعيدة</EditableText>
            </p>
          </DraggableWrapper>
        </div>
        <PostFooter id="hero" label="SEASONS FLOWERS" text="نحتفل معكم بكل لحظة" icon={<Heart size={24} fill="currentColor"/>} variant="dark" />
      </div>
    </div>
  );
}`;

export const EXAMPLE_LIGHT_CREATIVE = `// EXAMPLE C: Light bg + circular image + subscription style
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter } from './shared';
import { Calendar, Sparkles } from 'lucide-react';

export default function SubscriptionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#fff', fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.4]"
        style={{ background: \`linear-gradient(to bottom, \${t.primaryLight}, white)\` }} />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.05] rounded-full blur-[100px]"
           style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="sub" subtitle="SUBSCRIPTIONS" badge={<><Calendar size={12}/> WEEKLY FRESH</>} variant="light" />
        <div className="flex-1 flex flex-col items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isTall ? 'w-[400px] h-[400px]' : 'w-[320px] h-[320px]'}\`}>
             <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-black/5">
                <img src="/seasons/3.jpg" className="w-full h-full object-cover" alt="Product" />
             </div>
          </DraggableWrapper>
          <DraggableWrapper id="stat" className="absolute -right-4 bottom-24 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 rotate-6" dir="rtl">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.accentLight }}>
                   <Sparkles size={20} style={{ color: t.accent }} />
                </div>
                <div>
                   <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>الاشتراك</p>
                   <p className="text-sm font-black" style={{ color: t.primary }}>يبدأ من 15 د.ك</p>
                </div>
             </div>
          </DraggableWrapper>
        </div>
        <DraggableWrapper id="headline" className="mt-8 text-right" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>جدد منزلك</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>بالورد الطبيعي</EditableText></span>
          </h2>
          <p className="text-lg font-bold opacity-70 mt-4" style={{ color: t.primary }}>
            <EditableText>اشتراكات أسبوعية تصلك طازجة إلى باب بيتك</EditableText>
          </p>
        </DraggableWrapper>
        <PostFooter id="sub" label="SEASONS SUBSCRIPTIONS" text="الجمال المستمر في حياتك" variant="light" />
      </div>
    </div>
  );
}`;

export const EXAMPLE_DARK_CORPORATE = `// EXAMPLE D: Dark cinematic + half-image + left-aligned text
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { PostHeader, PostFooter, FloatingCard } from './shared';
import { Briefcase, Building2 } from 'lucide-react';

export default function CorporatePost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: '#111', fontFamily: t.font }}>
      <img src="/seasons/2.jpg" className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale" alt="Corporate" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 100%)' }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8 text-white">
        <PostHeader id="corp" subtitle="CORPORATE GIFTS" badge={<><Briefcase size={12}/> BUSINESS</>} variant="dark" />
        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <DraggableWrapper id="text" className="text-right" dir="rtl">
            <h2 className="text-5xl font-black leading-tight">
               <EditableText>هدايا شركات</EditableText><br/>
               <span style={{ color: t.accentLime }}><EditableText>بلمسة احترافية</EditableText></span>
            </h2>
            <p className="text-xl font-bold mt-6 opacity-70">
               <EditableText>حلول متكاملة لهدايا الموظفين والعملاء</EditableText>
            </p>
          </DraggableWrapper>
          <div className="flex gap-4 mt-8">
             <FloatingCard id="card1" icon={<Building2 size={16} />} label="توصيل" value="للمكاتب" className="mt-4" rotate={-3} />
          </div>
        </div>
        <PostFooter id="corp" label="SEASONS BUSINESS" text="ارتقِ بعلاقاتك المهنية" variant="dark" />
      </div>
    </div>
  );
}`;

export const EXAMPLE_DESKTOP_ANALYTICS = `// EXAMPLE E: Light bg + Desktop mockup + analytics focus
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

export default function MenuEngineeringPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      <div className="absolute inset-0 opacity-[0.03]"
        style={{backgroundImage: \`radial-gradient(\${t.primary} 2px, transparent 2px)\`, backgroundSize: '20px 20px'}} />
      <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] opacity-[0.1] blur-[100px] rounded-full"
        style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="menu-eng" subtitle="RESTAURANT ANALYTICS" badge={<><TrendingUp size={12}/> PROFIT MAX</>} variant="light" />
        <DraggableWrapper id="headline" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>هندسة المنيو</EditableText><br/>
            <span style={{ color: t.accent }}><EditableText>لأرباح أعلى</EditableText></span>
          </h2>
        </DraggableWrapper>
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup" className={\`relative z-20 \${isTall ? 'w-full h-[350px]' : 'w-[360px] h-[240px]'}\`}>
            <DesktopMockup src="/pos-screen.jpg" url="admin.sylo.com/analytics" />
          </DraggableWrapper>
          <FloatingCard id="stat1" icon={<BarChart3 size={16} />} label="نمو الأرباح" value="+22%" className="absolute -right-4 top-4" rotate={5} />
          <FloatingCard id="stat2" icon={<PieChart size={16} />} label="الأكثر مبيعًا" value="برجر دبل" className="absolute -left-4 bottom-12" rotate={-5} />
        </div>
        <PostFooter id="menu-eng" label="SYLO ANALYTICS" text="حلل أداء أصنافك وارفع هوامش ربحك" variant="light" />
      </div>
    </div>
  );
}`;
