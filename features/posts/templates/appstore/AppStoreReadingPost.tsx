import React from 'react';
import EditableText from '@/app/components/EditableText';
import DraggableWrapper from '@/app/components/DraggableWrapper';
import { useAspectRatio } from '@/contexts/EditContext';
import { useTheme } from '@/contexts/ThemeContext';
import { BookOpen, Star, Bookmark } from 'lucide-react';

export default function AppStoreReadingPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" style={{ backgroundColor: t.primaryLight, fontFamily: t.font }}>
      {/* Light warm background */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(170deg, ${t.primaryLight}, #fff, ${t.primaryLight})` }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px]" style={{ backgroundColor: t.accent }} />

      <div className="relative z-10 w-full h-full flex flex-col p-6" style={{ color: t.primaryDark }}>
        {/* Badge */}
        <DraggableWrapper id="header-reading">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: t.accent }}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <EditableText className="text-xs font-bold" style={{ color: t.primaryDark }}>Readwise</EditableText>
              <EditableText className="text-[10px] font-bold opacity-40">Stories & Books</EditableText>
            </div>
          </div>
        </DraggableWrapper>

        {/* Headline */}
        <DraggableWrapper id="headline-reading" className="mt-6">
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight uppercase`} style={{ color: t.primaryDark }}>
            Explore
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight uppercase`} style={{ color: t.accent }}>
            Insightful
          </EditableText>
          <EditableText as="h1" className={`${isTall ? 'text-5xl' : 'text-4xl'} font-black leading-[0.95] tracking-tight uppercase`} style={{ color: t.primaryDark }}>
            Stories
          </EditableText>
          <EditableText as="p" className="text-sm font-bold mt-3 opacity-40">
            Curated collections for every mood
          </EditableText>
        </DraggableWrapper>

        {/* Phone mockup offset right — large, bleeds off bottom */}
        <DraggableWrapper id="phone-reading" variant="mockup" className="mt-auto flex justify-end -mr-2 -mb-20">
          <div className={`${isTall ? 'w-[380px]' : 'w-[320px]'} rounded-[2.5rem] border-[4px] overflow-hidden`} style={{ borderColor: t.border, backgroundColor: '#fff' }}>
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 pt-4 pb-2" style={{ color: t.primaryDark }}>
              <span className="text-[10px] font-bold opacity-40">9:41</span>
              <div className="w-24 h-6 rounded-full" style={{ backgroundColor: t.primaryDark + '10' }} />
              <div className="w-4 h-2.5 rounded-sm opacity-30" style={{ backgroundColor: t.primaryDark }} />
            </div>

            {/* Book list */}
            <div className="px-5 pb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-black" style={{ color: t.primaryDark }}>For You</span>
                <Bookmark size={18} style={{ color: t.accent }} />
              </div>

              {/* Featured book */}
              <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: t.accent + '12' }}>
                <div className="flex gap-4">
                  <div className="w-16 h-22 rounded-xl" style={{ backgroundColor: t.accent, minHeight: 80 }} />
                  <div className="flex-1">
                    <span className="text-base font-black block" style={{ color: t.primaryDark }}>The Silent Path</span>
                    <span className="text-xs font-bold opacity-40 block mt-1">Sarah Mitchell</span>
                    <div className="flex items-center gap-1 mt-2">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={12} fill={i <= 4 ? t.accentGold : 'transparent'} style={{ color: t.accentGold }} />
                      ))}
                      <span className="text-[10px] font-bold opacity-40 ml-1">4.8</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book list items */}
              {[
                { title: 'Midnight Garden', author: 'J. Park', color: t.accentOrange },
                { title: 'Ocean Whispers', author: 'L. Chen', color: t.accentGold },
                { title: 'City of Echoes', author: 'M. Reed', color: t.accentLight },
              ].map((book, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b" style={{ borderColor: t.primaryDark + '08' }}>
                  <div className="w-10 h-14 rounded-lg" style={{ backgroundColor: book.color }} />
                  <div className="flex-1">
                    <span className="text-sm font-bold block" style={{ color: t.primaryDark }}>{book.title}</span>
                    <span className="text-[10px] font-bold opacity-30">{book.author}</span>
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
