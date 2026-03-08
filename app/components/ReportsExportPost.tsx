import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { DesktopMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { FileSpreadsheet, Download, PieChart } from 'lucide-react';

export default function ReportsExportPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full max-w-[600px] aspect-square shadow-2xl rounded-xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Background */}
      <div className="absolute inset-0 opacity-[0.04]"
           style={{backgroundImage: `radial-gradient(${t.primary} 1px, transparent 1px)`, backgroundSize: '24px 24px'}} />
      <div className="absolute top-0 right-0 w-[350px] h-[350px] opacity-[0.06] blur-[100px] rounded-full -translate-y-1/4 translate-x-1/4"
           style={{ backgroundColor: t.accentLime }} />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] opacity-[0.08] blur-[80px] rounded-full translate-y-1/4 -translate-x-1/4"
           style={{ backgroundColor: t.accent }} />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="reports-export" subtitle="REPORTS CENTER" badge={<><FileSpreadsheet size={12}/> EXPORT</>} variant="light" />

        <DraggableWrapper id="headline-reports" className="mt-6 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primary }}>
            <EditableText>تقاريرك</EditableText> <br/>
            <span style={{ color: t.accent }}><EditableText>جاهزة دائماً</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-60" style={{ color: t.primary }}>
            <EditableText>صدّر بياناتك بضغطة زر — Excel، PDF، أو مباشرة للمحاسب</EditableText>
          </p>
        </DraggableWrapper>

        {/* Desktop Mockup */}
        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-reports" className={`relative z-20 transition-all duration-500 ${isTall ? 'w-full h-[320px]' : 'w-[360px] h-[240px]'}`}>
            <DesktopMockup src="/4.jpg" />
          </DraggableWrapper>

          <FloatingCard
            id="stat-reports-formats"
            icon={<Download size={16} style={{ color: t.accent }}/>}
            label="Export Formats"
            value="PDF / Excel"
            className="absolute -right-6 top-[15%] z-30"
            rotate={-2}
          />

          <FloatingCard
            id="stat-reports-auto"
            icon={<PieChart size={16} style={{ color: t.accentLime }}/>}
            label="Auto Reports"
            value="Scheduled"
            className="absolute -left-8 bottom-[20%] z-30"
            rotate={3}
            borderColor={t.accentLime}
          />
        </div>

        <PostFooter id="reports-export" label="SYLO REPORTS" text="بيانات دقيقة، قرارات أسرع" icon={<FileSpreadsheet size={24}/>} variant="light" />
      </div>
    </div>
  );
}
