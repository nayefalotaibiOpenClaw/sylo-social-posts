import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Newspaper, Clock, Bookmark, TrendingUp } from 'lucide-react';

export default function AppStoreNewsPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryDark, fontFamily: t.font }}>
      {/* Dark gradient background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${t.primaryDark}, ${t.primary}, ${t.primaryDark})` }} />
      <div className="absolute top-[15%] left-0 w-[250px] h-[250px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6 text-white">
        {/* Badge */}
        <DraggableWrapper id="header-news">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.accent + '20' }}>
              <Newspaper size={18} style={{ color: t.accent }} />
            </div>
            <div>
              <EditableText className="text-xs font-bold opacity-80">PulseNews</EditableText>
              <EditableText className="text-[10px] font-bold opacity-40">News & Content</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-news" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryLight }}>
            Follow
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.accent }}>
            What
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-6xl' : 'text-5xl'} font-black leading-[0.95] tracking-tight`} style={{ color: t.primaryLight }}>
            Matters
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-40">
            Personalized news, curated for you
          </EditableText>
        </DraggableWrapper>

        {/* Phone mockup — large, bleeds off bottom */}
        <DraggableWrapper id="phone-news" variant="mockup" className="mt-auto flex justify-center -mb-16">
          <div className={`${isTall ? 'w-[380px]' : 'w-[320px]'} rounded-[2.5rem] border-[4px] border-white/15 overflow-hidden`} style={{ backgroundColor: t.primaryDark }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2">
              <span className="text-[10px] font-bold opacity-40">9:41</span>
              <div className="w-24 h-6 rounded-full bg-white/5" />
              <div className="w-4 h-2.5 rounded-sm bg-white/30" />
            </div>

            <div className="px-5 pb-8">
              {/* Topic pills */}
              <div className="flex gap-2 mb-4 overflow-hidden">
                {['All', 'Tech', 'Science', 'World'].map((topic, i) => (
                  <span key={i} className="text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap" style={{
                    backgroundColor: i === 0 ? t.accent : 'rgba(255,255,255,0.08)',
                    color: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
                  }}>{topic}</span>
                ))}
              </div>

              {/* Featured article */}
              <div className="rounded-2xl overflow-hidden mb-4" style={{ backgroundColor: t.accent + '15' }}>
                <div className="h-24 w-full" style={{ background: `linear-gradient(135deg, ${t.accent}30, ${t.accentLight}30)` }}>
                  <div className="w-full h-full flex items-center justify-center">
                    <TrendingUp size={28} style={{ color: t.accent }} />
                  </div>
                </div>
                <div className="p-4">
                  <span className="text-sm font-black block" style={{ color: t.primaryLight }}>AI Revolution Reshaping Industries</span>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[10px] font-bold opacity-30"><Clock size={10} />5 min read</span>
                    <Bookmark size={12} style={{ color: t.accent }} />
                  </div>
                </div>
              </div>

              {/* Article list */}
              {[
                { title: 'Climate Summit Key Outcomes', time: '3 min', category: 'World' },
                { title: 'SpaceX New Mission Launch', time: '4 min', category: 'Science' },
                { title: 'Crypto Market Rally Continues', time: '2 min', category: 'Finance' },
              ].map((article, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <Newspaper size={16} style={{ color: t.accentLight }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-bold block" style={{ color: t.primaryLight }}>{article.title}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold opacity-30">{article.time}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: t.accent + '20', color: t.accent }}>{article.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DraggableWrapper>
      </div>
    </div>
  );
}
