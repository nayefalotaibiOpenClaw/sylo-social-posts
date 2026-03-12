"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Zap, Compass, Palette, Image, Flame, Layers, Type, LayoutGrid, MessageSquare, FileText } from "lucide-react";

// ─── Engine data ───

const ENGINES = [
  {
    key: "classic",
    label: "C",
    name: "Classic",
    version: 5,
    color: "#1B4332",
    icon: <Zap size={20} />,
    tagline: "Production-proven, most reliable",
    creativity: 1,
    control: 5,
    description:
      "The original deployed engine. Uses the older system prompt with separate device mockup components (IPhoneMockup, IPadMockup, DesktopMockup). Gets assigned a specific layout blueprint AND copy angle. Most predictable and consistent results.",
    whatItGets: [
      "Assigned layout blueprint (e.g. 'Device Showcase', 'Hero Image Cinematic')",
      "Assigned copy angle (e.g. 'Emotional storytelling', 'Bold provocation')",
      "Brand context via buildDynamicPrompt() — name, assets, website info, logo",
      "Reference code examples (2-4 based on asset types)",
    ],
    whatItDoesnt: [
      "Cannot choose its own layout — must follow the assigned blueprint",
      "Cannot choose its own copy angle — must follow the assigned tone",
      "No design guide / design principles",
      "No mood variations",
    ],
    systemPrompt: {
      name: "CLASSIC_SYSTEM_PROMPT",
      lines: 84,
      highlights: [
        "Uses old mockup components: IPhoneMockup, IPadMockup, DesktopMockup (separate, not unified)",
        "No overflow-hidden on content wrapper",
        "Hardcoded mockup sizes: 'w-[200px] h-[400px]' etc.",
        "Same component rules: EditableText, DraggableWrapper, useTheme, useAspectRatio",
        "Decoration toolkit: gradients, dots, grid, glow circles, image overlay",
      ],
      snippet: `You are an elite social media post designer. Generate a SINGLE visually stunning React/TSX component.

## CRITICAL RULES
1. EVERY post must use useAspectRatio() and conditionally size elements with isTall
2. EVERY visible text must be wrapped in <EditableText>
3. EVERY content section must be wrapped in <DraggableWrapper>
4. NEVER hardcode colors — always use the theme system
5. Root div: className="relative w-full h-full shadow-2xl overflow-hidden mx-auto font-sans"
6. Content wrapper: className="relative z-10 w-full h-full flex flex-col p-8"
   ❌ No overflow-hidden here (vs Guided/Creative/Free which add it)
7. Text sizing: MINIMUM text-4xl for headlines
8. Export exactly ONE component

## SHARED COMPONENTS
- IPhoneMockup, IPadMockup, DesktopMockup (OLD — separate components)
- PostHeader, PostFooter, FloatingCard, EditableText, DraggableWrapper`,
    },
    userPrompt: {
      template: `Generate a social media post for: {prompt}

## YOUR CREATIVE DIRECTION
Layout: "{layout.name}" — {layout.structure}
Decorations: {layout.decorations}

## YOUR COPY ANGLE: {angle}
{angle.instruction}

Create something stunning and original. Match the quality of the reference examples.`,
      notes: "Identical to Guided (v1) except it uses the old system prompt. Both get layout + angle assigned.",
    },
    contextInjection: "buildDynamicPrompt() — Brand info, assets (grouped by type with usage instructions), reference examples, company context, layout rules. Appended to system prompt.",
  },
  {
    key: "guided",
    label: "G",
    name: "Guided",
    version: 1,
    color: "#2D6A4F",
    icon: <Compass size={20} />,
    tagline: "New prompt system, same control level",
    creativity: 2,
    control: 5,
    description:
      "Uses the newer, more detailed system prompt with unified MockupFrame component and overflow prevention. Still gets assigned a layout blueprint + copy angle like Classic, but with better instructions for consistent results.",
    whatItGets: [
      "Assigned layout blueprint (same 24 layouts as Classic)",
      "Assigned copy angle (same 8 angles as Classic)",
      "Brand context via buildDynamicPrompt()",
      "Reference code examples (2-4 based on asset types)",
    ],
    whatItDoesnt: [
      "Cannot choose its own layout",
      "Cannot choose its own copy angle",
      "No design guide / design principles",
      "No mood variations",
    ],
    systemPrompt: {
      name: "SYSTEM_PROMPT",
      lines: 129,
      highlights: [
        "Uses unified MockupFrame component (auto-detects phone/tablet/desktop)",
        "Content wrapper has overflow-hidden (prevents content from bleeding out)",
        "Detailed mockup layout rules: 'MockupFrame MUST be inside flex-1 min-h-0'",
        "Overflow prevention section: MAX 2 cards for 1:1, MAX 4 for 9:16",
        "Non-mockup post layout guide",
        "More detailed FloatingCard positioning rules",
      ],
      snippet: `You are an elite social media post designer. Generate a SINGLE visually stunning React/TSX component.

## CRITICAL RULES (same 8 rules as Classic, but...)
6. Content wrapper: className="relative z-10 w-full h-full flex flex-col p-8 overflow-hidden"
   ✅ Has overflow-hidden (prevents content bleed)

## SHARED COMPONENTS
- MockupFrame (NEW — unified, auto-detects device type)
- PostHeader, PostFooter, FloatingCard, EditableText, DraggableWrapper

## MOCKUP POST LAYOUT (NEW — mandatory structure)
<div className="flex-1 min-h-0 flex items-center justify-center relative">
  <MockupFrame id="mockup" src={url} />
  <FloatingCard ... className="absolute left-0 top-4" />
</div>

## OVERFLOW PREVENTION (NEW section)
- flex-1 min-h-0 to shrink when space is tight
- MAX 2 feature cards for 1:1, MAX 4 for 9:16
- Font sizes scale with isTall
- NEVER set fixed heights on content containers`,
    },
    userPrompt: {
      template: `Generate a social media post for: {prompt}

## YOUR CREATIVE DIRECTION
Layout: "{layout.name}" — {layout.structure}
Decorations: {layout.decorations}

## YOUR COPY ANGLE: {angle}
{angle.instruction}

Create something stunning and original. Match the quality of the reference examples.`,
      notes: "Same user prompt as Classic. The only difference is the system prompt is newer/better.",
    },
    contextInjection: "Same buildDynamicPrompt() as Classic — brand, assets, examples, company context.",
  },
  {
    key: "creative",
    label: "Cr",
    name: "Creative",
    version: 2,
    color: "#40916C",
    icon: <Palette size={20} />,
    tagline: "Copy direction only, AI picks the layout",
    creativity: 3,
    control: 3,
    description:
      "Uses the same new system prompt as Guided, but the user prompt only assigns a copy angle — NO layout blueprint. The AI is told to choose its own layout, decorations, and visual approach freely.",
    whatItGets: [
      "Assigned copy angle (one of 8 angles)",
      "Brand context via buildDynamicPrompt()",
      "Reference code examples",
      "Freedom to pick any layout",
    ],
    whatItDoesnt: [
      "No assigned layout blueprint — picks its own",
      "No mood variations",
      "No per-post asset assignment",
    ],
    systemPrompt: {
      name: "SYSTEM_PROMPT",
      lines: 129,
      highlights: [
        "Exact same system prompt as Guided (v1)",
        "Same MockupFrame, overflow-hidden, all the detailed rules",
        "The difference is entirely in the USER prompt",
      ],
      snippet: `(Same as Guided — SYSTEM_PROMPT with 129 lines)
The system prompt is identical. Only the user prompt changes.`,
    },
    userPrompt: {
      template: `Generate a social media post for: {prompt}

## YOUR COPY ANGLE: {angle}
{angle.instruction}

Choose your own layout, decorations, and visual approach. Be creative and original — you are NOT restricted to any specific layout template. Use mockups, cards, typography, images, or any combination that best fits the prompt. Match the quality of the reference examples.`,
      notes: "No layout assigned. AI gets a writing tone but decides the visual design itself. More variety but less predictable.",
    },
    contextInjection: "Same buildDynamicPrompt() as Guided/Classic.",
  },
  {
    key: "free",
    label: "F",
    name: "Free",
    version: 3,
    color: "#52B788",
    icon: <Image size={20} />,
    tagline: "Asset-driven, builds around your images",
    creativity: 4,
    control: 2,
    description:
      "No layout blueprint, no copy angle. Instead, each post gets a FEATURED ASSET assigned — the AI reads the image metadata (label, description, AI analysis) and builds the entire post around that image. If no assets are uploaded, falls back to full creative freedom.",
    whatItGets: [
      "A featured asset per post (rotated: post 1 gets asset 1, post 2 gets asset 2, etc.)",
      "Full asset metadata: label, description, AI analysis",
      "Brand context via buildDynamicPrompt()",
      "Complete creative freedom for layout",
    ],
    whatItDoesnt: [
      "No layout blueprint",
      "No copy angle",
      "No mood variations",
      "If no assets uploaded, has zero direction beyond the prompt",
    ],
    systemPrompt: {
      name: "SYSTEM_PROMPT",
      lines: 129,
      highlights: [
        "Same system prompt as Guided and Creative",
        "The difference is entirely in the user prompt",
        "Assets become the creative anchor instead of layouts/angles",
      ],
      snippet: `(Same as Guided — SYSTEM_PROMPT with 129 lines)
The system prompt is identical. The user prompt drives asset-first design.`,
    },
    userPrompt: {
      template: `Generate a social media post for: {prompt}

## FEATURED ASSET — build this post around this image
Type: {asset.type}
URL: {asset.url}
Label: {asset.label}
Description: {asset.description}
AI Analysis: {asset.aiAnalysis}

Read the asset metadata above carefully. Use it to craft a post that highlights what this image shows. Write headlines and copy that connect the image content to the brand's message. Choose a layout that makes this image the hero element.

You have complete creative freedom for layout, decorations, and visual approach. The only rules are the component structure and theme system.`,
      notes: "Each post in a batch gets a different featured asset. If generating 4 posts with 4 assets, each post is built around a unique image. If no assets, falls back to: 'You have complete creative freedom. Surprise me.'",
    },
    contextInjection: "Same buildDynamicPrompt(). Assets are also featured individually in the user prompt.",
  },
  {
    key: "wild",
    label: "W",
    name: "Wild",
    version: 4,
    color: "#74C69D",
    icon: <Flame size={20} />,
    tagline: "Maximum creativity, minimal rules",
    creativity: 5,
    control: 1,
    description:
      "Completely different system prompt. No shared component documentation (no MockupFrame, PostHeader, PostFooter, FloatingCard). Instead, teaches the AI HOW to design with visual hierarchy principles, typography rules, color theory, and layout principles. Each post gets a unique mood direction. Assets are shuffled per-post for variety.",
    whatItGets: [
      "A random mood per post (8 moods: Bold & dramatic, Minimal & elegant, Energetic & vibrant, etc.)",
      "Shuffled assets per post (different order each time, first marked as featured)",
      "Design Guide: visual hierarchy, typography, color usage, layout principles, common mistakes",
      "Complete freedom — no component docs, no layout blueprints, no copy angles",
    ],
    whatItDoesnt: [
      "No PostHeader, PostFooter, FloatingCard, MockupFrame documentation",
      "No layout blueprints",
      "No copy angles",
      "No reference code examples",
      "No buildDynamicPrompt() — context is built differently per-post",
    ],
    systemPrompt: {
      name: "WILD_SYSTEM_PROMPT",
      lines: 129,
      highlights: [
        "COMPLETELY DIFFERENT system prompt from others",
        "No shared component docs — just EditableText, DraggableWrapper, useTheme, useAspectRatio",
        "Design Guide: Visual Hierarchy, Typography, Color Usage, Layout Principles, Decorations",
        "Common Mistakes to Avoid section",
        'What Makes a Post Look Professional section',
        "Teaches design PRINCIPLES instead of giving COMPONENTS",
        "Context built per-post with shuffled assets for variety",
      ],
      snippet: `You are a world-class social media designer. Create a stunning React/TSX post component.

## WHAT YOU HAVE
- EditableText, DraggableWrapper, useAspectRatio, useTheme
- lucide-react icons
  ❌ No MockupFrame, PostHeader, PostFooter, FloatingCard docs

## DESIGN GUIDE (unique to Wild)
### Visual Hierarchy
- ONE dominant element per post
- Clear reading order: top→bottom or right→left (Arabic)
- White space is your friend

### Typography
- Headlines: text-4xl to text-6xl, 2-5 words max
- Never use more than 2 font sizes per post

### Color Usage
- Use ONE accent color for emphasis — never mix multiple accents
- Decorative elements: keep them subtle, opacity 0.05-0.15

### Layout Principles
- Vertical rhythm: header → content → footer
- Cards/features: max 2 for square, max 3-4 for tall

### Common Mistakes to Avoid
- Too much text
- Too many competing elements
- Fixed sizes that break at different ratios`,
    },
    userPrompt: {
      template: `Topic: {prompt}

Creative direction: {mood}
(e.g. "Bold & dramatic — big typography, strong contrast, dark background, powerful single statement")

Featured image for this post — make it the hero:
Image: {asset.url} ({asset.type})
What it shows: {asset.label}
Details: {asset.description}
Analysis: {asset.aiAnalysis}

Write UNIQUE headline text and copy — do NOT reuse generic phrases. Invent a fresh, specific headline that fits the topic and mood above. Every post must have completely different text content.`,
      notes: "Minimal user prompt. Just: topic + mood + featured asset. The AI's design education (from the system prompt) does the heavy lifting.",
    },
    contextInjection: "Per-post context built in buildWildSystemPrompt(). Assets shuffled differently for each post. First asset marked with ⭐ to encourage it as hero. Brand name and language injected directly.",
  },
];

const MOODS = [
  "Bold & dramatic — big typography, strong contrast, dark background, powerful single statement",
  "Minimal & elegant — lots of white space, light background, delicate typography, understated luxury",
  "Energetic & vibrant — bright accent colors, dynamic angles, playful layout, movement and energy",
  "Editorial & sophisticated — magazine-style layout, refined typography, structured grid, premium feel",
  "Warm & emotional — soft gradients, warm tones, personal touch, heartfelt message",
  "Modern & geometric — clean shapes, asymmetric layout, tech-inspired, contemporary design",
  "Organic & natural — flowing shapes, soft curves, nature-inspired decorations, calming mood",
  "Retro & bold — chunky text, strong borders, nostalgic feel, eye-catching patterns",
];

const COPY_ANGLES = [
  { angle: "Emotional storytelling", instruction: "Tell a micro-story. Use 'imagine...', 'picture this...'. Focus on feelings, not features." },
  { angle: "Bold provocation", instruction: "Challenge the status quo. Provocative question or surprising stat." },
  { angle: "Aspirational vision", instruction: "Paint the dream outcome. 'From X to Y' narrative." },
  { angle: "Social proof / authority", instruction: "Imply trust and scale. Impressive numbers, community size." },
  { angle: "Urgency / scarcity", instruction: "Create FOMO. Limited offer, seasonal, exclusive." },
  { angle: "Behind the scenes", instruction: "Show the craft, the process, the care." },
  { angle: "Comparison / contrast", instruction: "Before vs after. Old way vs new way." },
  { angle: "Celebration / joy", instruction: "Celebrate moments, milestones, seasons." },
];

const LAYOUTS_SUMMARY = [
  "Device Showcase", "Hero Image Cinematic", "Light Product Showcase", "Bold Typography Only",
  "Split Cinematic", "Card Grid Feature", "Magazine Cover", "Geometric Abstract",
  "Product Spotlight", "Price Tag Offer", "New Arrival Announcement", "Food Hero Menu",
  "Lifestyle Full-Bleed", "Product Color Match", "Sale Banner Bold", "Framed Product Gallery",
  "Cinematic Close-Up", "Cinematic Top-Down", "Cinematic Story Tall", "Cinematic Dual Tone",
  "Lifestyle Behind Text", "Lifestyle Split Half", "Lifestyle Polaroid", "Lifestyle Mood Board",
];

// ─── Components ───

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className="h-2 w-5 rounded-full transition-colors"
          style={{ backgroundColor: i < value ? color : "#e5e7eb" }}
        />
      ))}
    </div>
  );
}

function Collapsible({ title, icon, children, defaultOpen = false }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors text-left">
        {icon}
        <span className="text-sm font-bold text-gray-800 dark:text-neutral-300 flex-1">{title}</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      {open && <div className="p-4 text-sm text-gray-700 dark:text-neutral-300 space-y-3">{children}</div>}
    </div>
  );
}

function EngineCard({ engine, isSelected, onSelect }: { engine: typeof ENGINES[0]; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
        isSelected ? "border-gray-900 dark:border-white shadow-lg scale-[1.02]" : "border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: engine.color }}>
          {engine.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-gray-900 dark:text-white">{engine.name}</span>
            <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">v{engine.version}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: engine.color + "15", color: engine.color }}>{engine.label}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-neutral-400">{engine.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Creativity</p>
          <Bar value={engine.creativity} max={5} color={engine.color} />
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Control</p>
          <Bar value={engine.control} max={5} color={engine.color} />
        </div>
      </div>

      <p className="text-xs text-gray-600 dark:text-neutral-400 leading-relaxed">{engine.description}</p>
    </div>
  );
}

// ─── Main Page ───

export default function EnginesPage() {
  const [selected, setSelected] = useState("classic");
  const engine = ENGINES.find((e) => e.key === selected)!;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-neutral-800 px-6 py-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">AI Engine Comparison</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400">Compare the 5 generation engines — their prompts, what they control, and how they differ.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick comparison table */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-gray-50 dark:bg-neutral-900">
                <th className="text-left px-4 py-3 font-bold text-gray-600 dark:text-neutral-400 text-xs uppercase tracking-wider">Feature</th>
                {ENGINES.map((e) => (
                  <th key={e.key} className="text-center px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: e.color }}>{e.label}</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-neutral-300">{e.name}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800">
              <tr>
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Layout assigned?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{["classic", "guided"].includes(e.key) ? "✅ Yes" : "❌ No"}</td>
                ))}
              </tr>
              <tr className="bg-gray-50/50 dark:bg-neutral-900/50">
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Copy angle?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{["classic", "guided", "creative"].includes(e.key) ? "✅ Yes" : "❌ No"}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Featured asset per post?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{["free", "wild"].includes(e.key) ? "✅ Yes" : "❌ No"}</td>
                ))}
              </tr>
              <tr className="bg-gray-50/50 dark:bg-neutral-900/50">
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Mood direction?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{e.key === "wild" ? "✅ Yes" : "❌ No"}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Design guide?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{e.key === "wild" ? "✅ Yes" : "❌ No"}</td>
                ))}
              </tr>
              <tr className="bg-gray-50/50 dark:bg-neutral-900/50">
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Reference examples?</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5">{e.key === "wild" ? "❌ No" : "✅ Yes"}</td>
                ))}
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">System prompt</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5 text-xs font-mono">{e.systemPrompt.name}<br /><span className="text-gray-400">{e.systemPrompt.lines} lines</span></td>
                ))}
              </tr>
              <tr className="bg-gray-50/50 dark:bg-neutral-900/50">
                <td className="px-4 py-2.5 font-medium text-gray-700 dark:text-neutral-300">Shared components</td>
                {ENGINES.map((e) => (
                  <td key={e.key} className="text-center px-4 py-2.5 text-xs">
                    {e.key === "classic" ? "Old (separate mockups)" : e.key === "wild" ? "Minimal (no shared)" : "New (MockupFrame)"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Engine selector cards */}
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Select an engine to explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-10">
          {ENGINES.map((e) => (
            <EngineCard
              key={e.key}
              engine={e}
              isSelected={selected === e.key}
              onSelect={() => setSelected(e.key)}
            />
          ))}
        </div>

        {/* Selected engine detail */}
        <div className="border-2 border-gray-900 dark:border-white rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg" style={{ backgroundColor: engine.color }}>
              {engine.icon}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{engine.name} <span className="text-gray-400 text-base">v{engine.version}</span></h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400">{engine.tagline}</p>
            </div>
          </div>

          {/* What it gets / doesn't */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h3 className="text-sm font-black text-green-800 mb-2">What the AI receives</h3>
              <ul className="space-y-1.5">
                {engine.whatItGets.map((item, i) => (
                  <li key={i} className="text-xs text-green-700 flex gap-2">
                    <span className="shrink-0">✅</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="text-sm font-black text-red-800 mb-2">What the AI does NOT get</h3>
              <ul className="space-y-1.5">
                {engine.whatItDoesnt.map((item, i) => (
                  <li key={i} className="text-xs text-red-700 flex gap-2">
                    <span className="shrink-0">❌</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Prompts */}
          <Collapsible title={`System Prompt — ${engine.systemPrompt.name} (${engine.systemPrompt.lines} lines)`} icon={<FileText size={16} className="text-gray-500" />} defaultOpen>
            <div className="space-y-2 mb-3">
              {engine.systemPrompt.highlights.map((h, i) => (
                <div key={i} className="flex gap-2 text-xs">
                  <span className="shrink-0 text-blue-500">→</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">{engine.systemPrompt.snippet}</pre>
          </Collapsible>

          <Collapsible title="User Prompt Template" icon={<MessageSquare size={16} className="text-gray-500" />} defaultOpen>
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs leading-relaxed overflow-x-auto whitespace-pre-wrap">{engine.userPrompt.template}</pre>
            <p className="text-xs text-gray-500 mt-2 italic">{engine.userPrompt.notes}</p>
          </Collapsible>

          <Collapsible title="Context Injection" icon={<Layers size={16} className="text-gray-500" />}>
            <p className="text-sm">{engine.contextInjection}</p>
          </Collapsible>
        </div>

        {/* Shared resources */}
        <div className="mt-10 space-y-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Shared Resources</h2>

          <Collapsible title={`Copy Angles (${COPY_ANGLES.length}) — used by Classic, Guided, Creative`} icon={<Type size={16} className="text-gray-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COPY_ANGLES.map((a, i) => (
                <div key={i} className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-800 dark:text-neutral-300 mb-1">{a.angle}</p>
                  <p className="text-[11px] text-gray-500 dark:text-neutral-400">{a.instruction}</p>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title={`Layout Blueprints (${LAYOUTS_SUMMARY.length}) — used by Classic, Guided`} icon={<LayoutGrid size={16} className="text-gray-500" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {LAYOUTS_SUMMARY.map((l, i) => (
                <div key={i} className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 dark:text-neutral-300">
                  {i + 1}. {l}
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible title={`Wild Moods (${MOODS.length}) — used by Wild only`} icon={<Flame size={16} className="text-gray-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MOODS.map((m, i) => (
                <div key={i} className="bg-gray-50 dark:bg-neutral-900 rounded-lg px-3 py-2.5 text-xs text-gray-700 dark:text-neutral-300">
                  <span className="font-bold">{m.split("—")[0].trim()}</span>
                  <span className="text-gray-400"> — {m.split("—")[1]?.trim()}</span>
                </div>
              ))}
            </div>
          </Collapsible>
        </div>

        {/* Flow diagram */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">How Each Engine Builds the Prompt</h2>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            {ENGINES.map((e) => (
              <div key={e.key} className="rounded-xl border border-gray-200 dark:border-neutral-800 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ backgroundColor: e.color }}>{e.label}</span>
                  <span className="text-sm font-black text-gray-800 dark:text-neutral-300">{e.name}</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "System", value: e.key === "wild" ? "WILD_SYSTEM_PROMPT" : e.key === "classic" ? "CLASSIC_SYSTEM_PROMPT" : "SYSTEM_PROMPT" },
                    { label: "+ Context", value: e.key === "wild" ? "Per-post (shuffled assets)" : "buildDynamicPrompt()" },
                    { label: "+ Layout", value: ["classic", "guided"].includes(e.key) ? "Assigned blueprint" : "—" },
                    { label: "+ Angle", value: ["classic", "guided", "creative"].includes(e.key) ? "Assigned angle" : "—" },
                    { label: "+ Asset", value: ["free", "wild"].includes(e.key) ? "Featured per-post" : "Listed in context" },
                    { label: "+ Mood", value: e.key === "wild" ? "Random mood" : "—" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-gray-400 w-16 shrink-0">{row.label}</span>
                      <span className={row.value === "—" ? "text-gray-300 dark:text-neutral-600" : "text-gray-700 dark:text-neutral-300 font-medium"}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
