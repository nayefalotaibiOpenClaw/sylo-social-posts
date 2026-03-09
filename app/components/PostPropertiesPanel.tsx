"use client";

import React, { useMemo, useCallback, useState, useRef, useEffect } from "react";
import { Image as ImageIcon, Type, Upload, Loader2, ChevronDown } from "lucide-react";

/** Local-state input that debounces onChange calls */
function DebouncedTextarea({ value, onChange, ...props }: { value: string; onChange: (v: string) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value">) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Sync from parent when code updates externally
  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 400);
  };

  // Flush on blur
  const handleBlur = () => {
    clearTimeout(timer.current);
    if (local !== value) onChange(local);
  };

  return <textarea {...props} value={local} onChange={handleChange} onBlur={handleBlur} />;
}

function DebouncedInput({ value, onChange, ...props }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(v), 400);
  };

  const handleBlur = () => {
    clearTimeout(timer.current);
    if (local !== value) onChange(local);
  };

  return <input {...props} value={local} onChange={handleChange} onBlur={handleBlur} />;
}

/* ── Font size options ─────────────────────────────────── */
const FONT_SIZES = [
  { label: "XS", value: "text-xs" },
  { label: "SM", value: "text-sm" },
  { label: "Base", value: "text-base" },
  { label: "LG", value: "text-lg" },
  { label: "XL", value: "text-xl" },
  { label: "2XL", value: "text-2xl" },
  { label: "3XL", value: "text-3xl" },
  { label: "4XL", value: "text-4xl" },
  { label: "5XL", value: "text-5xl" },
  { label: "6XL", value: "text-6xl" },
  { label: "7XL", value: "text-7xl" },
  { label: "8XL", value: "text-8xl" },
  { label: "9XL", value: "text-9xl" },
];

/* ── Types ─────────────────────────────────────────────── */
interface ImageVar {
  type: "image";
  label: string;
  src: string;
  /** Full match for replacement */
  fullMatch: string;
}

interface TextVar {
  type: "text";
  /** Full opening tag + content + closing tag */
  fullMatch: string;
  /** Opening tag string */
  openTag: string;
  /** Text content between tags */
  content: string;
  /** Current font size class (e.g. text-4xl), or null */
  fontSize: string | null;
  /** Current inline color hex, or null */
  color: string | null;
}

interface PropVar {
  type: "prop";
  propName: string;
  value: string;
  before: string;
  after: string;
}

type ExtractedVar = ImageVar | TextVar | PropVar;

/* ── Extraction ────────────────────────────────────────── */
function extractVariables(code: string) {
  const images: ImageVar[] = [];
  const texts: TextVar[] = [];
  const props: PropVar[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;

  // 1. Images: <img ... src="URL" />
  const imgRe = /<img\s[^>]*?src="([^"]+)"/g;
  let imgIdx = 0;
  while ((m = imgRe.exec(code)) !== null) {
    const src = m[1];
    if (seen.has(src)) continue;
    seen.add(src);
    imgIdx++;
    images.push({ type: "image", label: `Image ${imgIdx}`, src, fullMatch: m[0] });
  }

  // Also device mockup src
  const devRe = /<(?:IPhoneMockup|IPadMockup|DesktopMockup)\s[^>]*?src="([^"]+)"/g;
  while ((m = devRe.exec(code)) !== null) {
    const src = m[1];
    if (seen.has(src)) continue;
    seen.add(src);
    imgIdx++;
    images.push({ type: "image", label: `Device ${imgIdx}`, src, fullMatch: m[0] });
  }

  // 2. EditableText elements — extract content + fontSize + color together
  const etRe = /(<EditableText[^>]*>)([^<]+)(<\/EditableText>)/g;
  while ((m = etRe.exec(code)) !== null) {
    const openTag = m[1];
    const content = m[2];
    if (!content.trim()) continue;
    const key = `et:${m.index}`;
    if (seen.has(key)) continue;
    seen.add(key);

    // Extract font size from className
    const fsMatch = openTag.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/);
    const fontSize = fsMatch ? `text-${fsMatch[1]}` : null;

    // Extract color from style={{ color: '#...' }}
    const colorMatch = openTag.match(/color:\s*['"]([#][0-9a-fA-F]{3,8})['"]/);
    const color = colorMatch ? colorMatch[1] : null;

    texts.push({
      type: "text",
      fullMatch: m[0],
      openTag,
      content,
      fontSize,
      color,
    });
  }

  // 3. String props on shared components
  const textPropNames = ["title", "subtitle", "label", "text", "value", "placeholder", "description", "heading", "name"];
  for (const prop of textPropNames) {
    const re = new RegExp(`(${prop}=")([^"]{2,})("(?:\\s|\\/>|>))`, "g");
    while ((m = re.exec(code)) !== null) {
      const value = m[2];
      if (value.startsWith("http") || value.startsWith("/") || value.startsWith("{") || value.startsWith("$")) continue;
      const key = `prop:${prop}:${value}`;
      if (seen.has(key)) continue;
      seen.add(key);
      props.push({ type: "prop", propName: prop, value, before: m[1], after: m[3] });
    }
  }

  return { images, texts, props };
}

/* ── Helpers ───────────────────────────────────────────── */
function replaceInCode(code: string, oldStr: string, newStr: string): string {
  return code.replace(oldStr, newStr);
}

/* ── Component ─────────────────────────────────────────── */
interface PostPropertiesPanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export default function PostPropertiesPanel({ code, onCodeChange, onUploadImage }: PostPropertiesPanelProps) {
  const { images, texts, props } = useMemo(() => extractVariables(code), [code]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  // ── Image handlers ──
  const handleImageReplace = useCallback(async (img: ImageVar, file: File) => {
    if (!onUploadImage) return;
    setUploadingFor(img.src);
    try {
      const url = await onUploadImage(file);
      if (url) {
        const newMatch = img.fullMatch.replace(img.src, url);
        onCodeChange(replaceInCode(code, img.fullMatch, newMatch));
      }
    } finally {
      setUploadingFor(null);
    }
  }, [code, onCodeChange, onUploadImage]);

  // ── Text content change ──
  const handleTextChange = useCallback((tv: TextVar, newContent: string) => {
    const newFull = tv.openTag + newContent + "</EditableText>";
    onCodeChange(replaceInCode(code, tv.fullMatch, newFull));
  }, [code, onCodeChange]);

  // ── Text color change ──
  const handleColorChange = useCallback((tv: TextVar, newColor: string) => {
    let newOpenTag = tv.openTag;
    if (tv.color) {
      // Replace existing color
      newOpenTag = newOpenTag.replace(
        new RegExp(`color:\\s*['"]${tv.color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}['"]`),
        `color: '${newColor}'`
      );
    } else if (/style=\{\{/.test(newOpenTag)) {
      // Add color to existing style
      newOpenTag = newOpenTag.replace("style={{", `style={{ color: '${newColor}',`);
    } else {
      // Add style prop before >
      newOpenTag = newOpenTag.slice(0, -1) + ` style={{ color: '${newColor}' }}>`;
    }
    const newFull = newOpenTag + tv.content + "</EditableText>";
    onCodeChange(replaceInCode(code, tv.fullMatch, newFull));
  }, [code, onCodeChange]);

  // ── Font size change ──
  const handleFontSizeChange = useCallback((tv: TextVar, newSize: string) => {
    let newOpenTag = tv.openTag;
    if (tv.fontSize) {
      newOpenTag = newOpenTag.replace(tv.fontSize, newSize);
    } else if (/className="/.test(newOpenTag)) {
      newOpenTag = newOpenTag.replace('className="', `className="${newSize} `);
    } else {
      newOpenTag = newOpenTag.slice(0, -1) + ` className="${newSize}">`;
    }
    const newFull = newOpenTag + tv.content + "</EditableText>";
    onCodeChange(replaceInCode(code, tv.fullMatch, newFull));
  }, [code, onCodeChange]);

  // ── Prop change ──
  const handlePropChange = useCallback((pv: PropVar, newValue: string) => {
    const oldStr = pv.before + pv.value + pv.after;
    const newStr = pv.before + newValue + pv.after;
    onCodeChange(replaceInCode(code, oldStr, newStr));
  }, [code, onCodeChange]);

  const hasContent = images.length > 0 || texts.length > 0 || props.length > 0;

  if (!hasContent) {
    return <div className="p-3 text-center text-gray-400 text-xs">No editable properties found</div>;
  }

  return (
    <div
      className="flex flex-col gap-4 p-3"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ── Images ── */}
      {images.length > 0 && (
        <Section icon={<ImageIcon size={13} />} title="Images">
          {images.map((img, i) => (
            <div key={`img-${i}`} className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-gray-400">{img.label}</label>
              <div className="relative group/img rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-16">
                <img src={img.src} className="w-full h-full object-cover" alt={img.label} />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <Upload size={11} className="inline mr-1" />
                    Replace
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageReplace(img, file);
                      e.target.value = "";
                    }} />
                  </label>
                </div>
                {uploadingFor === img.src && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}

      {/* ── Text Elements (each with its own color + font size) ── */}
      {texts.length > 0 && (
        <Section icon={<Type size={13} />} title="Content">
          {texts.map((tv, i) => (
            <TextRow
              key={`text-${i}`}
              tv={tv}
              onTextChange={handleTextChange}
              onColorChange={handleColorChange}
              onFontSizeChange={handleFontSizeChange}
            />
          ))}
        </Section>
      )}

      {/* ── Component Props ── */}
      {props.length > 0 && (
        <Section icon={<Type size={13} />} title="Properties">
          {props.map((pv, i) => (
            <div key={`prop-${i}`} className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium text-gray-400 capitalize">{pv.propName}</label>
              <DebouncedTextarea
                value={pv.value}
                onChange={(v) => handlePropChange(pv, v)}
                rows={pv.value.length > 50 ? 2 : 1}
                className="text-xs text-gray-700 bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-200 outline-none focus:border-gray-400 resize-none"
                dir={/[\u0600-\u06FF]/.test(pv.value) ? "rtl" : "ltr"}
              />
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

/* ── TextRow: a single text element with inline color + size controls ── */
function TextRow({ tv, onTextChange, onColorChange, onFontSizeChange }: {
  tv: TextVar;
  onTextChange: (tv: TextVar, v: string) => void;
  onColorChange: (tv: TextVar, c: string) => void;
  onFontSizeChange: (tv: TextVar, s: string) => void;
}) {
  const isRtl = /[\u0600-\u06FF]/.test(tv.content);

  return (
    <div className="flex flex-col gap-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
      {/* Text input */}
      <DebouncedTextarea
        value={tv.content}
        onChange={(v) => onTextChange(tv, v)}
        rows={tv.content.length > 50 ? 2 : 1}
        className="text-xs text-gray-700 bg-white rounded px-2 py-1.5 border border-gray-200 outline-none focus:border-gray-400 resize-none"
        dir={isRtl ? "rtl" : "ltr"}
      />
      {/* Controls row */}
      <div className="flex items-center gap-1.5">
        {/* Color picker */}
        <div className="flex items-center gap-1">
          <DebouncedInput
            type="color"
            value={tv.color || "#000000"}
            onChange={(v) => onColorChange(tv, v)}
            className="w-5 h-5 rounded border border-gray-200 cursor-pointer"
            title="Text color"
          />
          <span className="text-[9px] font-mono text-gray-400">{tv.color || "theme"}</span>
        </div>

        <div className="w-px h-4 bg-gray-200" />

        {/* Font size dropdown */}
        <select
          value={tv.fontSize || ""}
          onChange={(e) => onFontSizeChange(tv, e.target.value)}
          className="text-[10px] text-gray-600 bg-white rounded px-1 py-0.5 border border-gray-200 outline-none cursor-pointer"
          title="Font size"
        >
          {!tv.fontSize && <option value="">—</option>}
          {FONT_SIZES.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ── Section wrapper ───────────────────────────────────── */
function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-gray-400">{icon}</span>
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{title}</span>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}
