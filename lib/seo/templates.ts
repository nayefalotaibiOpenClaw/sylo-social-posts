export interface TemplatePageContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  examples: { title: string; description: string }[];
  tips: { title: string; description: string }[];
  cta: { title: string; subtitle: string };
}

export interface TemplatePage extends TemplatePageContent {
  slug: string;
  keywords: string[];
  locales?: Partial<Record<string, TemplatePageContent>>;
}

export const templatePages: TemplatePage[] = [
  {
    slug: "instagram-product-showcase",
    title: "Instagram Product Showcase Templates",
    metaTitle:
      "AI Instagram Product Showcase Post Templates | oDesigns",
    metaDescription:
      "Generate stunning Instagram product showcase posts with AI. Professional templates for product launches, features, and promotions — customized to your brand.",
    keywords: [
      "Instagram product post template",
      "product showcase Instagram",
      "Instagram product launch post",
      "AI product post generator",
      "Instagram shopping post design",
    ],
    heroTitle: "Product showcase posts that sell",
    heroSubtitle:
      "Stop posting plain product photos. AI generates professional showcase designs with your brand colors, pricing, and key features — optimized for Instagram engagement.",
    examples: [
      {
        title: "Product launch announcement",
        description:
          "Bold headline with product image, key features, and a clear call to action. Perfect for new arrivals and product drops.",
      },
      {
        title: "Feature highlight carousel",
        description:
          "Multi-slide carousel showcasing individual product features. Each slide maintains brand consistency while highlighting a different benefit.",
      },
      {
        title: "Price and offer post",
        description:
          "Eye-catching promotional design with pricing, discount badges, and urgency elements. Drives immediate action from followers.",
      },
      {
        title: "Before and after comparison",
        description:
          "Split-screen design showing the problem and solution. Powerful for products that deliver visible results.",
      },
    ],
    tips: [
      {
        title: "Lead with the benefit, not the product name",
        description:
          "Your headline should answer what the product does for the customer, not just what it is called. Benefits stop scrolls. Names do not.",
      },
      {
        title: "Use your brand palette consistently",
        description:
          "Set your brand colors in oDesigns once, and every product post automatically uses the right palette. Consistent color builds instant recognition in the feed.",
      },
      {
        title: "One product, one message",
        description:
          "Each post should highlight one product or one feature. Trying to showcase everything in a single post dilutes the message. Save the catalog for your carousel posts.",
      },
      {
        title: "Optimize for square and portrait",
        description:
          "Instagram square (1:1) and portrait (4:5) formats get the most real estate in the feed. oDesigns generates in both ratios so you can choose what works best.",
      },
    ],
    cta: {
      title: "Generate your first product post",
      subtitle:
        "Describe your product and brand. AI creates multiple showcase designs in seconds. Free to start.",
    },
  },
  {
    slug: "restaurant-social-media",
    title: "Restaurant Social Media Templates",
    metaTitle:
      "AI Restaurant & Food Social Media Post Templates | oDesigns",
    metaDescription:
      "Create mouth-watering social media posts for your restaurant. AI-generated templates for menus, daily specials, promotions, and food photography posts.",
    keywords: [
      "restaurant social media templates",
      "food Instagram post template",
      "cafe social media design",
      "restaurant marketing posts",
      "food post generator AI",
    ],
    heroTitle: "Social media posts as appetizing as your food",
    heroSubtitle:
      "Your dishes are beautiful. Your social media should match. Generate professional restaurant posts — menu highlights, daily specials, seasonal promotions — all in your brand style.",
    examples: [
      {
        title: "Daily special spotlight",
        description:
          "Feature today's special with a stunning food photo, dish name, description, and pricing. Update it in seconds every day.",
      },
      {
        title: "Menu category showcase",
        description:
          "Highlight an entire menu section — appetizers, mains, desserts — with a grid layout that makes every dish look irresistible.",
      },
      {
        title: "Seasonal promotion",
        description:
          "Ramadan iftar menu, summer drinks, holiday catering — generate themed promotional posts that match the season and your brand.",
      },
      {
        title: "Review and testimonial highlight",
        description:
          "Turn your best customer reviews into beautiful social proof posts. Quote the review, add your branding, and share the love.",
      },
    ],
    tips: [
      {
        title: "Post daily specials consistently",
        description:
          "Restaurants that post daily see significantly higher engagement. With AI generation, creating a daily special post takes seconds — making consistency effortless.",
      },
      {
        title: "Use warm, appetizing colors",
        description:
          "Set warm brand accents — deep reds, golden yellows, rich oranges. These colors trigger hunger responses and make food content more engaging.",
      },
      {
        title: "Show the food in context",
        description:
          "The best restaurant posts show dishes being enjoyed, not just plated. Table settings, hands reaching for food, and ambient restaurant lighting create emotional connection.",
      },
      {
        title: "Schedule a week at once",
        description:
          "Batch your restaurant content weekly. Generate Monday through Sunday posts in one session, schedule them, and focus on your kitchen.",
      },
    ],
    cta: {
      title: "Create your first restaurant post",
      subtitle:
        "Upload your food photos and brand details. AI generates professional menu and promotion posts in seconds. Free to start.",
    },
  },
  {
    slug: "app-store-screenshots",
    title: "App Store Screenshot Templates",
    metaTitle:
      "AI App Store Screenshot & Promotional Templates | oDesigns",
    metaDescription:
      "Generate professional app store screenshots and promotional graphics with AI. Templates for iOS App Store and Google Play featuring device mockups and feature highlights.",
    keywords: [
      "app store screenshot template",
      "app store promotional graphics",
      "iOS app screenshot design",
      "Google Play store graphics",
      "app marketing design tool",
    ],
    heroTitle: "App store graphics that boost downloads",
    heroSubtitle:
      "First impressions drive downloads. Generate professional app store screenshots and promotional posts with device mockups, feature callouts, and your app's branding — all with AI.",
    examples: [
      {
        title: "Feature highlight with device mockup",
        description:
          "Showcase your app's key screen inside a realistic device frame with a bold headline and feature description. Clean, professional, download-ready.",
      },
      {
        title: "Multi-screen overview",
        description:
          "Show multiple app screens in a single graphic to give potential users a complete preview of the experience.",
      },
      {
        title: "Social proof promotional",
        description:
          "Combine ratings, review quotes, and download counts with app screenshots for powerful social proof posts.",
      },
      {
        title: "Feature comparison layout",
        description:
          "Side-by-side or before-and-after designs highlighting what makes your app different from competitors.",
      },
    ],
    tips: [
      {
        title: "Lead with your best screen",
        description:
          "Your first app store screenshot should show the most compelling screen or feature. Most users only see the first 2-3 screenshots before deciding to download or scroll past.",
      },
      {
        title: "Use bold, readable text",
        description:
          "App store screenshots are viewed on small screens. Keep headlines large, use high-contrast colors, and limit text to 3-5 words per callout.",
      },
      {
        title: "Show the app in action",
        description:
          "Static empty states are less compelling than screens showing real data and interactions. Populate your screenshots with realistic content.",
      },
      {
        title: "Match your app's brand exactly",
        description:
          "Set your app's primary color and typography in oDesigns. Every generated screenshot will match your app's visual identity perfectly.",
      },
    ],
    cta: {
      title: "Generate your first app store graphic",
      subtitle:
        "Upload your app screenshots, set your brand. AI creates professional app store graphics in seconds. Free to start.",
    },
  },
  {
    slug: "social-media-carousel",
    title: "Social Media Carousel Post Templates",
    metaTitle:
      "AI Social Media Carousel Post Templates | oDesigns",
    metaDescription:
      "Generate engaging carousel posts for Instagram and social media. AI creates multi-slide educational content, tutorials, and tip posts with consistent branding.",
    keywords: [
      "Instagram carousel template",
      "social media carousel design",
      "carousel post generator",
      "multi-slide Instagram post",
      "educational carousel template",
    ],
    heroTitle: "Carousel posts that keep them swiping",
    heroSubtitle:
      "Carousel posts get 3x more engagement than single images on Instagram. Generate cohesive multi-slide posts — tutorials, tip lists, and educational content — with consistent branding on every slide.",
    examples: [
      {
        title: "Educational tips series",
        description:
          "A 5-7 slide carousel where each slide presents one tip or insight. Consistent layout, bold numbering, and a CTA on the final slide.",
      },
      {
        title: "Step-by-step tutorial",
        description:
          "Walk your audience through a process with numbered steps. Each slide covers one step with clear visuals and concise text.",
      },
      {
        title: "Product feature walkthrough",
        description:
          "Showcase multiple product features across slides. Each slide highlights one feature with a benefit-focused headline.",
      },
      {
        title: "Before and after story",
        description:
          "Start with the problem, show the transformation across slides, and end with the result. Powerful for case studies and testimonials.",
      },
    ],
    tips: [
      {
        title: "Hook on slide one, CTA on the last",
        description:
          "Your first slide must be intriguing enough to trigger a swipe. The last slide should always include a clear call to action — follow, save, visit link.",
      },
      {
        title: "Keep design consistent across slides",
        description:
          "Same colors, same fonts, same layout structure. Your carousel should feel like a cohesive mini-presentation, not a random collection of images.",
      },
      {
        title: "One idea per slide",
        description:
          "Do not cram multiple points onto one slide. Each slide should communicate one clear idea that the viewer absorbs in 2-3 seconds.",
      },
      {
        title: "Aim for 5-7 slides",
        description:
          "Research shows 5-7 slides hit the sweet spot for engagement. Enough to provide value without losing attention.",
      },
    ],
    cta: {
      title: "Generate your first carousel post",
      subtitle:
        "Describe your topic. AI creates a full carousel with consistent branding across every slide. Free to start.",
    },
  },
  {
    slug: "brand-announcement-posts",
    title: "Brand Announcement Post Templates",
    metaTitle:
      "AI Brand Announcement & Launch Post Templates | oDesigns",
    metaDescription:
      "Create professional brand announcement posts with AI. Templates for product launches, company news, milestones, and event announcements on social media.",
    keywords: [
      "brand announcement post template",
      "product launch social media post",
      "company announcement design",
      "event announcement Instagram post",
      "launch post generator",
    ],
    heroTitle: "Announcements that demand attention",
    heroSubtitle:
      "Big news deserves big design. Generate professional announcement posts for product launches, company milestones, events, and updates — all matching your brand identity.",
    examples: [
      {
        title: "Product launch countdown",
        description:
          "Build anticipation with a series of countdown posts leading to launch day. Consistent teaser design that creates excitement.",
      },
      {
        title: "Company milestone celebration",
        description:
          "Celebrate achievements — anniversaries, user milestones, awards — with bold typography and your brand colors.",
      },
      {
        title: "Event announcement and reminder",
        description:
          "Generate event posts with date, time, location, and registration details. Schedule reminders leading up to the event.",
      },
      {
        title: "Feature or update release",
        description:
          "Announce new features, updates, or improvements with clean designs that highlight what is new and why it matters.",
      },
    ],
    tips: [
      {
        title: "Create a campaign, not a single post",
        description:
          "Big announcements work best as a series: teaser, reveal, details, reminder. Generate the entire sequence at once and schedule it across days.",
      },
      {
        title: "Bold typography wins",
        description:
          "Announcement posts should feel important. Use larger headline sizes, bolder weights, and high-contrast color combinations.",
      },
      {
        title: "Include the key details upfront",
        description:
          "What, when, where, and how. Do not make followers dig into the caption for essential information — put it on the design.",
      },
      {
        title: "Cross-post everywhere",
        description:
          "Announcements should reach every channel simultaneously. Publish to all your connected platforms in one click.",
      },
    ],
    cta: {
      title: "Create your next announcement post",
      subtitle:
        "Describe your news. AI generates professional announcement designs in seconds. Free to start.",
    },
  },
];

export function getTemplatePageBySlug(
  slug: string
): TemplatePage | undefined {
  return templatePages.find((tp) => tp.slug === slug);
}

/** Get a template page with locale-specific content (falls back to English) */
export function getLocalizedTemplatePage(slug: string, locale: string): (TemplatePage & TemplatePageContent) | undefined {
  const tp = getTemplatePageBySlug(slug);
  if (!tp) return undefined;
  if (locale === "en" || !tp.locales?.[locale]) return tp;
  const localized = tp.locales[locale]!;
  return { ...tp, ...localized };
}
