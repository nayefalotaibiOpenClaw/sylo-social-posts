export const LAYOUT_BLUEPRINTS = [
  {
    name: "Device Showcase",
    structure: "Dark gradient bg → dot/grid pattern overlay → 2 glow circles → PostHeader → headline (text-5xl with accent color second line) → centered device-aware mockup via useDeviceType() (isTall responsive) → 2 FloatingCards at opposite corners → PostFooter",
    decorations: "radial-gradient dots OR linear-gradient grid, 2 blur glow circles (accentLime + accent), gradient bg (primary → primaryDark)",
  },
  {
    name: "Hero Image Cinematic",
    structure: "Full-bleed <img> → gradient overlay (bottom-heavy) → PostHeader → flex-1 justify-end for bottom text → headline text-5xl → subtitle text-xl → PostFooter",
    decorations: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.4)). Image covers entire post, text floats at bottom.",
  },
  {
    name: "Light Product Showcase",
    structure: "White/primaryLight bg → soft gradient overlay → subtle glow circle → PostHeader → centered circular image frame (rounded-full, thick white border, ring) → absolute-positioned stat card → headline below image → PostFooter",
    decorations: "Soft gradient (primaryLight → white), one glow blob, clean white borders, drop shadows",
  },
  {
    name: "Bold Typography Only",
    structure: "Dark bg → pattern (dots or grid) → 2 glow circles → PostHeader → massive centered text (text-5xl to text-6xl) with accentLime keyword → decorative icon cluster → subtle body text → PostFooter",
    decorations: "Grid or dot pattern, 2+ glow circles, NO device mockups. Pure typography power. Maybe a subtle CSS-only shape.",
  },
  {
    name: "Split Cinematic",
    structure: "Half-visible background image (opacity-30, grayscale) → directional gradient (left-to-right) → PostHeader → flex-col justify-center max-w-sm → headline + body + FloatingCard row → PostFooter",
    decorations: "Image as subtle bg, strong directional gradient, text on one side, image bleeds through on other",
  },
  {
    name: "Card Grid Feature",
    structure: "Light bg → dot pattern → PostHeader → headline → 2x2 or 3-column grid of feature cards (each with icon + label + desc, themed borders) → PostFooter",
    decorations: "Each card: bg-white, shadow-lg, rounded-2xl, border with theme color, icon in colored circle. Subtle bg pattern.",
  },
  {
    name: "Magazine Cover",
    structure: "Full-bleed image → heavy bottom gradient → PostHeader transparent over image → large whitespace in middle → bottom section: headline + CTA badge → PostFooter",
    decorations: "Cinematic feel. Minimal text. Image is the star. Text at bottom like a magazine title.",
  },
  {
    name: "Geometric Abstract",
    structure: "Dark bg → abstract CSS shapes (rotated divs, circles, diagonal lines using transforms) → PostHeader → centered content → headline with creative word emphasis → icon accents → PostFooter",
    decorations: "CSS-only art: rotated rectangles with opacity, overlapping circles, diagonal stripes. Bold, modern, editorial feel.",
  },
];
