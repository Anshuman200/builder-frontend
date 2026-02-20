"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import { Container } from "@/components/ui/Container";

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
  { value: "50K+", label: "Pages Published" },
  { value: "8K+", label: "Active Creators" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<1s", label: "Page Load Time" },
];

const TRUST_LOGOS = ["Notion", "Linear", "Vercel", "Stripe", "Figma", "GitHub", "Supabase", "PlanetScale"];

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
    }, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const slide = BG_SLIDES[slideIdx];

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>

      {/* ── Sliding Background ─────────────────────────────────────────────── */}
      <div
        className="animate-slide-bg"
        style={{
          position: "absolute", inset: "-10%",
          background: slide.gradient,
          transition: "background 1.2s ease",
          opacity: transitioning ? 0.7 : 1,
        }}
      />

      {/* ── Glow Blobs ────────────────────────────────────────────────────── */}
      <div className="glow-blob animate-float" style={{
        width: 600, height: 600, background: slide.blob1,
        top: "-15%", left: "-10%", opacity: 0.15,
        transition: "background 1.5s ease",
        animationDelay: "0s",
      }} />
      <div className="glow-blob animate-float" style={{
        width: 500, height: 500, background: slide.blob2,
        top: "20%", right: "-8%", opacity: 0.2,
        transition: "background 1.5s ease",
        animationDelay: "1.5s",
      }} />
      <div className="glow-blob animate-float" style={{
        width: 350, height: 350, background: slide.blob3,
        bottom: "5%", left: "30%", opacity: 0.15,
        transition: "background 1.5s ease",
        animationDelay: "3s",
      }} />

      {/* ── Grid overlay ──────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
      }} />

      {/* ── Slide indicators ──────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: "0.5rem", zIndex: 10,
      }}>
        {BG_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setSlideIdx(i)} style={{
            width: i === slideIdx ? 24 : 8, height: 8,
            borderRadius: 4,
            background: i === slideIdx ? "rgba(129,140,248,0.9)" : "rgba(255,255,255,0.2)",
            border: "none", cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        ))}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <Container className="hero-inner" style={{ paddingTop: 120, paddingBottom: 80, position: "relative", zIndex: 5 }}>
        <div style={{ maxWidth: 820, margin: "0 auto", textAlign: "center" }}>

          {/* Badge */}
          <div className="animate-fade-in-up" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.375rem 1rem", borderRadius: "var(--radius-full)",
            background: "rgba(99,102,241,0.12)",
            border: "1px solid rgba(99,102,241,0.3)",
            marginBottom: "1.75rem",
            fontSize: "0.8rem", fontWeight: 600,
            color: "#a5b4fc",
            backdropFilter: "blur(8px)",
          }}>
            <Sparkles size={13} style={{ color: "#f9a8d4" }} />
            Introducing PageCraft 2.0 — Now with AI blocks
            <ArrowRight size={12} />
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-in-up delay-100"
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.04em",
              marginBottom: "1.5rem",
              color: "white",
              opacity: 0,
            }}
          >
            Build pages that{" "}
            <span className="gradient-text-shimmer">
              actually convert
            </span>
            <br />without writing code
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-in-up delay-200"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              maxWidth: 560,
              margin: "0 auto 2.5rem",
              opacity: 0,
            }}
          >
            Drag, drop, and publish stunning landing pages, portfolios &amp; websites in minutes.
            No design skills needed — just your idea.
          </p>

          {/* CTA Buttons */}
          <div
            className="animate-fade-in-up delay-300"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "1rem", flexWrap: "wrap",
              marginBottom: "3.5rem",
              opacity: 0,
            }}
          >
            <Link
              href="/editor"
              className="animate-pulse-glow"
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                padding: "0.875rem 2rem",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                letterSpacing: "-0.01em",
                transition: "transform 0.2s, filter 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.02)";
                (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
              }}
            >
              Start building — it&apos;s free
              <ArrowRight size={16} />
            </Link>

            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: "0.625rem",
                padding: "0.875rem 1.5rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.8)",
                fontWeight: 600,
                fontSize: "1rem",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Play size={11} fill="white" color="white" style={{ marginLeft: 2 }} />
              </div>
              Watch demo
            </button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div
          className="animate-fade-in-up delay-500"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "var(--radius-xl)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)",
            marginTop: "4rem",
            overflow: "hidden",
            opacity: 0,
          }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} style={{
              padding: "1.5rem",
              background: "rgba(255,255,255,0.02)",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "0.25rem",
              }}
                className="gradient-text"
              >
                {value}
              </div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
