import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

// List all published blogs, optionally filtered by language
export const list = query({
  args: {
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
  },
  handler: async (ctx, args) => {
    const blogs = await ctx.db
      .query("blogs")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .collect();
    // Only return blog-type entries (exclude use-cases and templates)
    const blogOnly = blogs.filter(
      (b) => !b.type || b.type === "blog"
    );
    if (args.language) {
      return blogOnly.filter(
        (b) => b.language === args.language || b.language === undefined
      );
    }
    return blogOnly;
  },
});

// Get a single blog by its slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const blog = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (!blog || !blog.published) return null;
    return blog;
  },
});

// List published entries by type (use-case, template), optionally filtered by language
export const listByType = query({
  args: {
    type: v.union(v.literal("use-case"), v.literal("template")),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("blogs")
      .withIndex("by_type_language", (q) => {
        const q2 = q.eq("type", args.type);
        return args.language ? q2.eq("language", args.language) : q2;
      })
      .collect();
    return items.filter((i) => i.published);
  },
});

// Get a single entry by slug and type, with optional language (falls back to English)
export const getBySlugAndType = query({
  args: {
    slug: v.string(),
    type: v.union(v.literal("use-case"), v.literal("template")),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("blogs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    const typeMatches = items.filter((i) => i.published && i.type === args.type);
    if (args.language) {
      const langMatch = typeMatches.find((i) => i.language === args.language);
      if (langMatch) return langMatch;
    }
    // Fall back to English, then any available
    return typeMatches.find((i) => i.language === "en") || typeMatches[0] || null;
  },
});

// Seed blog posts (English + Arabic)
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing blogs and re-seed
    const existing = await ctx.db.query("blogs").collect();
    for (const blog of existing) {
      await ctx.db.delete(blog._id);
    }

    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // ─── English blogs ───────────────────────────────────

    await ctx.db.insert("blogs", {
      title: "5 Design Principles for Scroll-Stopping Social Media Posts",
      slug: "5-design-principles-scroll-stopping-social-media-posts",
      excerpt:
        "Master the visual hierarchy, color psychology, and typography tricks that make users pause mid-scroll and engage with your content.",
      content: `Great social media design is not about flashy effects — it is about clarity, contrast, and intention. Whether you are building a brand from scratch or refreshing an existing feed, these five principles will elevate every post you create.

## 1. Visual Hierarchy Drives Attention

The human eye naturally follows a pattern: large elements first, then smaller ones. Place your most important message — the headline or key visual — in the dominant position. Supporting text and calls to action should be clearly secondary. When everything screams for attention, nothing gets noticed.

## 2. Contrast Is Your Best Friend

High contrast between text and background is non-negotiable for readability. But contrast goes beyond black and white. Use contrasting colors from your brand palette to create focal points. A bright accent button on a dark card, or bold typography against a muted background, instantly draws the eye where you want it.

## 3. Whitespace Is Not Wasted Space

Resist the urge to fill every pixel. Generous padding and margins give your content room to breathe, making it feel premium and intentional. Posts with adequate whitespace consistently outperform cluttered designs in engagement metrics. Think of whitespace as the silence between musical notes — it gives the melody meaning.

## 4. Consistent Branding Builds Recognition

Every post should feel like it belongs to the same family. Use the same font pairings, color palette, and layout patterns across your feed. When someone scrolls past your post, they should recognize your brand within a fraction of a second — even before reading a single word. Consistency compounds into trust over time.

## 5. Typography Tells a Story

Font choice communicates mood before a single word is read. A geometric sans-serif feels modern and tech-forward. A serif font conveys authority and tradition. Limit yourself to two typefaces per design — one for headings, one for body text. Size variation between heading and body text should be dramatic enough to create clear hierarchy but not so extreme that it feels disjointed.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 3 * DAY,
      tags: ["Design", "Social Media", "Branding", "Tips"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "How AI Is Transforming Social Media Content Creation",
      slug: "how-ai-is-transforming-social-media-content-creation",
      excerpt:
        "From generating on-brand visuals to writing captions that convert, AI tools are reshaping how teams produce social media content at scale.",
      content: `The days of spending hours crafting a single social media post are fading fast. AI-powered tools now handle everything from layout generation to copywriting, allowing marketing teams to focus on strategy and creativity rather than repetitive production work.

## The Shift from Manual to Intelligent Design

Traditional social media workflows involved a designer creating each post from scratch in Photoshop or Figma, followed by rounds of revision. AI changes this equation entirely. Modern tools can analyze your brand guidelines — colors, fonts, tone — and generate on-brand post designs in seconds. The designer's role evolves from pixel-pusher to creative director, guiding the AI and refining its output.

## Content That Adapts to Every Platform

One of the biggest pain points in social media management is adapting content across platforms. A post designed for Instagram's square format needs to be reworked for Twitter's landscape ratio, TikTok's vertical format, and LinkedIn's professional context. AI handles these adaptations automatically, maintaining visual consistency while respecting each platform's unique requirements and best practices.

## Personalization at Scale

AI does not just replicate — it personalizes. By analyzing engagement data and audience behavior, AI tools can suggest which visual styles, color palettes, and messaging angles resonate most with specific audience segments. This means every post can be optimized for maximum impact, something that would be impossible to do manually across dozens of weekly posts.

## The Human-AI Creative Partnership

The most effective approach is not replacing human creativity with AI, but combining both. AI excels at generating variations, maintaining consistency, and handling repetitive formatting tasks. Humans bring strategic thinking, emotional intelligence, and the creative spark that makes content truly memorable. The teams that master this partnership will have an enormous competitive advantage in the attention economy.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 7 * DAY,
      tags: ["AI", "Content Creation", "Automation", "Social Media"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "How to Schedule Social Media Posts Like a Pro: The Complete Guide",
      slug: "how-to-schedule-social-media-posts-like-a-pro",
      excerpt:
        "Learn the best times to post on Instagram, Facebook, Twitter, and Threads — plus how to use bulk scheduling to save hours every week.",
      content: `Consistent posting is the single biggest factor in growing a social media audience, yet most creators and businesses struggle to maintain a regular cadence. The solution is not working harder — it is scheduling smarter. Here is how to build a posting workflow that runs on autopilot without sacrificing quality.

## Why Scheduling Beats Posting in Real Time

Posting manually means you are tied to your phone at peak hours, rushing to write captions, and often skipping days when life gets busy. A scheduling workflow lets you batch-create content during focused creative sessions and distribute it across the week at optimal times. The result: better content, less stress, and higher engagement.

## The Best Times to Post in 2026

While optimal posting times vary by audience, research consistently shows these patterns. Instagram performs best between 11 AM and 1 PM on weekdays, with a secondary peak around 7 PM. Twitter sees highest engagement during morning commute hours, around 8 to 9 AM. Facebook peaks during lunch breaks at 12 to 2 PM. Threads, being newer, tends to mirror Instagram patterns but with slightly higher evening engagement.

The key insight is that **your** best time depends on **your** audience. Use your platform analytics to identify when your followers are most active, then schedule your posts to land during those windows.

## Bulk Scheduling: The Time-Saving Superpower

Instead of scheduling posts one at a time, batch your content creation. Set aside two to three hours per week to design all your posts at once, write all your captions, and schedule everything in one session. Tools like oDesigns let you generate AI-designed posts in bulk and schedule them across multiple platforms simultaneously. What used to take 30 minutes per post now takes seconds.

## Building a Content Calendar That Works

A content calendar is not just a schedule — it is a strategy document. Map out your content themes by day of the week. For example, Monday for educational tips, Wednesday for behind-the-scenes, Friday for product highlights. This structure gives you creative constraints that actually make ideation easier, and it helps your audience know what to expect.

## Cross-Platform Publishing Without the Headache

Each social platform has different image dimensions, character limits, and content norms. Manually adapting every post for Instagram, Twitter, Facebook, and Threads is exhausting. The modern approach is to design once and let your scheduling tool handle platform-specific adaptations automatically. This ensures visual consistency across all channels while respecting each platform's unique format requirements.

## Measuring What Matters

Scheduling is only half the equation. Track which posts perform best at which times, then refine your schedule based on actual data. The posts that get the most saves and shares — not just likes — are the ones driving real growth. Adjust your content calendar quarterly based on these insights.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 1 * DAY,
      tags: ["Scheduling", "Social Media Strategy", "Productivity", "Instagram"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "AI Social Media Post Generator: Create Stunning Designs in Seconds",
      slug: "ai-social-media-post-generator-create-designs-in-seconds",
      excerpt:
        "Discover how AI post generators are replacing traditional design tools for social media — and why the best ones keep your brand identity intact.",
      content: `The average social media manager creates 15 to 25 posts per week across multiple platforms. At 30 to 60 minutes per post using traditional design tools, that is an entire work week spent on production alone. AI social media post generators are changing this equation dramatically, cutting creation time from minutes to seconds while maintaining professional quality.

## What Makes a Good AI Post Generator

Not all AI design tools are created equal. The best ones understand three critical elements: your brand identity, your content goals, and your platform requirements. A tool that generates generic designs with random colors is no better than a template library. The real value comes from AI that learns your brand palette, respects your typography choices, and adapts layouts to match your visual identity.

## Beyond Templates: True AI-Generated Designs

Traditional template tools give you a fixed layout that you fill in with your content. AI generators work differently. They analyze your brand, your message, and your visual preferences, then create entirely original designs from scratch. Each post is unique — not a slightly modified version of the same template that every other business is using. This means your feed looks distinctive and professional without requiring any design skills.

## From Prompt to Post: How the Process Works

Modern AI post generators follow a simple workflow. You describe what you want — whether that is a product announcement, a motivational quote, or an app feature showcase — and the AI generates multiple design variations. You pick the one you like, customize the text if needed, and export it in the right dimensions for your target platform. The entire process takes under a minute.

Some tools go even further. You can provide your website URL or app screenshots, and the AI will extract your brand colors, understand your product, and generate contextually relevant posts that look like a professional designer spent hours crafting them.

## Maintaining Brand Consistency with AI

One common concern about AI-generated content is inconsistency. If every post is generated from scratch, how do you maintain a cohesive feed? The answer lies in brand-aware AI. By setting your brand colors, fonts, and style preferences once, the AI ensures that every generated post feels like part of the same visual family. Your Instagram grid looks intentional and curated, even though each post was created in seconds.

## The ROI of AI-Powered Content Creation

The math is straightforward. If a social media manager saves 20 hours per week on design production, that time can be redirected to strategy, community engagement, and campaign planning — activities that directly drive growth. For freelancers and small businesses, AI post generators eliminate the need to hire a dedicated designer, making professional social media marketing accessible to everyone.

## Choosing the Right Tool for Your Needs

When evaluating AI post generators, look for these features: brand customization (colors, fonts, logos), multiple design variations per prompt, support for different aspect ratios (square, portrait, landscape, stories), direct publishing integration, and the ability to edit generated designs. The tools that combine AI generation with intuitive editing give you the best of both worlds — speed and control.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 5 * DAY,
      tags: ["AI Design", "Social Media Tools", "Content Creation", "Productivity"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "How to Publish to Instagram, Facebook, and Threads from One Dashboard",
      slug: "publish-instagram-facebook-threads-one-dashboard",
      excerpt:
        "Stop switching between apps. Learn how to connect your social accounts, design posts, and publish everywhere from a single tool.",
      content: `Managing multiple social media accounts is one of the most time-consuming parts of digital marketing. You design a post, then log into Instagram to publish it, switch to Facebook to post a slightly different version, open Threads to share the text, and hop over to Twitter for good measure. By the time you are done, an hour has vanished — and you still need to do it all again tomorrow.

## The Case for Unified Social Media Publishing

Centralized publishing is not just about convenience — it is about consistency and efficiency. When you manage all your channels from one place, you ensure the same message reaches all your audiences at the right time. You also eliminate the version control nightmare of tracking which image went where and what caption you used on which platform.

## Connecting Your Social Accounts

Modern social media tools use OAuth to securely connect your accounts. This means you authorize the tool to post on your behalf without ever sharing your password. The setup process typically takes under five minutes: click connect, log into your social account, grant posting permissions, and you are done. Your tokens are encrypted and stored securely, so your accounts stay protected.

## Designing Once, Publishing Everywhere

The real power of a unified dashboard is the ability to create one post and adapt it for every platform automatically. Design your post in a visual editor, write your caption, select which channels to publish to, and hit send. The tool handles the technical details — adjusting image dimensions, respecting character limits, and formatting hashtags appropriately for each platform.

For Instagram, your post gets the square or portrait treatment with hashtag optimization. For Facebook, it adapts to the larger landscape preview format. For Threads, the caption takes center stage with a clean text-first approach. And for Twitter, the image and text are optimized for the timeline format.

## Scheduling Across Platforms

Not every platform peaks at the same time. Your Instagram audience might be most active at noon, while your Twitter followers engage more during the morning commute. A unified dashboard lets you schedule platform-specific posting times while managing everything from one calendar view. You can see your entire week at a glance — no more guessing what you posted where.

## Bulk Publishing for Maximum Efficiency

For businesses that need to maintain a high posting frequency, bulk publishing is transformative. Instead of scheduling posts one at a time, you can select multiple posts, assign them to different channels, stagger their publish times, and queue them all in a single action. A week of content across four platforms can be scheduled in minutes.

## Tracking Performance Across Channels

When all your publishing flows through one tool, you gain a unified view of performance. See which posts performed best on which platforms, compare engagement rates across channels, and identify your top-performing content themes. This data-driven approach helps you double down on what works and stop wasting time on what does not.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 10 * DAY,
      tags: ["Publishing", "Instagram", "Facebook", "Threads", "Multi-Platform"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "Brand Kit for Social Media: Why Your Colors, Fonts, and Logo Matter More Than You Think",
      slug: "brand-kit-social-media-colors-fonts-logo",
      excerpt:
        "Your brand kit is the foundation of every social media post. Learn how to set up your colors, fonts, and logo for instant recognition across all platforms.",
      content: `Scroll through any successful brand's social media feed and you will notice something immediately: every post looks like it belongs. The colors are consistent, the typography is intentional, and the overall aesthetic is unmistakably theirs. This is not an accident — it is the result of a well-defined brand kit.

## What Is a Social Media Brand Kit

A brand kit is a set of visual guidelines that define how your brand looks across every touchpoint. For social media specifically, it includes your primary and accent colors, your heading and body fonts, your logo variations, and any recurring visual elements like patterns or icons. Think of it as the DNA of your visual identity.

## The Psychology of Consistent Branding

Studies show that consistent brand presentation increases revenue by up to 23 percent. On social media, where attention spans are measured in milliseconds, brand consistency is even more critical. When a follower sees your post in a crowded feed, they should recognize it as yours before reading a single word. This instant recognition builds trust, and trust drives engagement.

## Setting Up Your Color Palette

Your brand colors do more than look pretty — they communicate emotion. Blue conveys trust and professionalism. Green suggests growth and sustainability. Orange radiates energy and creativity. Choose a primary color that aligns with your brand personality, then add two to three complementary accent colors for variety.

The key is using these colors consistently across every post. When your AI design tool knows your brand palette, every generated post automatically uses the right colors. No more eyedropping hex codes from your brand guidelines document or accidentally using the wrong shade of blue.

## Choosing Fonts That Speak Your Brand

Typography is the voice of your visual identity. A startup in fintech might use a clean geometric sans-serif to communicate modernity and precision. A bakery might lean toward a warm serif or handwritten font to evoke warmth and craftsmanship. Whatever you choose, limit yourself to two fonts — one for headings, one for body text.

Consistency is crucial here. Using a different font on every post makes your feed look chaotic and unprofessional. Set your fonts once in your brand kit, and let your design tool apply them automatically to every new post.

## Your Logo: Placement and Sizing

Your logo anchors your brand identity on every post. But placement matters. A logo that is too large looks desperate. One that is too small gets lost. The sweet spot is a subtle but visible placement — typically in a corner — sized so it is recognizable without dominating the design.

Consider creating multiple logo variations: a full logo for larger placements, an icon-only version for small spaces, and a white or dark version for different backgrounds. Having these variations ready means your brand looks polished regardless of the post design.

## Bringing It All Together

The magic of a brand kit is automation. Once you define your colors, fonts, and logo, every post you create — whether manually or with AI — automatically inherits your brand identity. Your Instagram feed looks curated, your Facebook posts look professional, and your Twitter images look intentional. It takes 30 minutes to set up and saves hundreds of hours of design decisions throughout the year.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 14 * DAY,
      tags: ["Branding", "Brand Identity", "Design", "Social Media Marketing"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "Instagram Post Design Ideas for Small Businesses in 2026",
      slug: "instagram-post-design-ideas-small-businesses-2026",
      excerpt:
        "Fresh Instagram design ideas that actually drive engagement — from product showcases and testimonials to behind-the-scenes content and seasonal campaigns.",
      content: `Instagram remains the most visual social media platform, and for small businesses, it is often the primary channel for reaching new customers. But with over 2 billion monthly active users, standing out requires more than just posting product photos. Here are the Instagram post design strategies that are working right now in 2026.

## Product Showcase Posts That Convert

The most effective product posts are not simple photos on white backgrounds. They tell a story. Show your product in context — being used, being enjoyed, solving a real problem. Use bold typography to highlight the key benefit, not the product name. Customers care about what your product does for them, not what you call it.

Design tip: use a split-layout design with the product on one side and a bold headline on the other. Add your brand colors as a background gradient to make it instantly recognizable in the feed.

## Customer Testimonial Designs

Social proof is the most powerful marketing tool on Instagram. But a plain text testimonial gets scrolled past. Design your testimonials as visually striking posts: use a large pull quote with the customer's words, add a subtle star rating, and include the customer's first name for authenticity. Keep the design minimal — the words should be the hero.

## Behind-the-Scenes Content

Audiences crave authenticity. Behind-the-scenes posts consistently outperform polished marketing content because they build a genuine connection. Show your workspace, your process, your team, your failures, and your wins. For design, pair a casual photo with clean typography that adds context. A simple "How we make..." or "A day at..." headline turns a casual photo into engaging content.

## Educational Carousel Posts

Carousel posts get 3 times more engagement than single-image posts on Instagram. They are perfect for educational content: tutorials, tips lists, step-by-step guides, and industry insights. Design each slide with consistent branding — same colors, same fonts, same layout structure — so the carousel feels like a cohesive mini-presentation.

The first slide is your hook. Make it bold, make it intriguing, and make the viewer want to swipe. The last slide should always include a call to action: follow for more, save this post, visit the link in bio.

## Seasonal and Trending Content

Tie your content to seasons, holidays, and trending topics to stay relevant. But do it with your brand's visual identity intact. A Valentine's Day post should still feel like your brand — just with a seasonal twist. Use your brand colors with seasonal accents rather than completely changing your visual identity for every holiday.

## Minimal Text, Maximum Impact

The best-performing Instagram posts in 2026 follow a clear trend: less text, more visual impact. Your post needs to communicate its message in under 2 seconds. That means one headline, one supporting line at most, and strong visual hierarchy. Save the detailed message for your caption — the post design is the hook that stops the scroll.

## Using AI to Generate Instagram Content at Scale

For small businesses without a dedicated designer, AI post generators have become essential. Instead of spending hours in Canva or Figma, you can describe your post concept and get multiple professional designs in seconds. The best AI tools understand Instagram's visual language and generate posts that look native to the platform — not like generic templates. Combined with bulk scheduling, a small business can maintain a professional Instagram presence with just a few hours of work per week.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 18 * DAY,
      tags: ["Instagram", "Small Business", "Design Ideas", "Content Strategy"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "Social Media Automation in 2026: What to Automate and What to Keep Human",
      slug: "social-media-automation-2026-what-to-automate",
      excerpt:
        "Not everything should be automated. Learn which social media tasks AI handles best and where the human touch still wins.",
      content: `Automation has transformed social media management from a full-time grind into a streamlined workflow. But in the rush to automate everything, many brands lose the authentic human connection that makes social media powerful in the first place. The key is knowing where to draw the line.

## What You Should Automate

**Post design and generation.** AI design tools can generate on-brand social media posts in seconds. Instead of opening Photoshop for every post, describe what you need and let AI create multiple variations. This is the single biggest time-saver in modern social media management.

**Scheduling and publishing.** There is zero reason to manually publish posts in real time. Schedule your content in advance, set optimal posting times for each platform, and let the tool handle distribution. Bulk scheduling takes this further — queue an entire week of content in one sitting.

**Cross-platform adaptation.** Manually resizing images and reformatting captions for each social platform is tedious busywork. Automate it. Design once, and let your tool adapt the dimensions and format for Instagram, Facebook, Twitter, Threads, and any other channel.

**Content calendar management.** A visual calendar that shows all your scheduled posts across all platforms eliminates the guesswork of "what did I post last Tuesday?" and prevents accidental gaps in your posting schedule.

## What You Should Keep Human

**Community engagement.** Responding to comments, DMs, and mentions should always have a human touch. Automated replies feel robotic and damage trust. Take the time to write genuine responses that show your audience you are listening.

**Strategy and creative direction.** AI can generate designs and suggest content, but the strategic decisions — your brand voice, campaign themes, content pillars, and audience positioning — require human judgment. Use AI as your production team, not your strategist.

**Crisis management.** When something goes wrong — a PR issue, a product problem, or a viral complaint — the response must be human, empathetic, and carefully considered. No automation should handle sensitive communications.

**Storytelling and brand narrative.** Your brand story, your mission, your values — these need to come from real people. Audiences can sense the difference between AI-generated brand messaging and authentic human storytelling. Use AI for production, but let humans drive the narrative.

## The Sweet Spot: AI-Augmented Workflows

The most effective social media teams in 2026 are not choosing between human and AI — they are combining both strategically. A typical optimized workflow looks like this: the human decides the content strategy and provides creative direction, the AI generates post designs and caption drafts, the human reviews, refines, and approves, and the tool schedules and publishes automatically. This workflow reduces production time by 80 percent while maintaining the quality and authenticity that audiences demand.

## The Bottom Line

Automate the production, keep the personality. Use AI and automation for the repetitive, time-consuming tasks that drain your creative energy. Then invest the time you save into the activities that actually build relationships — engaging with your community, developing your brand story, and creating the kind of content that no algorithm can replicate.`,
      author: "oDesigns Team",
      language: "en",
      publishedAt: now - 22 * DAY,
      tags: ["Automation", "AI", "Social Media Management", "Strategy"],
      published: true,
    });

    // ─── Arabic blogs ────────────────────────────────────

    await ctx.db.insert("blogs", {
      title: "٥ مبادئ تصميم لمنشورات سوشيال ميديا تجذب الانتباه",
      slug: "5-design-principles-scroll-stopping-social-media-posts-ar",
      excerpt:
        "أتقن التسلسل البصري وعلم نفس الألوان وحيل الطباعة التي تجعل المستخدمين يتوقفون أثناء التصفح ويتفاعلون مع محتواك.",
      content: `التصميم الجيد للسوشيال ميديا لا يتعلق بالمؤثرات البصرية المبهرة — بل يتعلق بالوضوح والتباين والقصد. سواء كنت تبني علامة تجارية من الصفر أو تُحدّث هوية بصرية قائمة، هذه المبادئ الخمسة سترتقي بكل منشور تصممه.

## ١. التسلسل البصري يقود الانتباه

العين البشرية تتبع نمطاً طبيعياً: العناصر الكبيرة أولاً ثم الأصغر. ضع رسالتك الأهم — العنوان الرئيسي أو العنصر البصري المحوري — في الموقع المهيمن. النصوص الداعمة وأزرار الدعوة للإجراء يجب أن تكون ثانوية بوضوح. عندما يصرخ كل شيء طلباً للانتباه، لا شيء يُلاحظ.

## ٢. التباين هو أفضل صديق لك

التباين العالي بين النص والخلفية أمر غير قابل للتفاوض من أجل سهولة القراءة. لكن التباين يتجاوز الأبيض والأسود. استخدم ألواناً متباينة من لوحة ألوان علامتك التجارية لإنشاء نقاط تركيز. زر بلون لافت على بطاقة داكنة، أو خط عريض على خلفية هادئة، يجذب العين فوراً إلى حيث تريد.

## ٣. المساحة البيضاء ليست مساحة ضائعة

قاوم الرغبة في ملء كل بكسل. الحشو والهوامش السخية تمنح محتواك مساحة للتنفس، مما يجعله يبدو احترافياً ومقصوداً. المنشورات ذات المساحات البيضاء الكافية تتفوق باستمرار على التصاميم المزدحمة في مقاييس التفاعل. فكّر في المساحة البيضاء كالصمت بين النوتات الموسيقية — فهي تعطي اللحن معناه.

## ٤. الاتساق في الهوية يبني التعرّف

كل منشور يجب أن يبدو وكأنه ينتمي لنفس العائلة. استخدم نفس أزواج الخطوط ولوحة الألوان وأنماط التخطيط عبر منشوراتك. عندما يمر شخص ما بمنشورك أثناء التصفح، يجب أن يتعرف على علامتك التجارية في جزء من الثانية — حتى قبل قراءة كلمة واحدة.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 2 * DAY,
      tags: ["تصميم", "سوشيال ميديا", "هوية بصرية", "نصائح"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "كيف يُحدث الذكاء الاصطناعي ثورة في صناعة محتوى السوشيال ميديا",
      slug: "how-ai-is-transforming-social-media-content-creation-ar",
      excerpt:
        "من إنشاء تصاميم متوافقة مع الهوية البصرية إلى كتابة نصوص تُحقق نتائج، أدوات الذكاء الاصطناعي تُعيد تشكيل طريقة إنتاج محتوى السوشيال ميديا.",
      content: `أيام قضاء ساعات في صياغة منشور واحد على السوشيال ميديا بدأت تتلاشى بسرعة. أدوات الذكاء الاصطناعي تتولى الآن كل شيء من توليد التخطيطات إلى كتابة النصوص، مما يتيح لفرق التسويق التركيز على الاستراتيجية والإبداع بدلاً من أعمال الإنتاج المتكررة.

## التحول من التصميم اليدوي إلى التصميم الذكي

سير العمل التقليدي في السوشيال ميديا كان يتضمن مصمماً ينشئ كل منشور من الصفر في فوتوشوب أو فيجما، تليها جولات من المراجعة. الذكاء الاصطناعي يغير هذه المعادلة بالكامل. الأدوات الحديثة يمكنها تحليل إرشادات علامتك التجارية — الألوان والخطوط والنبرة — وتوليد تصاميم منشورات متوافقة مع الهوية في ثوانٍ. دور المصمم يتطور من منفذ تقني إلى مدير إبداعي يوجه الذكاء الاصطناعي ويصقل مخرجاته.

## محتوى يتكيف مع كل منصة

واحدة من أكبر نقاط الألم في إدارة السوشيال ميديا هي تكييف المحتوى عبر المنصات المختلفة. منشور مصمم بتنسيق إنستغرام المربع يحتاج إعادة تصميم لتنسيق تويتر الأفقي، وتيك توك العمودي، وسياق لينكد إن المهني. الذكاء الاصطناعي يتولى هذه التكييفات تلقائياً، مع الحفاظ على الاتساق البصري واحترام متطلبات كل منصة.

## التخصيص على نطاق واسع

الذكاء الاصطناعي لا يكتفي بالنسخ — بل يُخصّص. من خلال تحليل بيانات التفاعل وسلوك الجمهور، يمكن لأدوات الذكاء الاصطناعي اقتراح الأنماط البصرية ولوحات الألوان وزوايا الرسائل التي تلقى أكبر صدى لدى شرائح جمهور محددة. هذا يعني أن كل منشور يمكن تحسينه لتحقيق أقصى تأثير — وهو أمر مستحيل يدوياً عبر عشرات المنشورات الأسبوعية.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 5 * DAY,
      tags: ["ذكاء اصطناعي", "صناعة محتوى", "أتمتة", "سوشيال ميديا"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "دليلك الشامل لجدولة منشورات السوشيال ميديا باحترافية",
      slug: "guide-to-scheduling-social-media-posts-ar",
      excerpt:
        "تعرّف على أفضل أوقات النشر على إنستغرام وفيسبوك وتويتر، وكيف توفر ساعات أسبوعياً باستخدام الجدولة المجمّعة.",
      content: `النشر المنتظم هو العامل الأهم في نمو جمهور السوشيال ميديا، ومع ذلك يعاني معظم صانعي المحتوى والشركات من الحفاظ على وتيرة ثابتة. الحل ليس العمل بجدية أكبر — بل الجدولة بذكاء أكبر.

## لماذا الجدولة أفضل من النشر الفوري

النشر اليدوي يعني أنك مقيّد بهاتفك في أوقات الذروة، تسارع لكتابة التعليقات، وغالباً تتخطى أياماً عندما تنشغل الحياة. سير عمل الجدولة يتيح لك إنشاء المحتوى دفعة واحدة خلال جلسات إبداعية مركّزة وتوزيعه عبر الأسبوع في الأوقات المثالية. النتيجة: محتوى أفضل، ضغط أقل، وتفاعل أعلى.

## أفضل أوقات النشر في ٢٠٢٦

بينما تختلف أوقات النشر المثالية حسب الجمهور، تُظهر الأبحاث أنماطاً ثابتة. إنستغرام يحقق أفضل أداء بين ١١ صباحاً و١ ظهراً في أيام العمل. تويتر يشهد أعلى تفاعل خلال ساعات الذروة الصباحية من ٨ إلى ٩ صباحاً. فيسبوك يبلغ ذروته خلال استراحات الغداء من ١٢ إلى ٢ ظهراً.

المفتاح هو أن **أفضل وقت لك** يعتمد على **جمهورك**. استخدم تحليلات المنصة لتحديد متى يكون متابعوك أكثر نشاطاً، ثم جدوِل منشوراتك لتصل خلال تلك النوافذ.

## الجدولة المجمّعة: القوة الخارقة لتوفير الوقت

بدلاً من جدولة المنشورات واحداً تلو الآخر، اجمع إنشاء محتواك. خصص ساعتين إلى ثلاث ساعات أسبوعياً لتصميم جميع منشوراتك دفعة واحدة، وكتابة جميع التعليقات، وجدولة كل شيء في جلسة واحدة. أدوات مثل oDesigns تتيح لك إنشاء منشورات مصممة بالذكاء الاصطناعي بكميات كبيرة وجدولتها عبر منصات متعددة في وقت واحد.

## بناء تقويم محتوى فعّال

تقويم المحتوى ليس مجرد جدول — إنه وثيقة استراتيجية. حدد مواضيع محتواك حسب يوم الأسبوع. مثلاً: الاثنين للنصائح التعليمية، الأربعاء لكواليس العمل، الجمعة لإبراز المنتجات. هذا الهيكل يمنحك قيوداً إبداعية تجعل توليد الأفكار أسهل فعلياً.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 1 * DAY,
      tags: ["جدولة", "استراتيجية", "إنتاجية", "سوشيال ميديا"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "مولّد منشورات السوشيال ميديا بالذكاء الاصطناعي: تصاميم احترافية في ثوانٍ",
      slug: "ai-social-media-post-generator-ar",
      excerpt:
        "اكتشف كيف تحل مولّدات المنشورات بالذكاء الاصطناعي محل أدوات التصميم التقليدية — ولماذا أفضلها يحافظ على هويتك البصرية.",
      content: `مدير السوشيال ميديا العادي ينشئ ١٥ إلى ٢٥ منشوراً أسبوعياً عبر منصات متعددة. بمعدل ٣٠ إلى ٦٠ دقيقة لكل منشور باستخدام أدوات التصميم التقليدية، هذا أسبوع عمل كامل يُنفق على الإنتاج وحده. مولّدات منشورات الذكاء الاصطناعي تغير هذه المعادلة بشكل جذري.

## ما الذي يجعل مولّد المنشورات بالذكاء الاصطناعي جيداً

ليست كل أدوات التصميم بالذكاء الاصطناعي متساوية. أفضلها تفهم ثلاثة عناصر حاسمة: هويتك البصرية، وأهداف محتواك، ومتطلبات المنصة. أداة تولّد تصاميم عشوائية بألوان عشوائية ليست أفضل من مكتبة قوالب. القيمة الحقيقية تأتي من ذكاء اصطناعي يتعلم لوحة ألوان علامتك التجارية ويحترم اختياراتك للخطوط ويكيّف التخطيطات لتتوافق مع هويتك البصرية.

## أبعد من القوالب: تصاميم مولّدة بالذكاء الاصطناعي حقاً

أدوات القوالب التقليدية تعطيك تخطيطاً ثابتاً تملؤه بمحتواك. مولّدات الذكاء الاصطناعي تعمل بشكل مختلف. تحلل علامتك التجارية ورسالتك وتفضيلاتك البصرية، ثم تنشئ تصاميم أصلية بالكامل من الصفر. كل منشور فريد — وليس نسخة معدّلة قليلاً من نفس القالب الذي تستخدمه كل شركة أخرى.

## من الوصف إلى المنشور: كيف تعمل العملية

مولّدات المنشورات الحديثة تتبع سير عمل بسيط. تصف ما تريد — سواء كان إعلان منتج أو اقتباس تحفيزي أو عرض ميزة تطبيق — والذكاء الاصطناعي يولّد عدة تنويعات تصميمية. تختار ما يعجبك، تخصص النص إذا لزم الأمر، وتصدّره بالأبعاد المناسبة لمنصتك المستهدفة. العملية بأكملها تستغرق أقل من دقيقة.

## العائد على الاستثمار

الحساب واضح. إذا وفّر مدير السوشيال ميديا ٢٠ ساعة أسبوعياً من إنتاج التصميم، يمكن توجيه ذلك الوقت نحو الاستراتيجية والتفاعل مع المجتمع وتخطيط الحملات — أنشطة تدفع النمو مباشرة. للمستقلين والشركات الصغيرة، مولّدات المنشورات بالذكاء الاصطناعي تلغي الحاجة لتوظيف مصمم مخصص.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 8 * DAY,
      tags: ["ذكاء اصطناعي", "تصميم", "أدوات", "إنتاجية"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "النشر على إنستغرام وفيسبوك وثريدز من لوحة تحكم واحدة",
      slug: "publish-instagram-facebook-threads-one-dashboard-ar",
      excerpt:
        "توقف عن التنقل بين التطبيقات. تعلّم كيف تربط حساباتك الاجتماعية وتنشر في كل مكان من أداة واحدة.",
      content: `إدارة حسابات سوشيال ميديا متعددة من أكثر المهام استهلاكاً للوقت في التسويق الرقمي. تصمم منشوراً، ثم تسجل الدخول في إنستغرام لنشره، تنتقل إلى فيسبوك لنشر نسخة مختلفة قليلاً، تفتح ثريدز لمشاركة النص، ثم تذهب لتويتر. بحلول الوقت الذي تنتهي فيه، ضاعت ساعة كاملة.

## لماذا النشر الموحّد

النشر المركزي ليس مجرد راحة — إنه يتعلق بالاتساق والكفاءة. عندما تدير جميع قنواتك من مكان واحد، تضمن وصول نفس الرسالة لجميع جمهورك في الوقت المناسب. كما تتخلص من كابوس تتبع أي صورة ذهبت أين وأي تعليق استخدمت على أي منصة.

## ربط حساباتك الاجتماعية

أدوات السوشيال ميديا الحديثة تستخدم OAuth لربط حساباتك بأمان. هذا يعني أنك تفوّض الأداة للنشر نيابة عنك دون مشاركة كلمة مرورك أبداً. عملية الإعداد عادة تستغرق أقل من خمس دقائق: انقر ربط، سجّل الدخول في حسابك الاجتماعي، امنح صلاحيات النشر، وانتهيت. رموز التوثيق مشفّرة ومخزّنة بأمان.

## صمّم مرة واحدة، انشر في كل مكان

القوة الحقيقية للوحة تحكم موحدة هي القدرة على إنشاء منشور واحد وتكييفه لكل منصة تلقائياً. صمم منشورك في المحرر البصري، اكتب تعليقك، اختر القنوات التي تريد النشر عليها، واضغط إرسال. الأداة تتولى التفاصيل التقنية — تعديل أبعاد الصور واحترام حدود الأحرف وتنسيق الهاشتاغات بشكل مناسب لكل منصة.

## الجدولة عبر المنصات

ليس كل منصة تبلغ ذروتها في نفس الوقت. جمهور إنستغرام قد يكون أكثر نشاطاً ظهراً، بينما متابعو تويتر يتفاعلون أكثر خلال التنقل الصباحي. لوحة التحكم الموحدة تتيح لك جدولة أوقات نشر خاصة بكل منصة مع إدارة كل شيء من عرض تقويم واحد.

## النشر المجمّع لأقصى كفاءة

للشركات التي تحتاج للحفاظ على وتيرة نشر عالية، النشر المجمّع تحويلي. بدلاً من جدولة المنشورات واحداً تلو الآخر، يمكنك اختيار عدة منشورات، تعيينها لقنوات مختلفة، توزيع أوقات نشرها، وترتيبها كلها في إجراء واحد. أسبوع من المحتوى عبر أربع منصات يمكن جدولته في دقائق.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 12 * DAY,
      tags: ["نشر", "إنستغرام", "فيسبوك", "ثريدز", "متعدد المنصات"],
      published: true,
    });

    await ctx.db.insert("blogs", {
      title: "الهوية البصرية لسوشيال ميديا: لماذا ألوانك وخطوطك وشعارك أهم مما تظن",
      slug: "brand-kit-social-media-colors-fonts-logo-ar",
      excerpt:
        "هويتك البصرية هي أساس كل منشور على السوشيال ميديا. تعلّم كيف تضبط ألوانك وخطوطك وشعارك للتعرّف الفوري عبر جميع المنصات.",
      content: `تصفّح أي حساب علامة تجارية ناجحة على السوشيال ميديا وستلاحظ شيئاً فوراً: كل منشور يبدو وكأنه ينتمي. الألوان متسقة، والخطوط مقصودة، والجمالية العامة لا تُخطئها. هذا ليس صدفة — إنه نتيجة هوية بصرية محددة جيداً.

## ما هي الهوية البصرية للسوشيال ميديا

الهوية البصرية هي مجموعة إرشادات بصرية تحدد كيف تبدو علامتك التجارية عبر كل نقطة اتصال. للسوشيال ميديا تحديداً، تشمل ألوانك الأساسية والثانوية، وخطوط العناوين والنص، وتنويعات شعارك، وأي عناصر بصرية متكررة.

## علم نفس الاتساق في العلامات التجارية

الدراسات تُظهر أن العرض المتسق للعلامة التجارية يزيد الإيرادات بنسبة تصل إلى ٢٣ بالمئة. على السوشيال ميديا، حيث تُقاس فترات الانتباه بالمللي ثانية، اتساق العلامة التجارية أكثر أهمية. عندما يرى متابع منشورك في موجز مزدحم، يجب أن يتعرف عليه كمنشورك قبل قراءة كلمة واحدة. هذا التعرّف الفوري يبني الثقة، والثقة تدفع التفاعل.

## إعداد لوحة الألوان

ألوان علامتك التجارية تفعل أكثر من مجرد الظهور بشكل جميل — إنها تتواصل عاطفياً. الأزرق ينقل الثقة والاحترافية. الأخضر يوحي بالنمو والاستدامة. البرتقالي يشع بالطاقة والإبداع. اختر لوناً أساسياً يتوافق مع شخصية علامتك التجارية، ثم أضف لونين إلى ثلاثة ألوان مكمّلة للتنوع.

المفتاح هو استخدام هذه الألوان بشكل متسق عبر كل منشور. عندما تعرف أداة التصميم بالذكاء الاصطناعي لوحة ألوان علامتك التجارية، كل منشور مولّد يستخدم الألوان الصحيحة تلقائياً.

## اختيار الخطوط التي تتحدث بهوية علامتك

الخطوط هي صوت هويتك البصرية. شركة تقنية ناشئة قد تستخدم خط سان سيريف هندسي نظيف للتعبير عن الحداثة والدقة. مخبز قد يميل نحو خط سيريف دافئ لإثارة الدفء والحرفية. مهما اخترت، اقتصر على خطين — واحد للعناوين وآخر للنص.

## جمع كل شيء معاً

سحر الهوية البصرية هو الأتمتة. بمجرد تحديد ألوانك وخطوطك وشعارك، كل منشور تنشئه — سواء يدوياً أو بالذكاء الاصطناعي — يرث هوية علامتك التجارية تلقائياً. يستغرق الإعداد ٣٠ دقيقة ويوفر مئات الساعات من قرارات التصميم طوال العام.`,
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now - 16 * DAY,
      tags: ["هوية بصرية", "تصميم", "علامة تجارية", "سوشيال ميديا"],
      published: true,
    });

    return { message: "Seeded 14 blog posts (7 English + 7 Arabic)" };
  },
});

// Seed use-case entries (English + Arabic)
export const seedUseCases = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing use-case records
    const existing = await ctx.db
      .query("blogs")
      .withIndex("by_type_language", (q) => q.eq("type", "use-case"))
      .collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }

    const now = Date.now();

    // ─── 1. small-business-owners ───────────────────────

    await ctx.db.insert("blogs", {
      title: "Social Media Design for Small Businesses",
      slug: "small-business-owners",
      excerpt:
        "Create professional social media posts without a designer. AI generates on-brand Instagram, Facebook, and Twitter posts for your small business in seconds.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "small business social media",
        "social media design tool small business",
        "AI post generator small business",
        "affordable social media design",
        "small business Instagram posts",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Design Tool for Small Businesses | oDesigns",
      keywords: [
        "small business social media",
        "social media design tool small business",
        "AI post generator small business",
        "affordable social media design",
        "small business Instagram posts",
      ],
      heroTitle:
        "Professional social media posts — without the agency price tag",
      heroSubtitle:
        "Small businesses need a consistent social media presence but can not afford a full-time designer. oDesigns generates on-brand posts in seconds so you can focus on running your business.",
      ctaTitle: "Start creating professional posts today",
      ctaSubtitle:
        "Join thousands of small businesses using AI to maintain a professional social media presence. Free to start.",
      sections: [
        {
          sectionType: "painPoint",
          title: "No design skills required",
          description:
            "You started a business, not a design studio. oDesigns uses AI to create professional-quality posts that match your brand — no Photoshop or Canva skills needed.",
        },
        {
          sectionType: "painPoint",
          title: "Hours saved every week",
          description:
            "Stop spending evenings crafting social media posts. Describe what you want, and AI generates multiple design variations in under a minute. Batch a full week of content in one sitting.",
        },
        {
          sectionType: "painPoint",
          title: "Consistent brand look",
          description:
            "Set your brand colors, fonts, and logo once. Every AI-generated post automatically uses your brand identity, making your feed look like it was designed by a professional.",
        },
        {
          sectionType: "feature",
          title: "AI post generation",
          description:
            "Describe your product, promotion, or message. AI creates multiple post designs tailored to your brand.",
          icon: "Sparkles",
        },
        {
          sectionType: "feature",
          title: "Multi-platform publishing",
          description:
            "Publish to Instagram, Facebook, Threads, and Twitter from one dashboard. No more switching between apps.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "Brand kit",
          description:
            "Upload your logo, set your colors and fonts. Every post stays on-brand automatically.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "Bulk scheduling",
          description:
            "Schedule a full week of posts in minutes. Set it and forget it — your social media runs on autopilot.",
          icon: "CalendarDays",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "تصميم سوشيال ميديا للشركات الصغيرة",
      slug: "small-business-owners",
      excerpt:
        "أنشئ منشورات سوشيال ميديا احترافية بدون مصمم. الذكاء الاصطناعي يولّد منشورات متوافقة مع هويتك لإنستغرام وفيسبوك وتويتر في ثوانٍ.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "small business social media",
        "social media design tool small business",
        "AI post generator small business",
        "affordable social media design",
        "small business Instagram posts",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "أداة تصميم سوشيال ميديا بالذكاء الاصطناعي للشركات الصغيرة | oDesigns",
      keywords: [
        "small business social media",
        "social media design tool small business",
        "AI post generator small business",
        "affordable social media design",
        "small business Instagram posts",
      ],
      heroTitle: "منشورات سوشيال ميديا احترافية — بدون تكلفة الوكالات",
      heroSubtitle:
        "الشركات الصغيرة تحتاج حضوراً ثابتاً على السوشيال ميديا لكن لا تستطيع تحمّل تكلفة مصمم متفرّغ. oDesigns يولّد منشورات متوافقة مع هويتك في ثوانٍ.",
      ctaTitle: "ابدأ بإنشاء منشورات احترافية اليوم",
      ctaSubtitle:
        "انضم لآلاف الشركات الصغيرة التي تستخدم الذكاء الاصطناعي. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "لا تحتاج مهارات تصميم",
          description:
            "oDesigns يستخدم الذكاء الاصطناعي لإنشاء منشورات احترافية تتوافق مع علامتك التجارية — بدون فوتوشوب أو كانفا.",
        },
        {
          sectionType: "painPoint",
          title: "ساعات موفّرة كل أسبوع",
          description:
            "صِف ما تريد، والذكاء الاصطناعي يولّد تصاميم متعددة في أقل من دقيقة. أنشئ محتوى أسبوع كامل في جلسة واحدة.",
        },
        {
          sectionType: "painPoint",
          title: "مظهر متسق للعلامة التجارية",
          description:
            "حدد ألوان وخطوط وشعار علامتك التجارية مرة واحدة. كل منشور مولّد يستخدم هويتك تلقائياً.",
        },
        {
          sectionType: "feature",
          title: "توليد المنشورات بالذكاء الاصطناعي",
          description:
            "صِف منتجك أو عرضك. الذكاء الاصطناعي ينشئ تصاميم متعددة مخصصة لعلامتك التجارية.",
          icon: "Sparkles",
        },
        {
          sectionType: "feature",
          title: "النشر على منصات متعددة",
          description:
            "انشر على إنستغرام وفيسبوك وثريدز وتويتر من لوحة تحكم واحدة.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "الهوية البصرية",
          description:
            "ارفع شعارك، حدد ألوانك وخطوطك. كل منشور يبقى متوافقاً مع هويتك تلقائياً.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "الجدولة المجمّعة",
          description:
            "جدوِل أسبوعاً كاملاً من المنشورات في دقائق. سوشيال ميديا تعمل تلقائياً.",
          icon: "CalendarDays",
        },
      ],
    });

    // ─── 2. real-estate-agents ──────────────────────────

    await ctx.db.insert("blogs", {
      title: "Social Media Marketing for Real Estate Agents",
      slug: "real-estate-agents",
      excerpt:
        "Generate stunning property listing posts, open house announcements, and real estate marketing content with AI. Stand out on Instagram and Facebook.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "real estate social media posts",
        "real estate Instagram marketing",
        "property listing social media",
        "real estate agent marketing tool",
        "AI real estate post generator",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Posts for Real Estate Agents | oDesigns",
      keywords: [
        "real estate social media posts",
        "real estate Instagram marketing",
        "property listing social media",
        "real estate agent marketing tool",
        "AI real estate post generator",
      ],
      heroTitle:
        "Turn listings into scroll-stopping social media posts",
      heroSubtitle:
        "Real estate moves fast. Your social media should too. Generate professional property posts, open house announcements, and market updates in seconds — not hours.",
      ctaTitle: "Start marketing your listings smarter",
      ctaSubtitle:
        "Join real estate professionals using AI to create listing posts, open house content, and market updates. Free to start.",
      sections: [
        {
          sectionType: "painPoint",
          title: "Listings go live faster",
          description:
            "New listing? Generate a polished social media post in seconds. Upload a property photo, add the details, and AI creates multiple design variations ready to publish across all your channels.",
        },
        {
          sectionType: "painPoint",
          title: "Stand out in a crowded market",
          description:
            "Every agent posts listings. The ones who get noticed use consistent, professional branding. oDesigns ensures every post matches your personal brand — building recognition and trust.",
        },
        {
          sectionType: "painPoint",
          title: "More time for clients",
          description:
            "Stop spending hours creating marketing materials. Batch your social media content for the week in one sitting and spend the rest of your time closing deals.",
        },
        {
          sectionType: "feature",
          title: "Property showcase posts",
          description:
            "AI generates beautiful listing posts with property details, pricing, and your contact info — ready for Instagram and Facebook.",
          icon: "Home",
        },
        {
          sectionType: "feature",
          title: "Scheduled open house posts",
          description:
            "Create and schedule open house announcements, reminders, and follow-ups automatically across all platforms.",
          icon: "CalendarDays",
        },
        {
          sectionType: "feature",
          title: "Personal brand consistency",
          description:
            "Set your headshot, brand colors, and brokerage logo. Every post reinforces your professional identity.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "Market update content",
          description:
            "Position yourself as a local expert with AI-generated market insight posts that keep your audience engaged between listings.",
          icon: "TrendingUp",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "تسويق عقاري عبر السوشيال ميديا",
      slug: "real-estate-agents",
      excerpt:
        "أنشئ منشورات عقارية مذهلة وإعلانات يوم مفتوح ومحتوى تسويقي بالذكاء الاصطناعي. تميّز على إنستغرام وفيسبوك.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "real estate social media posts",
        "real estate Instagram marketing",
        "property listing social media",
        "real estate agent marketing tool",
        "AI real estate post generator",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "منشورات سوشيال ميديا بالذكاء الاصطناعي للوكلاء العقاريين | oDesigns",
      keywords: [
        "real estate social media posts",
        "real estate Instagram marketing",
        "property listing social media",
        "real estate agent marketing tool",
        "AI real estate post generator",
      ],
      heroTitle: "حوّل العقارات إلى منشورات توقف التمرير",
      heroSubtitle:
        "العقارات تتحرك بسرعة. سوشيال ميديا يجب أن تواكبها. أنشئ منشورات عقارية احترافية وإعلانات يوم مفتوح في ثوانٍ.",
      ctaTitle: "ابدأ تسويق عقاراتك بذكاء",
      ctaSubtitle:
        "انضم للمحترفين العقاريين الذين يستخدمون الذكاء الاصطناعي. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "العقارات تُنشر أسرع",
          description:
            "عقار جديد؟ أنشئ منشوراً احترافياً في ثوانٍ. ارفع صور العقار وأضف التفاصيل، والذكاء الاصطناعي ينشئ تصاميم متعددة.",
        },
        {
          sectionType: "painPoint",
          title: "تميّز في سوق مزدحم",
          description:
            "كل وكيل ينشر عقارات. الذين يلفتون الانتباه يستخدمون هوية بصرية احترافية متسقة. oDesigns يضمن تطابق كل منشور مع علامتك.",
        },
        {
          sectionType: "painPoint",
          title: "وقت أكثر للعملاء",
          description:
            "توقف عن قضاء ساعات في إنشاء مواد تسويقية. أنشئ محتوى أسبوع كامل في جلسة واحدة واقضِ باقي وقتك في إتمام الصفقات.",
        },
        {
          sectionType: "feature",
          title: "منشورات عرض العقارات",
          description:
            "الذكاء الاصطناعي ينشئ منشورات جميلة بتفاصيل العقار والأسعار ومعلومات التواصل.",
          icon: "Home",
        },
        {
          sectionType: "feature",
          title: "منشورات يوم مفتوح مجدولة",
          description:
            "أنشئ وجدوِل إعلانات اليوم المفتوح والتذكيرات تلقائياً عبر جميع المنصات.",
          icon: "CalendarDays",
        },
        {
          sectionType: "feature",
          title: "اتساق العلامة الشخصية",
          description:
            "حدد صورتك وألوان علامتك وشعار الوساطة. كل منشور يعزز هويتك المهنية.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "محتوى تحديثات السوق",
          description:
            "ضع نفسك كخبير محلي بمنشورات تحليلات السوق المولّدة بالذكاء الاصطناعي.",
          icon: "TrendingUp",
        },
      ],
    });

    // ─── 3. restaurants-and-cafes ────────────────────────

    await ctx.db.insert("blogs", {
      title: "Social Media Design for Restaurants and Cafes",
      slug: "restaurants-and-cafes",
      excerpt:
        "Create mouth-watering social media posts for your restaurant or cafe. AI generates menu highlights, promotions, and food photography posts in seconds.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "restaurant social media posts",
        "cafe Instagram marketing",
        "food social media design",
        "restaurant marketing tool",
        "AI food post generator",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Posts for Restaurants & Cafes | oDesigns",
      keywords: [
        "restaurant social media posts",
        "cafe Instagram marketing",
        "food social media design",
        "restaurant marketing tool",
        "AI food post generator",
      ],
      heroTitle: "Make your menu the star of every feed",
      heroSubtitle:
        "Great food deserves great presentation — online and offline. Generate stunning menu posts, daily specials, and seasonal promotions that make followers hungry.",
      ctaTitle: "Start showcasing your menu today",
      ctaSubtitle:
        "Join restaurants and cafes using AI to create stunning food posts and promotions. Free to start.",
      sections: [
        {
          sectionType: "painPoint",
          title: "Daily specials, instantly posted",
          description:
            "Changed the menu today? Generate a beautiful post in seconds. AI creates designs that showcase your dishes with the same care you put into cooking them.",
        },
        {
          sectionType: "painPoint",
          title: "Seasonal campaigns made easy",
          description:
            "Ramadan menu, summer drinks, holiday specials — generate an entire campaign of posts in one session. Schedule them across the season and focus on your kitchen.",
        },
        {
          sectionType: "painPoint",
          title: "Consistent food branding",
          description:
            "Your restaurant has a vibe. Your social media should match. Set your brand identity once, and every post — from breakfast promos to late-night offers — looks like it belongs.",
        },
        {
          sectionType: "feature",
          title: "Menu highlight posts",
          description:
            "Showcase your best dishes with AI-generated designs that combine food photography with appetizing typography and your brand colors.",
          icon: "UtensilsCrossed",
        },
        {
          sectionType: "feature",
          title: "Promotion and offer posts",
          description:
            "Happy hour, lunch deals, catering packages — generate professional promotional posts that drive foot traffic.",
          icon: "Tag",
        },
        {
          sectionType: "feature",
          title: "Multi-location support",
          description:
            "Managing multiple locations? Create location-specific content from one dashboard with workspace-level brand settings.",
          icon: "MapPin",
        },
        {
          sectionType: "feature",
          title: "Schedule across platforms",
          description:
            "Post to Instagram, Facebook, and more from one place. Schedule a week of food content in minutes.",
          icon: "CalendarDays",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "تصميم سوشيال ميديا للمطاعم والكافيهات",
      slug: "restaurants-and-cafes",
      excerpt:
        "أنشئ منشورات سوشيال ميديا شهية لمطعمك أو كافيهك. الذكاء الاصطناعي يولّد تصاميم للقوائم والعروض اليومية والترويج الموسمي في ثوانٍ.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "restaurant social media posts",
        "cafe Instagram marketing",
        "food social media design",
        "restaurant marketing tool",
        "AI food post generator",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "منشورات سوشيال ميديا بالذكاء الاصطناعي للمطاعم والكافيهات | oDesigns",
      keywords: [
        "restaurant social media posts",
        "cafe Instagram marketing",
        "food social media design",
        "restaurant marketing tool",
        "AI food post generator",
      ],
      heroTitle: "اجعل قائمتك نجمة كل موجز",
      heroSubtitle:
        "الطعام الرائع يستحق عرضاً رائعاً. أنشئ منشورات قوائم مذهلة وعروض يومية وترويج موسمي يجعل المتابعين يشعرون بالجوع.",
      ctaTitle: "ابدأ بعرض قائمتك اليوم",
      ctaSubtitle:
        "انضم للمطاعم والكافيهات التي تستخدم الذكاء الاصطناعي. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "العروض اليومية تُنشر فوراً",
          description:
            "غيّرت القائمة اليوم؟ أنشئ منشوراً جميلاً في ثوانٍ. الذكاء الاصطناعي يصمم أطباقك بنفس العناية التي تضعها في طهيها.",
        },
        {
          sectionType: "painPoint",
          title: "الحملات الموسمية بسهولة",
          description:
            "قائمة رمضان، مشروبات الصيف، عروض الأعياد — أنشئ حملة كاملة في جلسة واحدة. جدوِلها وركّز على مطبخك.",
        },
        {
          sectionType: "painPoint",
          title: "هوية بصرية متسقة للطعام",
          description:
            "مطعمك له أجواؤه. سوشيال ميديا يجب أن تتطابق. حدد هويتك مرة واحدة وكل منشور سيبدو متناسقاً.",
        },
        {
          sectionType: "feature",
          title: "منشورات إبراز القائمة",
          description:
            "اعرض أفضل أطباقك بتصاميم تجمع تصوير الطعام مع الطباعة الشهية وألوان علامتك.",
          icon: "UtensilsCrossed",
        },
        {
          sectionType: "feature",
          title: "منشورات العروض والترويج",
          description:
            "ساعة سعيدة، عروض الغداء، باقات التموين — أنشئ منشورات ترويجية احترافية تجذب الزبائن.",
          icon: "Tag",
        },
        {
          sectionType: "feature",
          title: "دعم المواقع المتعددة",
          description:
            "تدير عدة فروع؟ أنشئ محتوى خاصاً بكل موقع من لوحة تحكم واحدة.",
          icon: "MapPin",
        },
        {
          sectionType: "feature",
          title: "الجدولة عبر المنصات",
          description:
            "انشر على إنستغرام وفيسبوك وأكثر من مكان واحد. جدوِل أسبوع من محتوى الطعام في دقائق.",
          icon: "CalendarDays",
        },
      ],
    });

    // ─── 4. freelance-designers ─────────────────────────

    await ctx.db.insert("blogs", {
      title: "Social Media Automation for Freelance Designers",
      slug: "freelance-designers",
      excerpt:
        "Automate your social media presence as a freelancer. Generate portfolio showcases, client work highlights, and personal brand content with AI.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "freelancer social media tool",
        "designer social media automation",
        "freelance portfolio posts",
        "personal brand social media",
        "AI content for freelancers",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Tool for Freelance Designers | oDesigns",
      keywords: [
        "freelancer social media tool",
        "designer social media automation",
        "freelance portfolio posts",
        "personal brand social media",
        "AI content for freelancers",
      ],
      heroTitle:
        "Your portfolio, everywhere — without the extra work",
      heroSubtitle:
        "You design for clients all day. The last thing you want is to spend your evenings designing your own social media. Let AI handle your online presence while you focus on billable work.",
      ctaTitle: "Automate your social media presence",
      ctaSubtitle:
        "Join freelancers using AI to maintain a professional online presence. Free to start — no design work required.",
      sections: [
        {
          sectionType: "painPoint",
          title: "Portfolio posts on autopilot",
          description:
            "Finished a client project? Generate a beautiful case study post in seconds. Showcase your work consistently without carving hours out of your schedule.",
        },
        {
          sectionType: "painPoint",
          title: "Build your personal brand",
          description:
            "The freelancers who win clients are the ones who stay visible. Maintain a professional social media presence with scheduled, on-brand posts — even during busy seasons.",
        },
        {
          sectionType: "painPoint",
          title: "One tool, all platforms",
          description:
            "Stop designing separate posts for Instagram, Twitter, and LinkedIn. Create once, adapt to every platform automatically, and publish from one dashboard.",
        },
        {
          sectionType: "feature",
          title: "Portfolio showcase posts",
          description:
            "Turn screenshots and project details into polished portfolio posts that attract new clients.",
          icon: "Image",
        },
        {
          sectionType: "feature",
          title: "Personal brand kit",
          description:
            "Set your signature style — colors, fonts, logo. Every generated post reinforces your professional identity.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "Batch content creation",
          description:
            "Generate a month of social media content in one session. Schedule it all and get back to client work.",
          icon: "Layers",
        },
        {
          sectionType: "feature",
          title: "Multi-platform publishing",
          description:
            "Post to Instagram, Twitter, Threads, and Facebook simultaneously. Reach clients wherever they are.",
          icon: "Share2",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "أتمتة السوشيال ميديا للمصممين المستقلين",
      slug: "freelance-designers",
      excerpt:
        "أتمت حضورك على السوشيال ميديا كمستقل. أنشئ عروض أعمالك ومحتوى علامتك الشخصية بالذكاء الاصطناعي.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "freelancer social media tool",
        "designer social media automation",
        "freelance portfolio posts",
        "personal brand social media",
        "AI content for freelancers",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "أداة سوشيال ميديا بالذكاء الاصطناعي للمصممين المستقلين | oDesigns",
      keywords: [
        "freelancer social media tool",
        "designer social media automation",
        "freelance portfolio posts",
        "personal brand social media",
        "AI content for freelancers",
      ],
      heroTitle: "معرض أعمالك في كل مكان — بدون جهد إضافي",
      heroSubtitle:
        "تصمم للعملاء طوال اليوم. آخر شيء تريده هو قضاء أمسياتك في تصميم سوشيال ميديا خاصة بك. دع الذكاء الاصطناعي يتولى حضورك الرقمي.",
      ctaTitle: "أتمت حضورك على السوشيال ميديا",
      ctaSubtitle:
        "انضم للمستقلين الذين يستخدمون الذكاء الاصطناعي. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "منشورات معرض الأعمال تلقائياً",
          description:
            "أنهيت مشروعاً للعميل؟ أنشئ منشور دراسة حالة جميل في ثوانٍ. اعرض أعمالك باستمرار بدون اقتطاع ساعات من جدولك.",
        },
        {
          sectionType: "painPoint",
          title: "ابنِ علامتك الشخصية",
          description:
            "المستقلون الذين يكسبون العملاء هم الذين يبقون مرئيين. حافظ على حضور احترافي بمنشورات مجدولة ومتوافقة مع هويتك.",
        },
        {
          sectionType: "painPoint",
          title: "أداة واحدة، كل المنصات",
          description:
            "توقف عن تصميم منشورات منفصلة لكل منصة. صمم مرة واحدة وانشر من لوحة تحكم واحدة.",
        },
        {
          sectionType: "feature",
          title: "منشورات عرض الأعمال",
          description:
            "حوّل لقطات الشاشة وتفاصيل المشاريع إلى منشورات معرض أعمال مصقولة تجذب عملاء جدد.",
          icon: "Image",
        },
        {
          sectionType: "feature",
          title: "الهوية البصرية الشخصية",
          description:
            "حدد أسلوبك المميز — الألوان والخطوط والشعار. كل منشور مولّد يعزز هويتك المهنية.",
          icon: "Palette",
        },
        {
          sectionType: "feature",
          title: "إنشاء المحتوى بالجملة",
          description:
            "أنشئ شهراً من محتوى السوشيال ميديا في جلسة واحدة. جدوِله وعُد لعمل العملاء.",
          icon: "Layers",
        },
        {
          sectionType: "feature",
          title: "النشر على منصات متعددة",
          description:
            "انشر على إنستغرام وتويتر وثريدز وفيسبوك في وقت واحد.",
          icon: "Share2",
        },
      ],
    });

    // ─── 5. ecommerce-brands ────────────────────────────

    await ctx.db.insert("blogs", {
      title: "Social Media Marketing for E-Commerce Brands",
      slug: "ecommerce-brands",
      excerpt:
        "Generate product launch posts, sale announcements, and e-commerce marketing content with AI. Drive traffic from Instagram and Facebook to your online store.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "ecommerce social media marketing",
        "product launch social media posts",
        "online store Instagram marketing",
        "AI ecommerce post generator",
        "social media for online stores",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Posts for E-Commerce & Online Stores | oDesigns",
      keywords: [
        "ecommerce social media marketing",
        "product launch social media posts",
        "online store Instagram marketing",
        "AI ecommerce post generator",
        "social media for online stores",
      ],
      heroTitle: "Turn products into posts that drive sales",
      heroSubtitle:
        "Your products look great in your store. Make them look just as good on social media. Generate product posts, sale announcements, and seasonal campaigns that drive traffic and conversions.",
      ctaTitle: "Start marketing your products smarter",
      ctaSubtitle:
        "Join e-commerce brands using AI to create product posts and drive social media sales. Free to start.",
      sections: [
        {
          sectionType: "painPoint",
          title: "Product launch posts in seconds",
          description:
            "New product drop? Generate launch announcements, teaser posts, and feature highlights instantly. AI creates multiple design variations so you can pick the best one.",
        },
        {
          sectionType: "painPoint",
          title: "Sale campaigns at scale",
          description:
            "Flash sales, seasonal clearance, bundle deals — generate an entire promotional campaign in one session. Schedule posts to build anticipation before, during, and after the sale.",
        },
        {
          sectionType: "painPoint",
          title: "Consistent catalog aesthetic",
          description:
            "Every product post should feel like part of the same brand. Your brand kit ensures visual consistency across hundreds of product posts without manual design work.",
        },
        {
          sectionType: "feature",
          title: "Product showcase posts",
          description:
            "Upload product images and let AI create stunning social media posts with pricing, features, and your brand styling.",
          icon: "ShoppingBag",
        },
        {
          sectionType: "feature",
          title: "Sale and promotion designs",
          description:
            "Generate eye-catching sale banners, countdown posts, and limited-time offer announcements that create urgency.",
          icon: "Tag",
        },
        {
          sectionType: "feature",
          title: "Multi-platform publishing",
          description:
            "Publish product posts to Instagram, Facebook, Twitter, and Threads simultaneously to maximize reach.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "Bulk scheduling",
          description:
            "Schedule an entire product launch campaign across platforms in minutes. Plan weeks of content in one session.",
          icon: "CalendarDays",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "تسويق سوشيال ميديا للمتاجر الإلكترونية",
      slug: "ecommerce-brands",
      excerpt:
        "أنشئ منشورات إطلاق المنتجات وإعلانات التخفيضات ومحتوى التسويق الإلكتروني بالذكاء الاصطناعي. جذب الزوار من إنستغرام وفيسبوك لمتجرك.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "ecommerce social media marketing",
        "product launch social media posts",
        "online store Instagram marketing",
        "AI ecommerce post generator",
        "social media for online stores",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "منشورات سوشيال ميديا بالذكاء الاصطناعي للمتاجر الإلكترونية | oDesigns",
      keywords: [
        "ecommerce social media marketing",
        "product launch social media posts",
        "online store Instagram marketing",
        "AI ecommerce post generator",
        "social media for online stores",
      ],
      heroTitle: "حوّل المنتجات إلى منشورات تحقق مبيعات",
      heroSubtitle:
        "منتجاتك تبدو رائعة في متجرك. اجعلها تبدو بنفس الروعة على السوشيال ميديا. أنشئ منشورات المنتجات والتخفيضات والحملات الموسمية.",
      ctaTitle: "ابدأ تسويق منتجاتك بذكاء",
      ctaSubtitle:
        "انضم للعلامات التجارية الإلكترونية التي تستخدم الذكاء الاصطناعي. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "منشورات إطلاق المنتجات في ثوانٍ",
          description:
            "منتج جديد؟ أنشئ إعلانات الإطلاق ومنشورات التشويق وإبراز الميزات فوراً. الذكاء الاصطناعي ينشئ تنويعات تصميمية متعددة.",
        },
        {
          sectionType: "painPoint",
          title: "حملات التخفيضات على نطاق واسع",
          description:
            "تخفيضات سريعة، تصفية موسمية، عروض الباقات — أنشئ حملة ترويجية كاملة في جلسة واحدة وجدوِلها.",
        },
        {
          sectionType: "painPoint",
          title: "جمالية كتالوج متسقة",
          description:
            "كل منشور منتج يجب أن يبدو جزءاً من نفس العلامة التجارية. هويتك البصرية تضمن الاتساق البصري عبر مئات المنشورات.",
        },
        {
          sectionType: "feature",
          title: "منشورات عرض المنتجات",
          description:
            "ارفع صور المنتجات ودع الذكاء الاصطناعي ينشئ منشورات مذهلة بالأسعار والميزات وتصميم علامتك.",
          icon: "ShoppingBag",
        },
        {
          sectionType: "feature",
          title: "تصاميم التخفيضات والعروض",
          description:
            "أنشئ لافتات تخفيضات جذابة ومنشورات عد تنازلي وإعلانات عروض محدودة تخلق إلحاحاً.",
          icon: "Tag",
        },
        {
          sectionType: "feature",
          title: "النشر على منصات متعددة",
          description:
            "انشر منشورات المنتجات على إنستغرام وفيسبوك وتويتر وثريدز في وقت واحد.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "الجدولة المجمّعة",
          description:
            "جدوِل حملة إطلاق منتج كاملة عبر المنصات في دقائق.",
          icon: "CalendarDays",
        },
      ],
    });

    // ─── 6. marketing-agencies ──────────────────────────

    await ctx.db.insert("blogs", {
      title: "AI Social Media Tool for Marketing Agencies",
      slug: "marketing-agencies",
      excerpt:
        "Scale your agency's social media output with AI. Generate on-brand posts for multiple clients, manage separate brand kits, and publish across platforms.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "marketing agency social media tool",
        "agency social media management",
        "multi-client social media",
        "AI content generation agency",
        "white label social media tool",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "AI Social Media Post Generator for Marketing Agencies | oDesigns",
      keywords: [
        "marketing agency social media tool",
        "agency social media management",
        "multi-client social media",
        "AI content generation agency",
        "white label social media tool",
      ],
      heroTitle:
        "Scale your client output without scaling your team",
      heroSubtitle:
        "More clients should not mean more designers. Generate on-brand social media content for every client from one platform — with separate brand kits, workspaces, and publishing channels.",
      ctaTitle: "Scale your agency with AI",
      ctaSubtitle:
        "Join agencies using oDesigns to manage multi-client social media at scale. Free to start.",
      sections: [
        {
          sectionType: "painPoint",
          title: "Separate workspaces per client",
          description:
            "Each client gets their own workspace with unique brand colors, fonts, logos, and connected social accounts. Switch between clients in one click — no cross-contamination.",
        },
        {
          sectionType: "painPoint",
          title: "10x content output",
          description:
            "What used to take a designer 30 minutes per post now takes seconds. Generate multiple variations, pick the best, and move on. Your team handles strategy while AI handles production.",
        },
        {
          sectionType: "painPoint",
          title: "Consistent quality at scale",
          description:
            "Every generated post respects the client's brand guidelines automatically. No more junior designer mistakes. No more off-brand colors or wrong fonts.",
        },
        {
          sectionType: "feature",
          title: "Multi-workspace management",
          description:
            "Create separate workspaces for each client with independent brand kits, post libraries, and publishing schedules.",
          icon: "Building2",
        },
        {
          sectionType: "feature",
          title: "AI-powered generation",
          description:
            "Generate dozens of on-brand posts per client in minutes. Multiple AI engines for different creative styles.",
          icon: "Sparkles",
        },
        {
          sectionType: "feature",
          title: "Cross-platform publishing",
          description:
            "Connect each client's social accounts and publish from their workspace. Instagram, Facebook, Threads, Twitter — all managed centrally.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "Brand kit per client",
          description:
            "Store each client's colors, fonts, and logos. AI uses these automatically — ensuring every post is on-brand.",
          icon: "Palette",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "أداة سوشيال ميديا بالذكاء الاصطناعي لوكالات التسويق",
      slug: "marketing-agencies",
      excerpt:
        "وسّع إنتاج سوشيال ميديا وكالتك بالذكاء الاصطناعي. أنشئ منشورات متوافقة مع الهوية لعدة عملاء وأدِر هويات بصرية منفصلة.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "marketing agency social media tool",
        "agency social media management",
        "multi-client social media",
        "AI content generation agency",
        "white label social media tool",
      ],
      published: true,
      type: "use-case",
      metaTitle:
        "مولّد منشورات سوشيال ميديا بالذكاء الاصطناعي لوكالات التسويق | oDesigns",
      keywords: [
        "marketing agency social media tool",
        "agency social media management",
        "multi-client social media",
        "AI content generation agency",
        "white label social media tool",
      ],
      heroTitle: "وسّع إنتاج عملائك بدون توسيع فريقك",
      heroSubtitle:
        "المزيد من العملاء لا يعني المزيد من المصممين. أنشئ محتوى سوشيال ميديا متوافق مع الهوية لكل عميل من منصة واحدة.",
      ctaTitle: "وسّع وكالتك بالذكاء الاصطناعي",
      ctaSubtitle:
        "انضم للوكالات التي تستخدم oDesigns لإدارة سوشيال ميديا متعددة العملاء. مجاني للبدء.",
      sections: [
        {
          sectionType: "painPoint",
          title: "مساحات عمل منفصلة لكل عميل",
          description:
            "كل عميل يحصل على مساحة عمل خاصة بألوان وخطوط وشعارات وحسابات اجتماعية فريدة. انتقل بين العملاء بنقرة واحدة.",
        },
        {
          sectionType: "painPoint",
          title: "١٠ أضعاف حجم الإنتاج",
          description:
            "ما كان يستغرق ٣٠ دقيقة لكل منشور أصبح يستغرق ثوانٍ. أنشئ تنويعات متعددة واختر الأفضل. فريقك يتولى الاستراتيجية والذكاء الاصطناعي يتولى الإنتاج.",
        },
        {
          sectionType: "painPoint",
          title: "جودة متسقة على نطاق واسع",
          description:
            "كل منشور مولّد يحترم إرشادات العلامة التجارية للعميل تلقائياً. لا مزيد من أخطاء المصممين المبتدئين.",
        },
        {
          sectionType: "feature",
          title: "إدارة مساحات عمل متعددة",
          description:
            "أنشئ مساحات عمل منفصلة لكل عميل بهويات بصرية ومكتبات منشورات وجداول نشر مستقلة.",
          icon: "Building2",
        },
        {
          sectionType: "feature",
          title: "التوليد بالذكاء الاصطناعي",
          description:
            "أنشئ عشرات المنشورات المتوافقة مع الهوية لكل عميل في دقائق. محركات ذكاء اصطناعي متعددة لأساليب إبداعية مختلفة.",
          icon: "Sparkles",
        },
        {
          sectionType: "feature",
          title: "النشر عبر المنصات",
          description:
            "اربط حسابات كل عميل وانشر من مساحة عمله. إنستغرام وفيسبوك وثريدز وتويتر — كلها تُدار مركزياً.",
          icon: "Share2",
        },
        {
          sectionType: "feature",
          title: "هوية بصرية لكل عميل",
          description:
            "خزّن ألوان وخطوط وشعارات كل عميل. الذكاء الاصطناعي يستخدمها تلقائياً.",
          icon: "Palette",
        },
      ],
    });

    return { message: "Seeded 12 use-case records (6 use-cases x 2 languages)" };
  },
});
