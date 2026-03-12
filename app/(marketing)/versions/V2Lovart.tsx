"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Paperclip,
  Send,
  CheckCircle2,
  Sparkles,
  Globe,
  Wand2,
  Share2,
} from "lucide-react";
import Link from "next/link";
import FloatingNav from "@/app/components/FloatingNav";
import { PostPreview, themes, socialPosts, appStorePosts, adsPosts } from "./shared";

const rotatingPairs = [
  { word1: "Social Posts", word2: "Coffee Brand" },
  { word1: "App Store Previews", word2: "Fitness App" },
  { word1: "Ad Creatives", word2: "Fashion Store" },
  { word1: "Product Content", word2: "SaaS Platform" },
  { word1: "Story Templates", word2: "Restaurant Chain" },
];

const useCaseCards = [
  {
    category: "Social Media",
    title: "AI-powered posts that stop the scroll",
    posts: socialPosts.slice(0, 3),
    aspect: "1:1" as const,
  },
  {
    category: "App Store",
    title: "Screenshots for iOS & Android in every size",
    posts: appStorePosts.slice(0, 3),
    aspect: "9:16" as const,
  },
  {
    category: "Ad Creatives",
    title: "A/B test dozens of variants instantly",
    posts: adsPosts.slice(0, 3),
    aspect: "16:9" as const,
  },
];

const steps = [
  {
    icon: Globe,
    title: "Paste your URL",
    description: "We extract brand, products, and assets",
  },
  {
    icon: Wand2,
    title: "AI generates content",
    description: "Social posts, ads, app store previews",
  },
  {
    icon: Share2,
    title: "Publish everywhere",
    description: "Push to all channels with one click",
  },
];

export default function V2Lovart() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % rotatingPairs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <FloatingNav activePage="home" />

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="min-h-[160px] md:min-h-[200px] flex flex-col items-center justify-center mb-10">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span>Create </span>
              <span className="inline-block relative w-auto">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`w1-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="font-serif italic text-slate-900 inline-block border-b-4 border-slate-900 pb-1"
                  >
                    {rotatingPairs[activeIndex].word1}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mt-2">
              <span>for a </span>
              <span className="inline-block relative w-auto">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`w2-${activeIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut", delay: 0.05 }}
                    className="font-serif italic text-slate-900 inline-block border-b-4 border-slate-900 pb-1"
                  >
                    {rotatingPairs[activeIndex].word2}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
          >
            Start designing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Editor Mockup Section */}
      <section className="pb-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-6xl mx-auto"
        >
          <div className="bg-[#f5f5f0] rounded-3xl border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/60">
            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Left Panel - Canvas */}
              <div className="flex-[3] p-6 md:p-8 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-slate-400 font-medium">Canvas</span>
                </div>

                <div className="relative h-[380px]">
                  {/* Post previews scattered on canvas */}
                  <div className="absolute top-0 left-0">
                    <PostPreview theme={socialPosts[0].theme} size={160}>
                      {socialPosts[0].component}
                    </PostPreview>
                  </div>
                  <div className="absolute top-4 left-[180px] hidden md:block">
                    <PostPreview theme={socialPosts[1].theme} size={150}>
                      {socialPosts[1].component}
                    </PostPreview>
                  </div>
                  <div className="absolute top-[170px] left-[40px]">
                    <PostPreview theme={socialPosts[2].theme} size={155}>
                      {socialPosts[2].component}
                    </PostPreview>
                  </div>
                  <div className="absolute top-[180px] left-[220px] hidden md:block">
                    <PostPreview theme={socialPosts[3].theme} size={145}>
                      {socialPosts[3].component}
                    </PostPreview>
                  </div>

                  {/* Dimension label */}
                  <div className="absolute top-[155px] left-[5px] hidden md:flex items-center gap-1">
                    <div className="bg-white/90 backdrop-blur-sm text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded border border-slate-200">
                      Image 540 x 720
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - AI Chat */}
              <div className="flex-[2] bg-white border-t md:border-t-0 md:border-l border-slate-200 flex flex-col">
                {/* Chat Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-700">New Chat</span>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-5 space-y-4 overflow-hidden">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-slate-100 rounded-2xl rounded-tr-md px-4 py-3 max-w-[90%]">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Create social media content for my brand, including product showcases and
                        promotional posts.
                      </p>
                    </div>
                  </div>

                  {/* Status items */}
                  <div className="space-y-2 pl-1">
                    {["Analyzed brand identity", "Extracted products", "Generated content"].map(
                      (status) => (
                        <div key={status} className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs text-slate-500">{status}</span>
                        </div>
                      )
                    )}
                  </div>

                  {/* AI response */}
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[95%]">
                      <p className="text-sm text-slate-600 leading-relaxed">
                        I&apos;ve generated on-brand content for your social channels, including
                        product posts and promotional creatives.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="flex-1 text-sm text-slate-400">What shall we create?</span>
                    <Send className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Use Case Cards */}
      <section className="pb-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {useCaseCards.map((card, i) => (
              <motion.div
                key={card.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-100"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {card.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2 mb-6">{card.title}</h3>
                <div className="flex gap-3 justify-center overflow-hidden">
                  {card.posts.map((post, j) => (
                    <div key={j} className="shrink-0">
                      <PostPreview theme={post.theme} size={140} aspect={card.aspect}>
                        {post.component}
                      </PostPreview>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="pb-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 tracking-tight">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-6 h-6 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-28 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Ready to create?</h2>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-slate-800 hover:scale-105 transition-all active:scale-95"
          >
            Start designing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span>&copy; {new Date().getFullYear()} oDesigns. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-600 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
