import { internalMutation } from "./_generated/server";

export const seedTemplates = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Delete existing template records
    const existing = await ctx.db.query("blogs").collect();
    const templates = existing.filter((b) => b.type === "template");
    for (const item of templates) {
      await ctx.db.delete(item._id);
    }

    const now = Date.now();

    // ── 1. Instagram Product Showcase ─────────────────────
    await ctx.db.insert("blogs", {
      title: "Instagram Product Showcase Templates",
      slug: "instagram-product-showcase",
      excerpt:
        "Generate stunning Instagram product showcase posts with AI. Professional templates for product launches, features, and promotions — customized to your brand.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "Instagram product post template",
        "product showcase Instagram",
        "Instagram product launch post",
        "AI product post generator",
        "Instagram shopping post design",
      ],
      published: true,
      type: "template",
      metaTitle:
        "AI Instagram Product Showcase Post Templates | oDesigns",
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
      ctaTitle: "Generate your first product post",
      ctaSubtitle:
        "Describe your product and brand. AI creates multiple showcase designs in seconds. Free to start.",
      sections: [
        {
          sectionType: "example",
          title: "Product launch announcement",
          description:
            "Bold headline with product image, key features, and a clear call to action. Perfect for new arrivals and product drops.",
        },
        {
          sectionType: "example",
          title: "Feature highlight carousel",
          description:
            "Multi-slide carousel showcasing individual product features. Each slide maintains brand consistency while highlighting a different benefit.",
        },
        {
          sectionType: "example",
          title: "Price and offer post",
          description:
            "Eye-catching promotional design with pricing, discount badges, and urgency elements. Drives immediate action from followers.",
        },
        {
          sectionType: "example",
          title: "Before and after comparison",
          description:
            "Split-screen design showing the problem and solution. Powerful for products that deliver visible results.",
        },
        {
          sectionType: "tip",
          title: "Lead with the benefit, not the product name",
          description:
            "Your headline should answer what the product does for the customer, not just what it is called. Benefits stop scrolls. Names do not.",
        },
        {
          sectionType: "tip",
          title: "Use your brand palette consistently",
          description:
            "Set your brand colors in oDesigns once, and every product post automatically uses the right palette. Consistent color builds instant recognition in the feed.",
        },
        {
          sectionType: "tip",
          title: "One product, one message",
          description:
            "Each post should highlight one product or one feature. Trying to showcase everything in a single post dilutes the message. Save the catalog for your carousel posts.",
        },
        {
          sectionType: "tip",
          title: "Optimize for square and portrait",
          description:
            "Instagram square (1:1) and portrait (4:5) formats get the most real estate in the feed. oDesigns generates in both ratios so you can choose what works best.",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "قوالب عرض المنتجات على إنستغرام",
      slug: "instagram-product-showcase",
      excerpt:
        "أنشئ منشورات عرض منتجات مذهلة على إنستغرام بالذكاء الاصطناعي. قوالب احترافية لإطلاق المنتجات والميزات والعروض — مخصصة لعلامتك التجارية.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "Instagram product post template",
        "product showcase Instagram",
        "Instagram product launch post",
        "AI product post generator",
        "Instagram shopping post design",
      ],
      published: true,
      type: "template",
      metaTitle:
        "قوالب منشورات عرض المنتجات بالذكاء الاصطناعي لإنستغرام | oDesigns",
      keywords: [
        "Instagram product post template",
        "product showcase Instagram",
        "Instagram product launch post",
        "AI product post generator",
        "Instagram shopping post design",
      ],
      heroTitle: "منشورات عرض منتجات تبيع",
      heroSubtitle:
        "توقف عن نشر صور منتجات عادية. الذكاء الاصطناعي يولّد تصاميم عرض احترافية بألوان علامتك وأسعارها وميزاتها الرئيسية.",
      ctaTitle: "أنشئ أول منشور منتج لك",
      ctaSubtitle:
        "صِف منتجك وعلامتك. الذكاء الاصطناعي ينشئ تصاميم عرض متعددة في ثوانٍ. مجاني للبدء.",
      sections: [
        {
          sectionType: "example",
          title: "إعلان إطلاق منتج",
          description:
            "عنوان بارز مع صورة المنتج والميزات الرئيسية ودعوة واضحة للإجراء. مثالي للوصول الجديد.",
        },
        {
          sectionType: "example",
          title: "كاروسيل إبراز الميزات",
          description:
            "كاروسيل متعدد الشرائح يعرض ميزات المنتج الفردية. كل شريحة تحافظ على اتساق العلامة التجارية.",
        },
        {
          sectionType: "example",
          title: "منشور السعر والعرض",
          description:
            "تصميم ترويجي جذاب بالأسعار وشارات الخصم وعناصر الإلحاح.",
        },
        {
          sectionType: "example",
          title: "مقارنة قبل وبعد",
          description:
            "تصميم شاشة مقسمة يعرض المشكلة والحل. قوي للمنتجات ذات النتائج المرئية.",
        },
        {
          sectionType: "tip",
          title: "ابدأ بالفائدة، لا باسم المنتج",
          description:
            "عنوانك يجب أن يجيب ما يفعله المنتج للعميل. الفوائد توقف التمرير. الأسماء لا.",
        },
        {
          sectionType: "tip",
          title: "استخدم لوحة ألوان علامتك باستمرار",
          description:
            "حدد ألوان علامتك في oDesigns مرة واحدة وكل منشور يستخدم اللوحة الصحيحة تلقائياً.",
        },
        {
          sectionType: "tip",
          title: "منتج واحد، رسالة واحدة",
          description:
            "كل منشور يجب أن يبرز منتجاً أو ميزة واحدة. محاولة عرض كل شيء تضعف الرسالة.",
        },
        {
          sectionType: "tip",
          title: "حسّن للمربع والعمودي",
          description:
            "تنسيق إنستغرام المربع (1:1) والعمودي (4:5) يحصلان على أكبر مساحة في الموجز.",
        },
      ],
    });

    // ── 2. Restaurant Social Media ────────────────────────
    await ctx.db.insert("blogs", {
      title: "Restaurant Social Media Templates",
      slug: "restaurant-social-media",
      excerpt:
        "Create mouth-watering social media posts for your restaurant. AI-generated templates for menus, daily specials, promotions, and food photography posts.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "restaurant social media templates",
        "food Instagram post template",
        "cafe social media design",
        "restaurant marketing posts",
        "food post generator AI",
      ],
      published: true,
      type: "template",
      metaTitle:
        "AI Restaurant & Food Social Media Post Templates | oDesigns",
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
      ctaTitle: "Create your first restaurant post",
      ctaSubtitle:
        "Upload your food photos and brand details. AI generates professional menu and promotion posts in seconds. Free to start.",
      sections: [
        {
          sectionType: "example",
          title: "Daily special spotlight",
          description:
            "Feature today's special with a stunning food photo, dish name, description, and pricing. Update it in seconds every day.",
        },
        {
          sectionType: "example",
          title: "Menu category showcase",
          description:
            "Highlight an entire menu section — appetizers, mains, desserts — with a grid layout that makes every dish look irresistible.",
        },
        {
          sectionType: "example",
          title: "Seasonal promotion",
          description:
            "Ramadan iftar menu, summer drinks, holiday catering — generate themed promotional posts that match the season and your brand.",
        },
        {
          sectionType: "example",
          title: "Review and testimonial highlight",
          description:
            "Turn your best customer reviews into beautiful social proof posts. Quote the review, add your branding, and share the love.",
        },
        {
          sectionType: "tip",
          title: "Post daily specials consistently",
          description:
            "Restaurants that post daily see significantly higher engagement. With AI generation, creating a daily special post takes seconds — making consistency effortless.",
        },
        {
          sectionType: "tip",
          title: "Use warm, appetizing colors",
          description:
            "Set warm brand accents — deep reds, golden yellows, rich oranges. These colors trigger hunger responses and make food content more engaging.",
        },
        {
          sectionType: "tip",
          title: "Show the food in context",
          description:
            "The best restaurant posts show dishes being enjoyed, not just plated. Table settings, hands reaching for food, and ambient restaurant lighting create emotional connection.",
        },
        {
          sectionType: "tip",
          title: "Schedule a week at once",
          description:
            "Batch your restaurant content weekly. Generate Monday through Sunday posts in one session, schedule them, and focus on your kitchen.",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "قوالب سوشيال ميديا للمطاعم",
      slug: "restaurant-social-media",
      excerpt:
        "أنشئ منشورات سوشيال ميديا شهية لمطعمك. قوالب مولّدة بالذكاء الاصطناعي للقوائم والعروض اليومية والترويج.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "restaurant social media templates",
        "food Instagram post template",
        "cafe social media design",
        "restaurant marketing posts",
        "food post generator AI",
      ],
      published: true,
      type: "template",
      metaTitle:
        "قوالب منشورات سوشيال ميديا بالذكاء الاصطناعي للمطاعم | oDesigns",
      keywords: [
        "restaurant social media templates",
        "food Instagram post template",
        "cafe social media design",
        "restaurant marketing posts",
        "food post generator AI",
      ],
      heroTitle: "منشورات سوشيال ميديا شهية مثل طعامك",
      heroSubtitle:
        "أطباقك جميلة. سوشيال ميديا يجب أن تتطابق. أنشئ منشورات مطعم احترافية — إبراز القائمة والعروض اليومية والترويج الموسمي.",
      ctaTitle: "أنشئ أول منشور مطعم لك",
      ctaSubtitle:
        "ارفع صور طعامك وتفاصيل علامتك. الذكاء الاصطناعي ينشئ منشورات قوائم وترويج في ثوانٍ. مجاني للبدء.",
      sections: [
        {
          sectionType: "example",
          title: "عرض يومي مميز",
          description:
            "اعرض طبق اليوم المميز بصورة طعام مذهلة واسم الطبق والوصف والسعر.",
        },
        {
          sectionType: "example",
          title: "عرض قسم القائمة",
          description:
            "أبرز قسماً كاملاً من القائمة — المقبلات والأطباق الرئيسية والحلويات — بتخطيط شبكي.",
        },
        {
          sectionType: "example",
          title: "ترويج موسمي",
          description:
            "قائمة إفطار رمضان، مشروبات الصيف، تموين الأعياد — أنشئ منشورات ترويجية موسمية.",
        },
        {
          sectionType: "example",
          title: "إبراز تقييمات العملاء",
          description:
            "حوّل أفضل تقييمات عملائك إلى منشورات دليل اجتماعي جميلة.",
        },
        {
          sectionType: "tip",
          title: "انشر العروض اليومية باستمرار",
          description:
            "المطاعم التي تنشر يومياً تحقق تفاعلاً أعلى بكثير. مع توليد الذكاء الاصطناعي، إنشاء منشور عرض يومي يستغرق ثوانٍ.",
        },
        {
          sectionType: "tip",
          title: "استخدم ألواناً دافئة وشهية",
          description:
            "حدد ألواناً دافئة — أحمر غامق وأصفر ذهبي وبرتقالي غني. هذه الألوان تحفّز الشهية.",
        },
        {
          sectionType: "tip",
          title: "اعرض الطعام في سياقه",
          description:
            "أفضل منشورات المطاعم تعرض الأطباق وهي تُستمتع بها. إعدادات الطاولة والأيدي والإضاءة المحيطة تخلق ارتباطاً عاطفياً.",
        },
        {
          sectionType: "tip",
          title: "جدوِل أسبوعاً كاملاً",
          description:
            "اجمع محتوى مطعمك أسبوعياً. أنشئ منشورات الاثنين للأحد في جلسة واحدة وجدوِلها.",
        },
      ],
    });

    // ── 3. App Store Screenshots ──────────────────────────
    await ctx.db.insert("blogs", {
      title: "App Store Screenshot Templates",
      slug: "app-store-screenshots",
      excerpt:
        "Generate professional app store screenshots and promotional graphics with AI. Templates for iOS App Store and Google Play featuring device mockups and feature highlights.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "app store screenshot template",
        "app store promotional graphics",
        "iOS app screenshot design",
        "Google Play store graphics",
        "app marketing design tool",
      ],
      published: true,
      type: "template",
      metaTitle:
        "AI App Store Screenshot & Promotional Templates | oDesigns",
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
      ctaTitle: "Generate your first app store graphic",
      ctaSubtitle:
        "Upload your app screenshots, set your brand. AI creates professional app store graphics in seconds. Free to start.",
      sections: [
        {
          sectionType: "example",
          title: "Feature highlight with device mockup",
          description:
            "Showcase your app's key screen inside a realistic device frame with a bold headline and feature description. Clean, professional, download-ready.",
        },
        {
          sectionType: "example",
          title: "Multi-screen overview",
          description:
            "Show multiple app screens in a single graphic to give potential users a complete preview of the experience.",
        },
        {
          sectionType: "example",
          title: "Social proof promotional",
          description:
            "Combine ratings, review quotes, and download counts with app screenshots for powerful social proof posts.",
        },
        {
          sectionType: "example",
          title: "Feature comparison layout",
          description:
            "Side-by-side or before-and-after designs highlighting what makes your app different from competitors.",
        },
        {
          sectionType: "tip",
          title: "Lead with your best screen",
          description:
            "Your first app store screenshot should show the most compelling screen or feature. Most users only see the first 2-3 screenshots before deciding to download or scroll past.",
        },
        {
          sectionType: "tip",
          title: "Use bold, readable text",
          description:
            "App store screenshots are viewed on small screens. Keep headlines large, use high-contrast colors, and limit text to 3-5 words per callout.",
        },
        {
          sectionType: "tip",
          title: "Show the app in action",
          description:
            "Static empty states are less compelling than screens showing real data and interactions. Populate your screenshots with realistic content.",
        },
        {
          sectionType: "tip",
          title: "Match your app's brand exactly",
          description:
            "Set your app's primary color and typography in oDesigns. Every generated screenshot will match your app's visual identity perfectly.",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "قوالب لقطات شاشة متجر التطبيقات",
      slug: "app-store-screenshots",
      excerpt:
        "أنشئ لقطات شاشة ورسومات ترويجية احترافية لمتجر التطبيقات بالذكاء الاصطناعي. قوالب لآب ستور وجوجل بلاي بنماذج أجهزة وإبراز الميزات.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "app store screenshot template",
        "app store promotional graphics",
        "iOS app screenshot design",
        "Google Play store graphics",
        "app marketing design tool",
      ],
      published: true,
      type: "template",
      metaTitle:
        "قوالب لقطات شاشة ورسومات ترويجية لمتجر التطبيقات بالذكاء الاصطناعي | oDesigns",
      keywords: [
        "app store screenshot template",
        "app store promotional graphics",
        "iOS app screenshot design",
        "Google Play store graphics",
        "app marketing design tool",
      ],
      heroTitle: "رسومات متجر تطبيقات تعزز التحميلات",
      heroSubtitle:
        "الانطباع الأول يحرّك التحميلات. أنشئ لقطات شاشة ومنشورات ترويجية احترافية بنماذج أجهزة وشعارات ميزات وهوية تطبيقك.",
      ctaTitle: "أنشئ أول رسم لمتجر التطبيقات",
      ctaSubtitle:
        "ارفع لقطات تطبيقك وحدد علامتك. الذكاء الاصطناعي ينشئ رسومات احترافية في ثوانٍ. مجاني للبدء.",
      sections: [
        {
          sectionType: "example",
          title: "إبراز الميزات بنموذج جهاز",
          description:
            "اعرض شاشة تطبيقك الرئيسية داخل إطار جهاز واقعي مع عنوان بارز ووصف الميزة.",
        },
        {
          sectionType: "example",
          title: "نظرة عامة متعددة الشاشات",
          description:
            "اعرض عدة شاشات تطبيق في رسم واحد لإعطاء المستخدمين معاينة كاملة للتجربة.",
        },
        {
          sectionType: "example",
          title: "ترويج الدليل الاجتماعي",
          description:
            "ادمج التقييمات واقتباسات المراجعات وأعداد التحميلات مع لقطات التطبيق لمنشورات دليل اجتماعي قوية.",
        },
        {
          sectionType: "example",
          title: "تخطيط مقارنة الميزات",
          description:
            "تصاميم جنباً إلى جنب تبرز ما يميّز تطبيقك عن المنافسين.",
        },
        {
          sectionType: "tip",
          title: "ابدأ بأفضل شاشة لديك",
          description:
            "أول لقطة شاشة يجب أن تعرض أقوى شاشة أو ميزة. معظم المستخدمين يرون فقط أول ٢-٣ لقطات.",
        },
        {
          sectionType: "tip",
          title: "استخدم نصاً بارزاً وقابلاً للقراءة",
          description:
            "لقطات متجر التطبيقات تُعرض على شاشات صغيرة. اجعل العناوين كبيرة واستخدم ألواناً عالية التباين.",
        },
        {
          sectionType: "tip",
          title: "اعرض التطبيق وهو يعمل",
          description:
            "الشاشات الفارغة أقل إقناعاً من الشاشات التي تعرض بيانات وتفاعلات حقيقية.",
        },
        {
          sectionType: "tip",
          title: "طابق هوية تطبيقك بدقة",
          description:
            "حدد لون تطبيقك الأساسي وخطوطه في oDesigns. كل لقطة شاشة ستتطابق مع هويتك البصرية.",
        },
      ],
    });

    // ── 4. Social Media Carousel ──────────────────────────
    await ctx.db.insert("blogs", {
      title: "Social Media Carousel Post Templates",
      slug: "social-media-carousel",
      excerpt:
        "Generate engaging carousel posts for Instagram and social media. AI creates multi-slide educational content, tutorials, and tip posts with consistent branding.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "Instagram carousel template",
        "social media carousel design",
        "carousel post generator",
        "multi-slide Instagram post",
        "educational carousel template",
      ],
      published: true,
      type: "template",
      metaTitle:
        "AI Social Media Carousel Post Templates | oDesigns",
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
      ctaTitle: "Generate your first carousel post",
      ctaSubtitle:
        "Describe your topic. AI creates a full carousel with consistent branding across every slide. Free to start.",
      sections: [
        {
          sectionType: "example",
          title: "Educational tips series",
          description:
            "A 5-7 slide carousel where each slide presents one tip or insight. Consistent layout, bold numbering, and a CTA on the final slide.",
        },
        {
          sectionType: "example",
          title: "Step-by-step tutorial",
          description:
            "Walk your audience through a process with numbered steps. Each slide covers one step with clear visuals and concise text.",
        },
        {
          sectionType: "example",
          title: "Product feature walkthrough",
          description:
            "Showcase multiple product features across slides. Each slide highlights one feature with a benefit-focused headline.",
        },
        {
          sectionType: "example",
          title: "Before and after story",
          description:
            "Start with the problem, show the transformation across slides, and end with the result. Powerful for case studies and testimonials.",
        },
        {
          sectionType: "tip",
          title: "Hook on slide one, CTA on the last",
          description:
            "Your first slide must be intriguing enough to trigger a swipe. The last slide should always include a clear call to action — follow, save, visit link.",
        },
        {
          sectionType: "tip",
          title: "Keep design consistent across slides",
          description:
            "Same colors, same fonts, same layout structure. Your carousel should feel like a cohesive mini-presentation, not a random collection of images.",
        },
        {
          sectionType: "tip",
          title: "One idea per slide",
          description:
            "Do not cram multiple points onto one slide. Each slide should communicate one clear idea that the viewer absorbs in 2-3 seconds.",
        },
        {
          sectionType: "tip",
          title: "Aim for 5-7 slides",
          description:
            "Research shows 5-7 slides hit the sweet spot for engagement. Enough to provide value without losing attention.",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "قوالب منشورات كاروسيل السوشيال ميديا",
      slug: "social-media-carousel",
      excerpt:
        "أنشئ منشورات كاروسيل جذابة لإنستغرام والسوشيال ميديا. الذكاء الاصطناعي ينشئ محتوى تعليمي متعدد الشرائح بهوية بصرية متسقة.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "Instagram carousel template",
        "social media carousel design",
        "carousel post generator",
        "multi-slide Instagram post",
        "educational carousel template",
      ],
      published: true,
      type: "template",
      metaTitle:
        "قوالب منشورات كاروسيل بالذكاء الاصطناعي للسوشيال ميديا | oDesigns",
      keywords: [
        "Instagram carousel template",
        "social media carousel design",
        "carousel post generator",
        "multi-slide Instagram post",
        "educational carousel template",
      ],
      heroTitle: "منشورات كاروسيل تجعلهم يمررون",
      heroSubtitle:
        "منشورات الكاروسيل تحقق ٣ أضعاف التفاعل مقارنة بالصور المفردة على إنستغرام. أنشئ منشورات متعددة الشرائح متماسكة — دروس ونصائح ومحتوى تعليمي.",
      ctaTitle: "أنشئ أول منشور كاروسيل لك",
      ctaSubtitle:
        "صِف موضوعك. الذكاء الاصطناعي ينشئ كاروسيل كامل بهوية متسقة عبر كل شريحة. مجاني للبدء.",
      sections: [
        {
          sectionType: "example",
          title: "سلسلة نصائح تعليمية",
          description:
            "كاروسيل من ٥-٧ شرائح حيث كل شريحة تقدم نصيحة أو فكرة. تخطيط متسق وترقيم بارز ودعوة للإجراء في الشريحة الأخيرة.",
        },
        {
          sectionType: "example",
          title: "درس خطوة بخطوة",
          description:
            "رافق جمهورك عبر عملية بخطوات مرقّمة. كل شريحة تغطي خطوة واحدة بصور واضحة ونص موجز.",
        },
        {
          sectionType: "example",
          title: "جولة في ميزات المنتج",
          description:
            "اعرض عدة ميزات للمنتج عبر الشرائح. كل شريحة تبرز ميزة واحدة بعنوان يركز على الفائدة.",
        },
        {
          sectionType: "example",
          title: "قصة قبل وبعد",
          description:
            "ابدأ بالمشكلة، اعرض التحول عبر الشرائح، وانتهِ بالنتيجة. قوي لدراسات الحالة والشهادات.",
        },
        {
          sectionType: "tip",
          title: "جذب في الشريحة الأولى، دعوة للإجراء في الأخيرة",
          description:
            "شريحتك الأولى يجب أن تكون مثيرة بما يكفي لتحفيز التمرير. الشريحة الأخيرة يجب أن تتضمن دعوة واضحة للإجراء.",
        },
        {
          sectionType: "tip",
          title: "حافظ على تصميم متسق عبر الشرائح",
          description:
            "نفس الألوان والخطوط وهيكل التخطيط. كاروسيلك يجب أن يبدو كعرض تقديمي متماسك.",
        },
        {
          sectionType: "tip",
          title: "فكرة واحدة لكل شريحة",
          description:
            "لا تحشر عدة نقاط في شريحة واحدة. كل شريحة يجب أن توصل فكرة واضحة واحدة.",
        },
        {
          sectionType: "tip",
          title: "استهدف ٥-٧ شرائح",
          description:
            "الأبحاث تُظهر أن ٥-٧ شرائح تحقق أفضل نقطة للتفاعل. كافية لتقديم قيمة بدون فقدان الانتباه.",
        },
      ],
    });

    // ── 5. Brand Announcement Posts ───────────────────────
    await ctx.db.insert("blogs", {
      title: "Brand Announcement Post Templates",
      slug: "brand-announcement-posts",
      excerpt:
        "Create professional brand announcement posts with AI. Templates for product launches, company news, milestones, and event announcements on social media.",
      content: "",
      author: "oDesigns Team",
      language: "en",
      publishedAt: now,
      tags: [
        "brand announcement post template",
        "product launch social media post",
        "company announcement design",
        "event announcement Instagram post",
        "launch post generator",
      ],
      published: true,
      type: "template",
      metaTitle:
        "AI Brand Announcement & Launch Post Templates | oDesigns",
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
      ctaTitle: "Create your next announcement post",
      ctaSubtitle:
        "Describe your news. AI generates professional announcement designs in seconds. Free to start.",
      sections: [
        {
          sectionType: "example",
          title: "Product launch countdown",
          description:
            "Build anticipation with a series of countdown posts leading to launch day. Consistent teaser design that creates excitement.",
        },
        {
          sectionType: "example",
          title: "Company milestone celebration",
          description:
            "Celebrate achievements — anniversaries, user milestones, awards — with bold typography and your brand colors.",
        },
        {
          sectionType: "example",
          title: "Event announcement and reminder",
          description:
            "Generate event posts with date, time, location, and registration details. Schedule reminders leading up to the event.",
        },
        {
          sectionType: "example",
          title: "Feature or update release",
          description:
            "Announce new features, updates, or improvements with clean designs that highlight what is new and why it matters.",
        },
        {
          sectionType: "tip",
          title: "Create a campaign, not a single post",
          description:
            "Big announcements work best as a series: teaser, reveal, details, reminder. Generate the entire sequence at once and schedule it across days.",
        },
        {
          sectionType: "tip",
          title: "Bold typography wins",
          description:
            "Announcement posts should feel important. Use larger headline sizes, bolder weights, and high-contrast color combinations.",
        },
        {
          sectionType: "tip",
          title: "Include the key details upfront",
          description:
            "What, when, where, and how. Do not make followers dig into the caption for essential information — put it on the design.",
        },
        {
          sectionType: "tip",
          title: "Cross-post everywhere",
          description:
            "Announcements should reach every channel simultaneously. Publish to all your connected platforms in one click.",
        },
      ],
    });

    await ctx.db.insert("blogs", {
      title: "قوالب منشورات إعلانات العلامة التجارية",
      slug: "brand-announcement-posts",
      excerpt:
        "أنشئ منشورات إعلانات علامة تجارية احترافية بالذكاء الاصطناعي. قوالب لإطلاق المنتجات وأخبار الشركة والإنجازات وإعلانات الفعاليات.",
      content: "",
      author: "فريق oDesigns",
      language: "ar",
      publishedAt: now,
      tags: [
        "brand announcement post template",
        "product launch social media post",
        "company announcement design",
        "event announcement Instagram post",
        "launch post generator",
      ],
      published: true,
      type: "template",
      metaTitle:
        "قوالب منشورات إعلانات وإطلاقات بالذكاء الاصطناعي | oDesigns",
      keywords: [
        "brand announcement post template",
        "product launch social media post",
        "company announcement design",
        "event announcement Instagram post",
        "launch post generator",
      ],
      heroTitle: "إعلانات تفرض الانتباه",
      heroSubtitle:
        "الأخبار الكبيرة تستحق تصميماً كبيراً. أنشئ منشورات إعلانات احترافية لإطلاق المنتجات وإنجازات الشركة والفعاليات والتحديثات.",
      ctaTitle: "أنشئ منشور إعلانك القادم",
      ctaSubtitle:
        "صِف أخبارك. الذكاء الاصطناعي ينشئ تصاميم إعلانات احترافية في ثوانٍ. مجاني للبدء.",
      sections: [
        {
          sectionType: "example",
          title: "عد تنازلي لإطلاق منتج",
          description:
            "ابنِ الترقب بسلسلة منشورات عد تنازلي تقود ليوم الإطلاق. تصميم تشويقي متسق يخلق حماساً.",
        },
        {
          sectionType: "example",
          title: "احتفال بإنجاز الشركة",
          description:
            "احتفل بالإنجازات — ذكرى سنوية، إنجاز مستخدمين، جوائز — بطباعة بارزة وألوان علامتك.",
        },
        {
          sectionType: "example",
          title: "إعلان وتذكير فعالية",
          description:
            "أنشئ منشورات فعاليات بالتاريخ والوقت والموقع وتفاصيل التسجيل. جدوِل تذكيرات قبل الفعالية.",
        },
        {
          sectionType: "example",
          title: "إصدار ميزة أو تحديث",
          description:
            "أعلن عن ميزات جديدة وتحديثات وتحسينات بتصاميم نظيفة تبرز الجديد وأهميته.",
        },
        {
          sectionType: "tip",
          title: "أنشئ حملة، لا منشوراً واحداً",
          description:
            "الإعلانات الكبيرة تعمل أفضل كسلسلة: تشويق، كشف، تفاصيل، تذكير. أنشئ التسلسل كاملاً وجدوِله عبر أيام.",
        },
        {
          sectionType: "tip",
          title: "الطباعة البارزة تفوز",
          description:
            "منشورات الإعلانات يجب أن تبدو مهمة. استخدم أحجام عناوين أكبر وأوزان أجرأ وتباينات ألوان عالية.",
        },
        {
          sectionType: "tip",
          title: "ضمّن التفاصيل الأساسية مقدماً",
          description:
            "ماذا ومتى وأين وكيف. لا تجعل المتابعين يبحثون في التعليق عن المعلومات الأساسية — ضعها في التصميم.",
        },
        {
          sectionType: "tip",
          title: "انشر في كل مكان",
          description:
            "الإعلانات يجب أن تصل كل قناة في وقت واحد. انشر على جميع منصاتك المتصلة بنقرة واحدة.",
        },
      ],
    });

    return { message: "Seeded 10 template pages (5 English + 5 Arabic)" };
  },
});
