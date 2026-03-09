"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import {
  Sparkles,
  Globe,
  Smartphone,
  LayoutGrid,
  Palette,
  Zap,
  ArrowRight,
  CheckCircle2,
  Layers,
  Monitor,
  Search,
  ChevronRight,
  LogOut
} from "lucide-react";

const FloatingLogo = ({ delay, children, top, left, right }: { delay: number; children: React.ReactNode; top?: string; left?: string; right?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      scale: [1, 1.1, 1],
      y: [0, -10, 0]
    }}
    transition={{ 
      duration: 4, 
      delay, 
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute z-0 hidden md:flex items-center justify-center"
    style={{ top, left, right }}
  >
    <div className="w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center justify-center p-2">
      {children}
    </div>
  </motion.div>
);

const AppMockup = ({ color, title, delay = 0 }: { color: string; title: string; delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="w-full aspect-[9/19] bg-slate-900 rounded-[2rem] border-[6px] border-slate-800 shadow-2xl relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-b ${color} opacity-80`} />
    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
      <div className="space-y-2">
        <div className="w-8 h-1 bg-white/30 rounded-full mx-auto" />
        <h4 className="text-xl font-black mt-4">{title}</h4>
      </div>
      <div className="space-y-4">
        <div className="w-full h-32 bg-white/10 rounded-xl backdrop-blur-md" />
        <div className="w-full h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-slate-900 text-[10px] font-bold uppercase tracking-wider">Get Started</span>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signOut } = useAuthActions();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-slate-200/50">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-sm">S</span>
              </div>
              <span className="font-black text-lg tracking-tight">Sylo</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-500">
              <a href="#" className="hover:text-slate-900">Pricing</a>
              {!isLoading && !isAuthenticated && (
                <Link href="/login" className="hover:text-slate-900">Log in</Link>
              )}
            </div>
          </div>
          {isLoading ? (
            <div className="w-24 h-9 bg-slate-100 rounded-full animate-pulse" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                href="/workspaces"
                className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-all active:scale-95"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-2">
                {user?.image ? (
                  <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="text-slate-600 font-bold text-xs">{user?.name?.[0] ?? "?"}</span>
                  </div>
                )}
                <button
                  onClick={() => void signOut()}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-900"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-slate-900 text-white font-bold text-sm hover:scale-105 transition-all active:scale-95"
            >
              Join for free
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-20 px-6 relative">
        {/* Floating Logos Background */}
        <FloatingLogo top="20%" left="15%" delay={0}><div className="w-full h-full bg-indigo-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="35%" left="8%" delay={1}><div className="w-full h-full bg-pink-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="15%" right="10%" delay={0.5}><div className="w-full h-full bg-yellow-500 rounded-md" /></FloatingLogo>
        <FloatingLogo top="40%" right="12%" delay={1.5}><div className="w-full h-full bg-emerald-500 rounded-md" /></FloatingLogo>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8"
          >
            Find design patterns <br /> in seconds.
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-center gap-2 mb-16"
          >
            <div className="bg-slate-100 p-1 rounded-full flex gap-1">
              <button className="px-6 py-2 rounded-full bg-white shadow-sm font-bold text-sm">Screens</button>
              <button className="px-6 py-2 rounded-full text-slate-500 font-bold text-sm hover:text-slate-900">UI Elements</button>
              <button className="px-6 py-2 rounded-full text-slate-500 font-bold text-sm hover:text-slate-900">Flows</button>
              <button className="px-6 py-2 rounded-full text-slate-500 font-bold text-sm hover:text-slate-900 hidden sm:block">Text in Screenshot</button>
            </div>
          </motion.div>
        </div>

        {/* Dense Mockup Row */}
        <div className="w-full overflow-hidden mt-12">
          <motion.div 
            initial={{ x: 0 }}
            animate={{ x: "-10%" }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-6 px-6"
          >
            {[
              { color: "from-blue-500 to-indigo-600", title: "Wallet" },
              { color: "from-orange-400 to-red-500", title: "Welcome" },
              { color: "from-slate-800 to-slate-900", title: "Account Setup" },
              { color: "from-purple-500 to-indigo-800", title: "Home" },
              { color: "from-emerald-400 to-teal-600", title: "Subscribe" },
              { color: "from-pink-500 to-rose-600", title: "Social" },
              { color: "from-amber-400 to-orange-600", title: "Orders" },
            ].map((mock, i) => (
              <div key={i} className="min-w-[280px]">
                <AppMockup {...mock} delay={i * 0.1} />
                <div className="mt-4 flex items-center justify-between px-2">
                   <span className="font-bold text-sm">{mock.title}</span>
                   <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                   </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Feature Section 1: Automation */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8">Time saving automation</h2>
          <p className="text-xl text-slate-500 max-w-3xl mx-auto mb-20 leading-relaxed">
            Automatically scale screenshots in all required sizes on App Store & Google Play, 
            saving 10+ hours and ensuring consistency.
          </p>
          
          <div className="relative flex items-end justify-center gap-4 md:gap-8 pt-20">
             {/* Device Stack Mockup */}
             <div className="w-[30%] aspect-video bg-slate-900 rounded-xl border-4 border-slate-800 shadow-2xl relative z-0 scale-125">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
             </div>
             <div className="w-[15%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-10 left-[20%] z-10 hidden md:block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-400/20" />
             </div>
             <div className="w-[18%] aspect-[9/19] bg-slate-900 rounded-3xl border-4 border-slate-800 shadow-2xl absolute -bottom-20 right-[25%] z-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-indigo-500/30" />
             </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2: Dark Cards (Screenshot 5 Style) */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Global Reach Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
            <div>
              <h3 className="text-4xl font-black mb-6 leading-tight">Global reach with localization on <br /> App Store & Google Play</h3>
              <p className="text-slate-400 text-lg mb-12">Localize your screenshots to different languages and regions, to effectively market your app to a global audience</p>
            </div>
            <div className="flex gap-4 items-end mt-12 -mb-20 overflow-hidden">
               {[
                 { color: "bg-emerald-500", text: "English" },
                 { color: "bg-purple-600", text: "Arabic" },
                 { color: "bg-yellow-400", text: "French" },
                 { color: "bg-orange-600", text: "German" },
               ].map((lang, i) => (
                 <div key={i} className={`flex-1 aspect-[9/16] ${lang.color} rounded-t-2xl p-4 flex flex-col justify-between`}>
                    <div className="w-full h-1 bg-white/30 rounded" />
                    <div className="space-y-2">
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-full h-2 bg-white/20 rounded" />
                       <div className="w-2/3 h-2 bg-white/20 rounded" />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Identity/Font Card */}
          <div className="bg-black rounded-[2.5rem] p-12 text-white flex flex-col justify-between overflow-hidden">
             <div>
                <h3 className="text-4xl font-black mb-6 leading-tight">Personalize app's identity using Font styling</h3>
                <p className="text-slate-400 text-lg mb-12">Transform your app's look using AppLaunchpad's screenshot creator font styles like font family, font size, alignment.</p>
             </div>
             <div className="bg-white rounded-2xl p-6 -mb-24 mt-12">
                <div className="flex gap-6 h-full">
                   <div className="w-1/3 space-y-4 text-slate-900">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Font Size</span>
                        <div className="h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold">150</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">Font Family</span>
                        <div className="h-10 border border-slate-200 rounded-lg px-3 flex items-center justify-between text-xs font-bold">
                           Bangers <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                   </div>
                   <div className="flex-1 bg-blue-600 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <h4 className="text-3xl font-black tracking-wider leading-none">LOG YOUR EXERCISES AND MONITOR PROGRESS</h4>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Library Grid: Popular Collections (Screenshot 9 Style) */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-4xl font-black mb-12">Popular Collections</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                "Behavioral UX Patterns", "Tactile", "(Empty) State of the art",
                "Animation", "Tracking", "Personalisation"
              ].map((title, i) => (
                <div key={i} className="group cursor-pointer">
                   <div className="aspect-[1.5] bg-slate-50 rounded-[2rem] p-6 border border-slate-100 group-hover:bg-slate-100 transition-colors relative overflow-hidden">
                      <div className="grid grid-cols-2 gap-4 h-full">
                         <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100" />
                         <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100 mt-8" />
                      </div>
                   </div>
                   <div className="mt-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden" />
                      <span className="font-bold text-slate-700">{title}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust / Action Split View (Screenshot 4 Style) */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-stretch rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-slate-100">
           <div className="flex-1 bg-slate-900 p-12 md:p-20 text-white flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8">
                <span className="text-slate-900 font-black text-2xl">S</span>
              </div>
              <h2 className="text-5xl font-black mb-12">Welcome back</h2>
              
              <div className="w-full max-w-sm space-y-4">
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                   <div className="w-5 h-5 bg-blue-500 rounded" />
                   Continue with Google
                </button>
                <button className="w-full h-14 border border-white/20 rounded-xl font-bold hover:bg-white/5 transition-all">
                   See other options
                </button>
                <div className="py-4 flex items-center gap-4 text-white/30 text-xs font-bold uppercase tracking-widest">
                   <div className="flex-1 h-px bg-white/10" /> or <div className="flex-1 h-px bg-white/10" />
                </div>
                <input 
                  type="email" 
                  placeholder="Enter email address"
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
                <button className="w-full h-14 bg-white text-slate-900 rounded-xl font-black text-lg">
                   Continue
                </button>
              </div>
           </div>
           
           <div className="flex-1 bg-slate-50 relative overflow-hidden hidden md:block">
              {/* Dense screen collage representation */}
              <div className="absolute inset-0 grid grid-cols-2 gap-4 p-8 rotate-12 scale-125 origin-center opacity-40">
                 {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[9/16] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
                       <div className="w-full h-1/2 bg-slate-100 rounded-lg mb-4" />
                       <div className="w-3/4 h-2 bg-slate-100 rounded mb-2" />
                       <div className="w-full h-2 bg-slate-100 rounded" />
                    </div>
                 ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-l from-slate-50 via-transparent to-transparent" />
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 font-bold text-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">S</span>
            </div>
            <span className="font-black">Sylo Social.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-slate-900">Twitter</a>
            <a href="#" className="hover:text-slate-900">LinkedIn</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
          </div>
          <p>© 2024 Sylo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
