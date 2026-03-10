export const LAYOUT_BLUEPRINTS = [
  {
    name: "Device Showcase",
    structure: "Dark gradient bg → dot/grid pattern overlay → 2 glow circles → PostHeader → headline (isTall ? text-5xl : text-4xl, with accent color second line) → flex-1 min-h-0 centered device-aware mockup via useDeviceType() (isTall responsive) → 2 FloatingCards at opposite corners → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "radial-gradient dots OR linear-gradient grid, 2 blur glow circles (accentLime + accent), gradient bg (primary → primaryDark)",
  },
  {
    name: "Hero Image Cinematic",
    structure: "Full-bleed <img> → gradient overlay (bottom-heavy) → PostHeader → flex-1 min-h-0 justify-end for bottom text → headline (isTall ? text-5xl : text-4xl) → subtitle text-lg → PostFooter. Works well at all ratios since image covers everything.",
    decorations: "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.4)). Image covers entire post, text floats at bottom.",
  },
  {
    name: "Light Product Showcase",
    structure: "White/primaryLight bg → soft gradient overlay → subtle glow circle → PostHeader → flex-1 min-h-0 centered circular image frame (isTall ? w-[400px] h-[400px] : w-[280px] h-[280px], rounded-full, thick white border, ring) → absolute-positioned stat card → headline below image → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "Soft gradient (primaryLight → white), one glow blob, clean white borders, drop shadows",
  },
  {
    name: "Bold Typography Only",
    structure: "Dark bg → pattern (dots or grid) → 2 glow circles → PostHeader → flex-1 min-h-0 flex items-center justify-center → massive centered text (isTall ? text-6xl : text-5xl) with accentLime keyword → decorative icon cluster (max 3 icons) → subtle body text → PostFooter. NO cards. Minimal content — typography is the star.",
    decorations: "Grid or dot pattern, 2+ glow circles, NO device mockups. Pure typography power. Maybe a subtle CSS-only shape.",
  },
  {
    name: "Split Cinematic",
    structure: "Half-visible background image (opacity-30, grayscale) → directional gradient (left-to-right) → PostHeader → flex-1 min-h-0 flex-col justify-center max-w-sm → headline + body + 1 FloatingCard → PostFooter. Keep content minimal — just headline, subtitle, and one card.",
    decorations: "Image as subtle bg, strong directional gradient, text on one side, image bleeds through on other",
  },
  {
    name: "Card Grid Feature",
    structure: "Light bg → dot pattern → PostHeader → headline → flex-1 min-h-0 grid of feature cards: use {isTall ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-2'}. CRITICAL: MAX 2 cards for 1:1/4:3, MAX 4 cards for 9:16/3:4. Each card: compact (p-3), icon + label + short desc. → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "Each card: bg-white, shadow-lg, rounded-2xl, border with theme color, icon in colored circle. Subtle bg pattern.",
  },
  {
    name: "Magazine Cover",
    structure: "Full-bleed image → heavy bottom gradient → PostHeader transparent over image → flex-1 → bottom section: headline + CTA badge → PostFooter. Minimal text — works at all ratios since image fills space.",
    decorations: "Cinematic feel. Minimal text. Image is the star. Text at bottom like a magazine title.",
  },
  {
    name: "Geometric Abstract",
    structure: "Dark bg → abstract CSS shapes (rotated divs, circles, diagonal lines using transforms) → PostHeader → flex-1 min-h-0 flex items-center justify-center → headline with creative word emphasis → icon accents (max 3) → PostFooter. Content wrapper MUST have overflow-hidden.",
    decorations: "CSS-only art: rotated rectangles with opacity, overlapping circles, diagonal stripes. Bold, modern, editorial feel.",
  },
  {
    name: "Product Spotlight",
    structure: "Solid color bg (use t.accent or t.accentGold or t.accentOrange — pick ONE warm tone) → minimal top area with product name (text-2xl uppercase tracking-widest) + short description (text-sm) → flex-1 centered product <img> with drop-shadow-2xl (isTall ? 'w-72 h-72' : 'w-56 h-56' object-contain) → bottom area with price or CTA. Clean, minimal, let the product breathe. Background color should feel like it matches the product.",
    decorations: "Almost none — the solid color bg IS the design. Maybe one very subtle glow behind the product. No patterns, no grid. Premium minimalism.",
  },
  {
    name: "Price Tag Offer",
    structure: "Bold bg (dark or vibrant accent) → PostHeader with brand → large discount badge (absolute top-right, rotated -12deg, rounded-full, w-20 h-20, bg accent color, bold text like '50% OFF') → flex-1 centered hero product <img> (isTall ? 'w-64 h-64' : 'w-48 h-48' object-contain, drop-shadow-2xl) → bottom bar with price (text-4xl font-black) + old price (line-through opacity-50) + CTA button → PostFooter. High energy, sales-focused.",
    decorations: "Dot pattern or subtle texture on bg. The discount badge is the visual anchor. Maybe small decorative circles or sparkle icons near the product.",
  },
  {
    name: "New Arrival Announcement",
    structure: "Vibrant solid bg (t.accent or t.accentGold) → top: announcement icon (Megaphone or Bell from lucide) + bold label 'NEW' or 'جديد' → framed product image: white border (border-4 border-white) with slight shadow, product <img> inside (isTall ? 'w-72 h-80' : 'w-56 h-64' object-cover) → product name (text-3xl font-black) → 'Available Now' / 'متوفر الآن' label → PostFooter with brand. Fresh, exciting energy.",
    decorations: "Clean white frame/border around product image. Maybe small decorative elements (stars, sparkles) near the announcement. Solid bg keeps it bold.",
  },
  {
    name: "Food Hero Menu",
    structure: "Dark bg (t.primaryDark or black) → subtle warm gradient overlay → PostHeader with brand → flex-1: hero food/product <img> as large centered image (isTall ? 'w-80 h-80' : 'w-64 h-64' object-contain, heavy drop-shadow) → product name in decorative large text (text-5xl font-black, maybe italic or script feel via tracking) with accent color keyword → bottom: price + delivery info row + CTA → PostFooter. Dramatic, appetizing.",
    decorations: "Warm gradient (dark to slightly warm), maybe dot pattern very subtle. Decorative doodle-like CSS circles or lines around the food. Small badge for 'Free Delivery' or discount.",
  },
  {
    name: "Lifestyle Full-Bleed",
    structure: "Full-bleed lifestyle/product <img> covering entire post → dark gradient overlay from bottom (heavy: rgba(0,0,0,0.7) to transparent) → brand logo/name centered or bottom-left (text-4xl font-black tracking-wider, white text) → optional one-line tagline → NO PostHeader, NO PostFooter — ultra clean. Just image + brand. Let the photo tell the story.",
    decorations: "Gradient overlay only. Maybe a thin white border inset (border inside the post for framing effect). Absolute minimum text. The photo IS the post.",
  },
  {
    name: "Product Color Match",
    structure: "Background uses the SAME color family as the product (if product is gold, bg is golden; if chocolate, bg is dark brown — use closest theme color). Product title (text-xl uppercase tracking-widest) top center → short description (text-sm) → flex-1 centered product <img> (isTall ? 'w-64 h-72' : 'w-52 h-56' object-contain, subtle drop-shadow) → brand at bottom. Monochromatic, premium catalog feel.",
    decorations: "Monochromatic — bg and product share the same color tone. Very subtle gradient (slightly lighter to slightly darker of same hue). No competing elements. Gallery/catalog style.",
  },
  {
    name: "Sale Banner Bold",
    structure: "Split layout: top 40% has massive text — discount percentage (text-7xl font-black) + sale name (e.g. 'BLACK FRIDAY' / 'FLASH SALE') in accent color → bottom 60% has product <img> centered (isTall ? 'w-72 h-72' : 'w-56 h-56' object-contain) with CTA button below. Use isTall to flip: tall = vertical stack, wide = side-by-side. High impact, retail energy.",
    decorations: "Bold bg color. Maybe zigzag or diagonal stripe pattern (CSS repeating-linear-gradient) at very low opacity. Decorative burst/starburst shape behind discount number using CSS.",
  },
  {
    name: "Framed Product Gallery",
    structure: "Clean bg (t.primaryLight or white) → PostHeader → headline (text-3xl) → flex-1 with product images in white-bordered frames: if single product, one large frame centered; if multiple, use flex row with {isTall ? 'flex-col gap-3' : 'flex-row gap-2'}, each frame has white border + shadow + rounded corners → product name + details below frames → PostFooter. Curated, gallery feel.",
    decorations: "White frames with border-2 border-white shadow-xl rounded-xl around each product image. Clean bg. Maybe subtle dot pattern. Elegant product presentation.",
  },
  {
    name: "Cinematic Close-Up",
    structure: "Full-bleed close-up/detail <img> (zoomed-in product shot, texture, ingredients) → heavy vignette overlay (radial-gradient from transparent center to dark edges) → brand name centered large (text-5xl font-black tracking-wider, white, text-shadow) → optional single tagline below (text-lg) → NO PostHeader, NO PostFooter. Ultra dramatic. Feels like a movie poster or luxury ad. The close-up texture IS the design.",
    decorations: "Radial vignette: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%). Maybe thin gold/accent border inset (8px from edges). Absolute minimum UI.",
  },
  {
    name: "Cinematic Top-Down",
    structure: "Full-bleed top-down/flat-lay <img> → gradient overlay biased to one side (e.g. linear-gradient(to right, rgba(0,0,0,0.8) 0%, transparent 60%)) → text content on the darker side: brand name (text-lg uppercase tracking-widest) → headline (text-4xl font-black) → one-line description → optional CTA badge. The image shows through on the clear side. Editorial magazine feel.",
    decorations: "Directional gradient that reveals the image on one side, darkens the other for text. Maybe a thin horizontal rule/line between brand and headline using accent color.",
  },
  {
    name: "Cinematic Story Tall",
    structure: "Full-bleed <img> covering entire post → bottom-heavy gradient (linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)) → all text at bottom 30%: brand small (text-xs uppercase tracking-widest) → headline large (text-5xl font-black, isTall text-6xl) → subtitle (text-lg) → swipe-up indicator or CTA. Perfect for 9:16 stories. Image fills most of the frame, text anchored at bottom.",
    decorations: "Strong bottom gradient. Maybe subtle grain/noise texture overlay at 3% opacity for film feel. One thin accent-colored line above the text block.",
  },
  {
    name: "Cinematic Dual Tone",
    structure: "Full-bleed <img> with CSS filter (grayscale(100%) or sepia(30%)) → color overlay using theme (mix-blend-mode: multiply or overlay, bg accent color at 20-40% opacity) → brand watermark centered large (text-6xl font-black, opacity 15%) → actual text content at bottom: headline + tagline. Creates a branded color-wash effect over any photo. Moody, editorial.",
    decorations: "CSS filter on image + color overlay via mix-blend-mode. The theme color tints the entire photo. Minimal text. Brand watermark large but very transparent.",
  },
  {
    name: "Lifestyle Behind Text",
    structure: "Full-bleed lifestyle <img> → medium gradient overlay (enough to read text but image still visible) → centered text block: headline (text-5xl font-black, white, maybe with text-shadow for readability) → short body text → CTA button (bg accent, rounded-full, px-8 py-3). Text is the FOCUS but the lifestyle image gives context and emotion. Like an Instagram ad.",
    decorations: "Gradient overlay. Text-shadow on headline (0 2px 20px rgba(0,0,0,0.5)). CTA button with subtle shadow. Clean, ad-ready feel.",
  },
  {
    name: "Lifestyle Split Half",
    structure: "Two halves: top half is <img> (object-cover, h-1/2) → bottom half is solid theme color bg (t.primary or t.primaryDark) with text content → brand name (text-sm uppercase tracking-widest) → headline (text-4xl font-black) → body text (text-base) → CTA or info. Clean split. For wide ratios, flip to left/right split instead of top/bottom using isWide.",
    decorations: "Clean divider between image and text section. Maybe a small accent-colored bar or brand icon at the split point. Bottom section can have very subtle dot pattern.",
  },
  {
    name: "Lifestyle Polaroid",
    structure: "Theme bg (t.primaryLight or t.primary) → centered 'polaroid' frame: white bg (p-3 pb-12), drop-shadow-2xl, slight rotate(-2deg) → <img> inside the frame (object-cover, rounded-sm) → handwritten-style caption below image inside the white frame → brand name outside frame at bottom. Nostalgic, authentic, personal feel.",
    decorations: "White polaroid frame with thick bottom padding. Subtle shadow. Maybe a second polaroid behind at different angle (rotate(3deg), partially visible). Tape/pin CSS detail optional.",
  },
  {
    name: "Lifestyle Mood Board",
    structure: "Theme bg → grid of {isTall ? '2 rows' : '1 row'}: main large image (col-span-2 or takes 60% width) + 1-2 smaller accent images or solid-color blocks with text/icon. One block has the headline, one has the CTA. Creates a collage/mood board feel. Brand name in corner. MAX 3-4 blocks total.",
    decorations: "Small gaps between blocks (gap-2). Rounded corners on each block. One block can be a solid accent color with an icon. Magazine editorial collage style.",
  },
];
