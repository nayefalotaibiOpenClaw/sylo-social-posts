"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  // Redirect if already authenticated (wait for loading to finish first)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/workspaces");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGoogleSignIn = () => {
    setSigningIn(true);
    void signIn("google", { redirectTo: "/workspaces" });
  };

  return (
    <div className="h-screen bg-white flex flex-col md:flex-row font-sans selection:bg-indigo-100 overflow-hidden">
      {/* Left Side: Form Container */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#0B0E14] flex flex-col relative z-10 overflow-y-auto">
        {/* Navigation - Top Fixed/Absolute */}
        <div className="p-6 md:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Form Centering Wrapper */}
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 lg:px-20 pb-20">
          <div className="w-full max-w-sm mx-auto">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
              <span className="text-slate-900 font-black text-2xl">S</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-white">Welcome back</h1>
            <p className="text-slate-400 font-medium mb-10">Log in or join for free to continue browsing</p>

            <div className="space-y-3">
              <button
                onClick={handleGoogleSignIn}
                disabled={signingIn || isLoading}
                className="w-full h-12 bg-white text-slate-900 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {signingIn ? "Signing in..." : "Continue with Google"}
              </button>
            </div>

            <p className="mt-10 text-center text-slate-500 text-[11px] font-bold leading-relaxed">
              By continuing, you agree to Sylo&apos;s <br />
              <a href="#" className="text-white hover:underline underline-offset-4">Terms of Service</a> and <a href="#" className="text-white hover:underline underline-offset-4">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Collage - Fixed Height */}
      <div className="flex-1 bg-[#F8FAFC] relative overflow-hidden hidden md:flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent)] pointer-events-none" />

        {/* Animated Grid of Screens */}
        <motion.div
          initial={{ rotate: 15, scale: 1.2, x: 60 }}
          animate={{
            x: [60, 40, 60],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 w-[140%] origin-center h-full items-center"
        >
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -12, scale: 1.05, rotate: -2 }}
              className="aspect-[9/16] bg-white rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-200/50 overflow-hidden p-3"
            >
               <div className="w-full h-full bg-slate-50/50 rounded-[1.5rem] relative overflow-hidden flex flex-col">
                  <div className={`w-full h-[45%] bg-gradient-to-br ${
                    i % 3 === 0 ? "from-indigo-500 to-purple-600" :
                    i % 3 === 1 ? "from-pink-500 to-rose-600" :
                    "from-emerald-400 to-teal-600"
                  } opacity-10 animate-pulse`} />
                  <div className="p-4 space-y-3 flex-1">
                    <div className="w-3/4 h-3 bg-slate-200 rounded-full" />
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-full h-2 bg-slate-100 rounded-full" />
                    <div className="w-2/3 h-2 bg-slate-100 rounded-full" />
                    <div className="pt-4 grid grid-cols-2 gap-2">
                       <div className="aspect-square bg-slate-100 rounded-lg" />
                       <div className="aspect-square bg-slate-100 rounded-lg" />
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                     <div className="w-6 h-6 rounded-full bg-slate-200" />
                     <div className="w-10 h-3 bg-slate-100 rounded-full" />
                  </div>
               </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Accents */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}
