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
    if (args.language) {
      return blogs.filter(
        (b) => b.language === args.language || b.language === undefined
      );
    }
    return blogs;
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

// Seed 4 sample blog posts (2 English + 2 Arabic)
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete all existing blogs and re-seed
    const existing = await ctx.db.query("blogs").collect();
    for (const blog of existing) {
      await ctx.db.delete(blog._id);
    }

    const now = Date.now();

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
      publishedAt: now - 3 * 24 * 60 * 60 * 1000,
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
      publishedAt: now - 7 * 24 * 60 * 60 * 1000,
      tags: ["AI", "Content Creation", "Automation", "Social Media"],
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
      publishedAt: now - 2 * 24 * 60 * 60 * 1000,
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
      publishedAt: now - 5 * 24 * 60 * 60 * 1000,
      tags: ["ذكاء اصطناعي", "صناعة محتوى", "أتمتة", "سوشيال ميديا"],
      published: true,
    });

    return { message: "Seeded 4 blog posts (2 English + 2 Arabic)" };
  },
});
