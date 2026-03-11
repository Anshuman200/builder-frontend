"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { ArrowRightIcon, PlayIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { CommonContainer } from "@/components/layout/CommonContainer";

const BG_SLIDES = [
  {
    gradient: "linear-gradient(135deg, #0f0f23 0%, #1a0533 30%, #0d1b4b 70%, #09090b 100%)",
    blob1: "#6366f1", blob2: "#8b5cf6", blob3: "#3b82f6",
  },
  {
    gradient: "linear-gradient(135deg, #09090b 0%, #0d2b1a 30%, #0f2040 70%, #1a0533 100%)",
    blob1: "#10b981", blob2: "#6366f1", blob3: "#a78bfa",
  },
  {
    gradient: "linear-gradient(135deg, #1a0a0f 0%, #0d0f2b 30%, #1a0533 70%, #09090b 100%)",
    blob1: "#f43f5e", blob2: "#8b5cf6", blob3: "#6366f1",
  },
];

const STATS = [
  { value: "5+", label: "Pages Published" },
  { value: "8+", label: "Active Creators" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<1s", label: "Page Load Time" },
];

export function HeroSection() {
  const [slideIdx, setSlideIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setSlideIdx(i => (i + 1) % BG_SLIDES.length);
        setTransitioning(false);
      }, 700);
    }, 3019);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = BG_SLIDES[slideIdx];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">

      {/* ── Sliding Background ── */}
      <div
        className="absolute inset-[-10%] transition-all duration-1000"
        style={{
          background: slide.gradient,
          opacity: transitioning ? 0.7 : 1,
        }}
      />

      {/* ── Glow Blobs ── */}
      <div className="glow-blob animate-float absolute top-[-15%] left-[-10%] w-[600px] h-[600px] opacity-15 transition-colors duration-1000" style={{ background: slide.blob1 }} />
      <div className="glow-blob animate-float absolute top-[20%] right-[-8%] w-[500px] h-[500px] opacity-20 transition-colors duration-1000" style={{ background: slide.blob2, animationDelay: "1.5s" }} />
      <div className="glow-blob animate-float absolute bottom-[5%] left-[30%] w-[350px] h-[350px] opacity-15 transition-colors duration-1000" style={{ background: slide.blob3, animationDelay: "3s" }} />

      {/* ── Grid Overlay ── */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
        }}
      />

      {/* ── Content ── */}
      <CommonContainer className="relative z-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold backdrop-blur-md mb-8 animate-fade-in-up">
            <SparklesIcon className="w-4 h-4 text-pink-400" />
            Introducing PageCraft 2.0 — Now with AI blocks
            <ArrowRightIcon className="w-3 h-3" />
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 animate-fade-in-up delay-100">
            Build pages that <span className="gradient-text-shimmer italic">actually convert</span> without writing code
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-12 animate-fade-in-up delay-200">
            Drag, drop, and publish stunning landing pages, portfolios & websites in minutes.
            No design skills needed — just your idea.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Button
              type="primary"
              size="large"
              href="/editor"
              className="h-14 px-8 rounded-full bg-linear-to-br from-indigo-500 via-violet-600 to-purple-600 border-none font-bold text-lg shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition-transform"
            >
              Start building — it&apos;s free
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="large"
              className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg backdrop-blur-md hover:bg-white/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center mr-2">
                <PlayIcon className="w-3 h-3 text-white ml-0.5" />
              </div>
              Watch demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-3xl border border-white/10 backdrop-blur-xl mt-20 overflow-hidden animate-fade-in-up delay-500">
            {STATS.map(({ value, label }) => (
              <div key={label} className="p-8 bg-black/40 text-center">
                <div className="text-3xl lg:text-4xl font-black bg-linear-to-b from-white to-white/50 bg-clip-text text-transparent mb-1">
                  {value}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CommonContainer>
    </section>
  );
}
