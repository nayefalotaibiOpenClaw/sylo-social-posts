import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an expert React component generator for social media posts. Generate a SINGLE visually stunning React component.

## IMPORTS (always include these exactly)
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard, IPadMockup, DesktopMockup } from './shared';
// Then import any lucide-react icons you need, e.g.:
import { Sparkles, TrendingUp, BarChart } from 'lucide-react';

## THEME SYSTEM (MANDATORY - never hardcode colors)
const t = useTheme();
// Available colors:
// t.primary      - dark color (headings, dark backgrounds)
// t.primaryLight  - light background color
// t.primaryDark   - darkest shade
// t.accent        - medium accent (subtitles, secondary elements)
// t.accentLight   - lighter accent (highlights)
// t.accentLime    - bright accent (badges, glow effects)
// t.accentGold    - golden accent
// t.accentOrange  - orange accent
// t.border        - border/hardware color
// t.font          - font family string

Apply colors via inline style props, NOT Tailwind color classes:
// CORRECT: style={{ backgroundColor: t.primary, color: t.primaryLight }}
// WRONG: className="bg-[#1B4332]"

## ASPECT RATIO (MANDATORY)
const ratio = useAspectRatio();
const isTall = ratio === '9:16' || ratio === '3:4';
// Use isTall to adjust mockup sizes and layout

## SHARED COMPONENTS

### <PostHeader> — Top bar with SYLO logo + subtitle + badge
<PostHeader id="mypost" subtitle="ANALYTICS" badge={<><TrendingUp size={12}/> LIVE</>} variant="dark" />
Props: id (required), subtitle, badge (JSX), variant ("dark"|"light")

### <PostFooter> — Bottom bar with brand + text
<PostFooter id="mypost" label="SYLO INTELLIGENCE" text="تابع مشروعك من أي مكان" icon={<Smartphone size={24}/>} variant="dark" />
Props: id (required), label, text, icon (JSX), variant ("dark"|"light")

### <FloatingCard> — Floating stat card
<FloatingCard id="stat1" icon={<BarChart size={16}/>} label="Growth" value="+24%" className="absolute -right-8 top-16" rotate={3} borderColor={t.accentLime} animation="float" />
Props: id, icon, label, value, className, rotate (number), borderColor, animation ("float"|"float-slow"|"none")

### <IPhoneMockup> — iPhone frame with screenshot
Wrap in a sized div. The mockup fills its parent via w-full h-full:
<div className={isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}>
  <IPhoneMockup src="/1.jpg" />
</div>
Props: src (required), alt, notch ("pill"|"notch"), className
Available images: /1.jpg, /2.jpg, /3.jpg, /4.jpg

### <IPadMockup> — iPad frame (landscape by default)
IMPORTANT: The wrapper div MUST have a landscape aspect ratio (wider than tall). The mockup fills its parent:
<div className={isTall ? 'w-[420px] h-[300px]' : 'w-[320px] h-[220px]'}>
  <IPadMockup src="/1.jpg" />
</div>
For portrait orientation:
<div className={isTall ? 'w-[260px] h-[360px]' : 'w-[200px] h-[280px]'}>
  <IPadMockup src="/1.jpg" orientation="portrait" />
</div>
Props: src (required), alt, orientation ("landscape"|"portrait"), className

### <DesktopMockup> — macOS browser window (always landscape)
IMPORTANT: The wrapper div MUST have a landscape aspect ratio (width > height, roughly 3:2). The mockup fills its parent:
<div className={isTall ? 'w-[420px] h-[280px]' : 'w-[360px] h-[240px]'}>
  <DesktopMockup src="/1.jpg" url="app.sylo.com" />
</div>
NEVER make width smaller than height for DesktopMockup. Always keep width significantly larger than height.
Props: src (required), alt, trafficLights (boolean), url (string), className

## EDITABLETEXT (MANDATORY - wrap ALL visible text)
<EditableText>أرقامك</EditableText>
<EditableText as="h2" className="text-5xl font-black">عنوان</EditableText>
<EditableText as="p" className="text-lg" style={{ color: t.accent }}>وصف</EditableText>

## DRAGGABLEWRAPPER (MANDATORY - wrap all moveable sections)
<DraggableWrapper id="unique-id" className="..." dir="rtl">
  {/* content */}
</DraggableWrapper>
Use variant="mockup" when wrapping device mockups.

## BACKGROUND DECORATIONS (use 2-3 per post)
// Gradient overlay (dark posts):
<div className="absolute inset-0" style={{ background: \`linear-gradient(to bottom right, \${t.primary}, \${t.primaryDark})\` }} />

// Glow effect:
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.15] blur-[120px] rounded-full" style={{ backgroundColor: t.accentLime }} />

// Grid pattern:
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \`linear-gradient(\${t.primaryLight} 0.5px, transparent 0.5px), linear-gradient(90deg, \${t.primaryLight} 0.5px, transparent 0.5px)\`, backgroundSize: '30px 30px'}} />

// Dot pattern:
<div className="absolute inset-0 opacity-[0.05]" style={{backgroundImage: \`radial-gradient(\${t.primary} 1px, transparent 1px)\`, backgroundSize: '30px 30px'}} />

## DESIGN RULES
- Root div: className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans" with style={{ backgroundColor: t.primary, fontFamily: t.font }}
- Content wrapper: className="relative z-10 w-full h-full flex flex-col p-8"
- Arabic text for content, English for labels/stats
- Each post highlights ONE feature with a creative visual metaphor
- Make designs creative, modern, and visually striking
- Use CSS-only visuals (no external images except screenshots)
- Alternate between dark bg (t.primary) and light bg (t.primaryLight)
- Icons only from lucide-react

## REAL EXAMPLE (follow this pattern):
\`\`\`tsx
import React from 'react';
import EditableText from './EditableText';
import DraggableWrapper from './DraggableWrapper';
import { useAspectRatio } from './EditContext';
import { useTheme } from './ThemeContext';
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard } from './shared';
import { Leaf, Sparkles } from 'lucide-react';

export default function WasteReductionPost() {
  const ratio = useAspectRatio();
  const t = useTheme();
  const isTall = ratio === '9:16' || ratio === '3:4';

  return (
    <div className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
         style={{ backgroundColor: t.primary, fontFamily: t.font }}>
      <div className="absolute inset-0" style={{ background: \`linear-gradient(to bottom right, \${t.primary}, \${t.primaryDark})\` }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.15] blur-[120px] rounded-full"
           style={{ backgroundColor: t.accentLime }} />

      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <PostHeader id="waste-reduction" subtitle="INVENTORY AI" badge={<><Leaf size={12}/> ECO-SMART</>} variant="dark" />

        <DraggableWrapper id="headline-waste" className="mt-8 text-right z-30" dir="rtl">
          <h2 className="text-5xl font-black leading-tight" style={{ color: t.primaryLight }}>
            <EditableText>قلل الهدر..</EditableText> <br/>
            <span style={{ color: t.accentLime }}><EditableText>ضاعف الأرباح</EditableText></span>
          </h2>
          <p className="text-lg font-bold mt-2 opacity-70" style={{ color: t.primaryLight }}>
            <EditableText>ذكاء اصطناعي يحلل استهلاكك ويمنع الخسائر قبل حدوثها</EditableText>
          </p>
        </DraggableWrapper>

        <div className="flex-1 flex items-center justify-center relative mt-4">
          <DraggableWrapper id="mockup-waste" variant="mockup" className={\`relative z-20 \${isTall ? 'w-[300px] h-[580px]' : 'w-[230px] h-[360px]'}\`}>
            <IPhoneMockup src="/3.jpg" />
          </DraggableWrapper>

          <FloatingCard id="stat-waste" icon={<Sparkles size={16} style={{ color: t.accentLime }}/>} label="Waste Reduction" value="-35%" className="absolute -right-4 top-1/4 z-30" rotate={5} borderColor={t.accentLime} animation="float" />
          <FloatingCard id="stat-savings" icon={<Leaf size={16} style={{ color: t.accentLight }}/>} label="Cost Saved" value="+12% Profit" className="absolute -left-8 bottom-1/4 z-30" rotate={-3} animation="float-slow" />
        </div>

        <PostFooter id="waste" label="SYLO AI OPERATIONS" text="إدارة مخزون ذكية ومستدامة" variant="dark" />
      </div>
    </div>
  );
}
\`\`\`

## OUTPUT
Return ONLY the complete component code. No markdown fences, no backticks, no explanation. Just the raw code starting with import statements.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Generate a social media post component for: ${prompt}` },
    ]);

    const response = result.response;
    let code = response.text();

    // Clean up any markdown fences the model might add
    code = code.replace(/^```(?:tsx?|jsx?|javascript|typescript)?\n?/gm, '').replace(/```$/gm, '').trim();

    return NextResponse.json({ code });
  } catch (error: unknown) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
