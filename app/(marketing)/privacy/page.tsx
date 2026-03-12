"use client";

import FloatingNav from "@/app/components/FloatingNav";
import { useLocale } from "@/lib/i18n/context";

export default function PrivacyPolicyPage() {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";

  return (
    <div dir={dir} className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-800 dark:text-neutral-200">
      <FloatingNav activePage="home" />

      {/* Hero */}
      <section className="pt-36 pb-16 bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="mt-4 text-white/50 font-bold text-sm uppercase tracking-widest">
            {isAr ? "آخر تحديث: مارس ٢٠٢٦" : "Last updated: March 2026"}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-12">
          {isAr ? <ArabicContent /> : <EnglishContent />}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-3xl mx-auto px-6 text-center text-slate-400 font-bold text-sm">
          <p>
            &copy; {new Date().getFullYear()} oDesigns.{" "}
            {isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Bullet helper ─── */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

/* ─── English content ─── */
function EnglishContent() {
  return (
    <>
      {/* 1. Introduction */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          1. Introduction
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          oDesigns is an AI-powered social media post generator and design
          editor that helps businesses create professional, on-brand social
          media content. This Privacy Policy explains how we collect, use,
          store, and protect your information when you use our platform at
          odesigns.co and any associated services. By using oDesigns, you
          agree to the practices described in this policy.
        </p>
      </div>

      {/* 2. Information We Collect */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          2. Information We Collect
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          We collect the following types of information to provide and
          improve our services:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Account Information:</strong>{" "}
            When you sign in with Google OAuth, we receive your name,
            email address, and profile picture from Google.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Workspace Data:</strong>{" "}
            Information you provide when creating workspaces, including
            business name, industry, website URL, branding preferences
            (colors, fonts, logos), and language settings.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Uploaded Assets:</strong>{" "}
            Images and files you upload to the platform, including
            product photos, screenshots, logos, and background images.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Generated Content:</strong>{" "}
            Post designs, component code, and AI-generated copy created
            through our platform.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Usage Analytics:</strong>{" "}
            Information about how you interact with our service,
            including feature usage, generation history, and session data
            to help us improve the platform.
          </Bullet>
        </ul>
      </div>

      {/* 3. How We Use Your Information */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          3. How We Use Your Information
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          We use your information for the following purposes:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Service Delivery:</strong>{" "}
            To provide, maintain, and operate the oDesigns platform,
            including workspace management, post editing, and content
            export functionality.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">AI Content Generation:</strong>{" "}
            To generate social media post designs using your brand
            information, uploaded assets, and website data as context for
            our AI models.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Service Improvement:</strong>{" "}
            To analyze usage patterns, diagnose technical issues, and
            improve the quality and reliability of our platform and
            AI-generated outputs.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Communication:</strong>{" "}
            To send you important updates about the service, respond to
            support requests, and notify you of changes to our terms or
            policies.
          </Bullet>
        </ul>
      </div>

      {/* 4. Data Storage & Security */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          4. Data Storage &amp; Security
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          We take the security of your data seriously and implement
          appropriate measures to protect it:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            Your data is stored securely in our Convex cloud database
            with built-in encryption and access controls.
          </Bullet>
          <Bullet>
            Uploaded files and assets are stored in secure cloud file
            storage with access restricted to authenticated users within
            the appropriate workspace.
          </Bullet>
          <Bullet>
            All data transmission between your browser and our servers is
            encrypted using HTTPS/TLS.
          </Bullet>
          <Bullet>
            We regularly review our security practices and update them as
            needed to address emerging threats.
          </Bullet>
        </ul>
      </div>

      {/* 5. Third-Party Services */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          5. Third-Party Services
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          oDesigns integrates with the following third-party services:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Google OAuth:</strong>{" "}
            We use Google&apos;s authentication service to securely sign
            you in. Google&apos;s use of your data is governed by{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300"
            >
              Google&apos;s Privacy Policy
            </a>
            .
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Google Gemini AI:</strong>{" "}
            We use Google&apos;s Gemini AI models to generate social
            media post designs and copy. Your brand information and
            assets may be sent to Google&apos;s API as context for
            content generation. Google&apos;s AI data practices are
            governed by their{" "}
            <a
              href="https://ai.google.dev/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300"
            >
              API Terms of Service
            </a>
            .
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Payment Processing:</strong>{" "}
            If you subscribe to a paid plan, your payment information is
            handled by our third-party payment processor. We do not
            store your credit card or banking details on our servers.
          </Bullet>
        </ul>
      </div>

      {/* 6. Your Rights */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          6. Your Rights
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          You have the following rights regarding your personal data:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Access:</strong>{" "}
            You can access and review the personal information we hold
            about you at any time through your account settings.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Deletion:</strong>{" "}
            You may request deletion of your account and all associated
            data by contacting us. We will process your request within
            30 days.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Data Export:</strong>{" "}
            You can export your generated content and designs at any
            time using our built-in download and export features.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Correction:</strong>{" "}
            You may update or correct your personal information through
            your workspace settings or by contacting us directly.
          </Bullet>
        </ul>
      </div>

      {/* 7. Cookies */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          7. Cookies
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          oDesigns uses minimal cookies that are essential for the
          operation of our service. These include authentication session
          cookies required to keep you signed in and basic preference
          cookies for language and theme settings. We do not use
          advertising cookies or third-party tracking cookies.
        </p>
      </div>

      {/* 8. Changes to This Policy */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          8. Changes to This Policy
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          We may update this Privacy Policy from time to time to reflect
          changes in our practices, technology, or legal requirements. When
          we make material changes, we will notify you by updating the
          &quot;Last updated&quot; date at the top of this page and, where
          appropriate, through an in-app notification or email. We
          encourage you to review this policy periodically.
        </p>
      </div>

      {/* 9. Contact */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          9. Contact
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          If you have any questions, concerns, or requests regarding this
          Privacy Policy or your personal data, please contact us at{" "}
          <a
            href="mailto:hi@oagents.app"
            className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300 font-bold"
          >
            hi@oagents.app
          </a>
          . We aim to respond to all inquiries within 5 business days.
        </p>
      </div>
    </>
  );
}

/* ─── Arabic content ─── */
function ArabicContent() {
  return (
    <>
      {/* 1. المقدمة */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ١. المقدمة
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          oDesigns هي منصة مدعومة بالذكاء الاصطناعي لإنشاء منشورات وسائل
          التواصل الاجتماعي وتحرير التصاميم، تساعد الشركات على إنشاء محتوى
          احترافي ومتوافق مع هويتها البصرية. توضح سياسة الخصوصية هذه كيفية
          جمع معلوماتك واستخدامها وتخزينها وحمايتها عند استخدامك لمنصتنا على
          odesigns.co وأي خدمات مرتبطة بها. باستخدامك لـ oDesigns، فإنك
          توافق على الممارسات الموضحة في هذه السياسة.
        </p>
      </div>

      {/* 2. المعلومات التي نجمعها */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٢. المعلومات التي نجمعها
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          نجمع الأنواع التالية من المعلومات لتقديم خدماتنا وتحسينها:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">معلومات الحساب:</strong>{" "}
            عند تسجيل الدخول باستخدام Google OAuth، نتلقى اسمك وعنوان
            بريدك الإلكتروني وصورة ملفك الشخصي من Google.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">بيانات مساحة العمل:</strong>{" "}
            المعلومات التي تقدمها عند إنشاء مساحات العمل، بما في ذلك اسم
            النشاط التجاري والصناعة وعنوان الموقع الإلكتروني وتفضيلات
            العلامة التجارية (الألوان والخطوط والشعارات) وإعدادات اللغة.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">الأصول المرفوعة:</strong>{" "}
            الصور والملفات التي ترفعها إلى المنصة، بما في ذلك صور
            المنتجات ولقطات الشاشة والشعارات وصور الخلفية.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">المحتوى المُنشأ:</strong>{" "}
            تصاميم المنشورات وأكواد المكونات والنصوص المُنشأة بالذكاء
            الاصطناعي من خلال منصتنا.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">تحليلات الاستخدام:</strong>{" "}
            معلومات حول كيفية تفاعلك مع خدمتنا، بما في ذلك استخدام
            الميزات وسجل الإنشاء وبيانات الجلسة لمساعدتنا في تحسين
            المنصة.
          </Bullet>
        </ul>
      </div>

      {/* 3. كيف نستخدم معلوماتك */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٣. كيف نستخدم معلوماتك
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          نستخدم معلوماتك للأغراض التالية:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">تقديم الخدمة:</strong>{" "}
            لتوفير منصة oDesigns وصيانتها وتشغيلها، بما في ذلك إدارة
            مساحات العمل وتحرير المنشورات ووظائف تصدير المحتوى.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">إنشاء محتوى بالذكاء الاصطناعي:</strong>{" "}
            لإنشاء تصاميم منشورات وسائل التواصل الاجتماعي باستخدام
            معلومات علامتك التجارية والأصول المرفوعة وبيانات الموقع
            الإلكتروني كسياق لنماذج الذكاء الاصطناعي لدينا.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">تحسين الخدمة:</strong>{" "}
            لتحليل أنماط الاستخدام وتشخيص المشكلات التقنية وتحسين جودة
            وموثوقية منصتنا ومخرجات الذكاء الاصطناعي.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">التواصل:</strong>{" "}
            لإرسال تحديثات مهمة حول الخدمة والرد على طلبات الدعم
            وإخطارك بالتغييرات في شروطنا أو سياساتنا.
          </Bullet>
        </ul>
      </div>

      {/* 4. تخزين البيانات والأمان */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٤. تخزين البيانات والأمان
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          نأخذ أمان بياناتك على محمل الجد ونطبق التدابير المناسبة
          لحمايتها:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            يتم تخزين بياناتك بشكل آمن في قاعدة بيانات Convex السحابية
            مع تشفير مدمج وضوابط وصول.
          </Bullet>
          <Bullet>
            يتم تخزين الملفات والأصول المرفوعة في تخزين سحابي آمن مع
            تقييد الوصول للمستخدمين المصادق عليهم ضمن مساحة العمل
            المناسبة.
          </Bullet>
          <Bullet>
            جميع عمليات نقل البيانات بين متصفحك وخوادمنا مشفرة باستخدام
            HTTPS/TLS.
          </Bullet>
          <Bullet>
            نراجع ممارساتنا الأمنية بانتظام ونحدثها حسب الحاجة لمواجهة
            التهديدات الناشئة.
          </Bullet>
        </ul>
      </div>

      {/* 5. خدمات الطرف الثالث */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٥. خدمات الطرف الثالث
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          تتكامل oDesigns مع خدمات الطرف الثالث التالية:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Google OAuth:</strong>{" "}
            نستخدم خدمة المصادقة من Google لتسجيل دخولك بشكل آمن.
            يخضع استخدام Google لبياناتك لـ{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300"
            >
              سياسة خصوصية Google
            </a>
            .
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">Google Gemini AI:</strong>{" "}
            نستخدم نماذج Gemini AI من Google لإنشاء تصاميم ونصوص
            منشورات وسائل التواصل الاجتماعي. قد يتم إرسال معلومات
            علامتك التجارية وأصولك إلى واجهة برمجة تطبيقات Google كسياق
            لإنشاء المحتوى. تخضع ممارسات بيانات الذكاء الاصطناعي من
            Google لـ{" "}
            <a
              href="https://ai.google.dev/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300"
            >
              شروط خدمة واجهة برمجة التطبيقات
            </a>
            .
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">معالجة الدفع:</strong>{" "}
            إذا اشتركت في خطة مدفوعة، يتم التعامل مع معلومات الدفع
            الخاصة بك من قبل معالج الدفع التابع لطرف ثالث. نحن لا نخزن
            بيانات بطاقتك الائتمانية أو حسابك المصرفي على خوادمنا.
          </Bullet>
        </ul>
      </div>

      {/* 6. حقوقك */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٦. حقوقك
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed mb-4">
          لديك الحقوق التالية فيما يتعلق ببياناتك الشخصية:
        </p>
        <ul className="space-y-3 text-slate-600 dark:text-neutral-400 leading-relaxed">
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">الوصول:</strong>{" "}
            يمكنك الوصول إلى المعلومات الشخصية التي نحتفظ بها عنك
            ومراجعتها في أي وقت من خلال إعدادات حسابك.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">الحذف:</strong>{" "}
            يمكنك طلب حذف حسابك وجميع البيانات المرتبطة به عن طريق
            التواصل معنا. سنعالج طلبك خلال ٣٠ يومًا.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">تصدير البيانات:</strong>{" "}
            يمكنك تصدير المحتوى والتصاميم المُنشأة في أي وقت باستخدام
            ميزات التنزيل والتصدير المدمجة لدينا.
          </Bullet>
          <Bullet>
            <strong className="text-slate-800 dark:text-neutral-200">التصحيح:</strong>{" "}
            يمكنك تحديث أو تصحيح معلوماتك الشخصية من خلال إعدادات مساحة
            العمل أو عن طريق التواصل معنا مباشرة.
          </Bullet>
        </ul>
      </div>

      {/* 7. ملفات تعريف الارتباط */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٧. ملفات تعريف الارتباط
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          تستخدم oDesigns الحد الأدنى من ملفات تعريف الارتباط الضرورية
          لتشغيل خدمتنا. تشمل هذه ملفات تعريف ارتباط جلسة المصادقة
          المطلوبة لإبقائك مسجلاً للدخول وملفات تعريف ارتباط التفضيلات
          الأساسية لإعدادات اللغة والمظهر. نحن لا نستخدم ملفات تعريف
          ارتباط إعلانية أو ملفات تعريف ارتباط تتبع تابعة لأطراف ثالثة.
        </p>
      </div>

      {/* 8. التغييرات على هذه السياسة */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٨. التغييرات على هذه السياسة
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر لتعكس التغييرات
          في ممارساتنا أو التقنية أو المتطلبات القانونية. عندما نجري
          تغييرات جوهرية، سنخطرك عن طريق تحديث تاريخ &quot;آخر
          تحديث&quot; في أعلى هذه الصفحة، وعند الاقتضاء، من خلال إشعار
          داخل التطبيق أو بريد إلكتروني. نشجعك على مراجعة هذه السياسة
          بشكل دوري.
        </p>
      </div>

      {/* 9. التواصل */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
          ٩. التواصل
        </h2>
        <p className="text-slate-600 dark:text-neutral-400 leading-relaxed">
          إذا كانت لديك أي أسئلة أو مخاوف أو طلبات بخصوص سياسة
          الخصوصية هذه أو بياناتك الشخصية، يرجى التواصل معنا على{" "}
          <a
            href="mailto:hi@oagents.app"
            className="text-slate-900 dark:text-white underline underline-offset-2 hover:text-slate-600 dark:hover:text-neutral-300 font-bold"
          >
            hi@oagents.app
          </a>
          . نهدف للرد على جميع الاستفسارات خلال ٥ أيام عمل.
        </p>
      </div>
    </>
  );
}
