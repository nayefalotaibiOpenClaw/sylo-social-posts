import type { AssetInfo, GenerationContext } from "./types";
import {
  EXAMPLE_DARK_MOCKUP,
  EXAMPLE_HERO_IMAGE,
  EXAMPLE_LIGHT_CREATIVE,
  EXAMPLE_DARK_CORPORATE,
  EXAMPLE_DESKTOP_ANALYTICS,
} from "./prompts/examples";

export function buildExamplesSection(hasAssets: boolean, assetTypes: string[]): string {
  const examples: string[] = [];

  // Always include at least 2 examples for variety
  // Pick examples based on available assets
  const hasMockupAssets = assetTypes.some(t => ['iphone', 'screenshot', 'ipad', 'desktop'].includes(t));
  const hasBackgroundAssets = assetTypes.includes('background');
  const hasProductAssets = assetTypes.includes('product');

  if (hasMockupAssets) {
    examples.push(EXAMPLE_DARK_MOCKUP);
    examples.push(EXAMPLE_DESKTOP_ANALYTICS);
  } else if (hasBackgroundAssets || hasProductAssets) {
    examples.push(EXAMPLE_HERO_IMAGE);
    examples.push(EXAMPLE_LIGHT_CREATIVE);
    examples.push(EXAMPLE_DARK_CORPORATE);
  } else {
    // No assets — show variety of CSS-only + mockup patterns
    examples.push(EXAMPLE_DARK_MOCKUP);
    examples.push(EXAMPLE_LIGHT_CREATIVE);
    examples.push(EXAMPLE_DARK_CORPORATE);
  }

  return `## REFERENCE EXAMPLES — Study these. Match this quality level.\n${examples.join('\n\n')}`;
}

export function buildDynamicPrompt(context: GenerationContext): string {
  const {
    brandName = "Brand",
    tagline,
    website,
    industry,
    language,
    logoUrl,
    websiteInfo,
    assets,
  } = context;

  const isArabic = language === "ar";
  const sections: string[] = [];

  // ── Brand context ──
  const brandLines: string[] = [`- Brand name: ${brandName}`];
  if (tagline) brandLines.push(`- Tagline: ${tagline}`);
  if (industry) brandLines.push(`- Industry: ${industry}`);
  if (website) brandLines.push(`- Website: ${website}`);
  brandLines.push(
    `- Language: ${
      isArabic
        ? "Arabic for ALL text (headings, body, labels). English only for numbers/stats. Add dir=\"rtl\" to DraggableWrapper elements. Use className=\"text-right\" on text containers."
        : "English for all text"
    }`
  );

  sections.push(`## BRAND\n${brandLines.join("\n")}`);

  // ── Logo ──
  if (logoUrl) {
    sections.push(
      `## LOGO (MANDATORY)\nURL: ${logoUrl}\nPass to PostHeader: <PostHeader id="..." title="${brandName}" logoUrl="${logoUrl}" ... />`
    );
  }

  // ── Available assets — grouped by type ──
  const assetTypes: string[] = [];
  if (assets && assets.length > 0) {
    const grouped: Record<string, AssetInfo[]> = {};
    for (const a of assets) {
      const key = a.type || "other";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(a);
      if (!assetTypes.includes(key)) assetTypes.push(key);
    }

    const assetSections: string[] = [];

    for (const [type, items] of Object.entries(grouped)) {
      const lines = items.map((a) => {
        let line = `  - URL: ${a.url}`;
        if (a.label) line += `\n    Label: ${a.label}`;
        if (a.description) line += `\n    Description: ${a.description}`;
        if (a.aiAnalysis) line += `\n    AI Analysis: ${a.aiAnalysis}`;
        return line;
      }).join("\n");

      let usage = "";
      switch (type) {
        case "background":
          usage = "USE AS: Full-bleed <img> with gradient overlay on top. NEVER in device mockups.";
          break;
        case "iphone":
        case "screenshot":
          usage = "USE AS: Inside <DeviceMockup src={url} />. Use the DEVICE-AWARE MOCKUPS pattern with useDeviceType() to pick the correct mockup component. Wrap in isTall-responsive div with device-aware sizing.";
          break;
        case "ipad":
          usage = "USE AS: Inside <DeviceMockup src={url} />. Use the DEVICE-AWARE MOCKUPS pattern with useDeviceType() to pick the correct mockup component. Wrap in isTall-responsive div with device-aware sizing.";
          break;
        case "desktop":
          usage = "USE AS: Inside <DesktopMockup src={url} /> only. Wrap in isTall-responsive div.";
          break;
        case "product":
          usage = "USE AS: Hero product <img> with drop-shadow, positioned creatively.";
          break;
        case "logo":
          usage = "USE AS: Pass to PostHeader via logoUrl prop.";
          break;
        default:
          usage = "USE AS: Best placement based on the analysis.";
      }

      assetSections.push(`### ${type.toUpperCase()} (${items.length}):\n${usage}\n${lines}`);
    }

    sections.push(
      `## ASSETS (use these — NEVER use /1.jpg or hardcoded paths)\n${assetSections.join("\n\n")}`
    );
  } else {
    sections.push(
      `## ASSETS\nNone uploaded. Create CSS-only visuals — gradients, shapes, icons, patterns. No device mockups needed.`
    );
  }

  // ── Reference examples based on asset types ──
  sections.push(buildExamplesSection(assets && assets.length > 0, assetTypes));

  // ── Company info — INSPIRATION ONLY ──
  if (websiteInfo) {
    const infoLines: string[] = [];
    if (websiteInfo.companyName) infoLines.push(`Company: ${websiteInfo.companyName}`);
    if (websiteInfo.description) infoLines.push(`What they do: ${websiteInfo.description}`);
    if (websiteInfo.industry) infoLines.push(`Industry: ${websiteInfo.industry}`);
    if (websiteInfo.features && websiteInfo.features.length > 0) {
      infoLines.push(`Their features/services: ${websiteInfo.features.join(", ")}`);
    }
    if (websiteInfo.targetAudience) infoLines.push(`Audience: ${websiteInfo.targetAudience}`);
    if (websiteInfo.tone) infoLines.push(`Brand tone: ${websiteInfo.tone}`);
    if (infoLines.length > 0) {
      sections.push(
        `## COMPANY CONTEXT (INSPIRATION ONLY — do NOT copy this text)\nUse this to understand the brand, then write your OWN creative copy. Never repeat these words verbatim.\n${infoLines.join("\n")}`
      );
    }
  }

  // ── Final layout conventions ──
  const conventionLines = [
    `- Brand name in header: "${brandName}"`,
    `- PostHeader: title="${brandName}"${logoUrl ? ` logoUrl="${logoUrl}"` : ""}`,
    `- PostFooter: label="${brandName.toUpperCase()}" — NEVER use "SYLO" unless that IS the brand`,
  ];
  if (isArabic) {
    conventionLines.push(`- dir="rtl" on ALL DraggableWrapper elements`);
    conventionLines.push(`- className="text-right" on text containers`);
  }
  conventionLines.push(`- Write ORIGINAL creative copy — catchy headlines, not feature lists`);

  sections.push(`## LAYOUT RULES\n${conventionLines.join("\n")}`);

  return sections.join("\n\n");
}
