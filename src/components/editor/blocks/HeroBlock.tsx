"use client";

import { Block } from "@/stores/editorStore";

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaHref?: string;
  align?: "left" | "center" | "right";
  bgColor?: string;
  textColor?: string;
  ctaColor?: string;
}

export function HeroBlock({ block }: { block: Block }) {
  const p = block.props as HeroProps;
  const align = p.align ?? "center";
  const bgColor = p.bgColor ?? "linear-gradient(135deg, #0f0f23, #1a0533)";
  const textColor = p.textColor ?? "#ffffff";
  const ctaColor = p.ctaColor ?? "#6366f1";

  return (
    <section style={{
      padding: "5rem 2rem",
      background: bgColor,
      textAlign: align,
      color: textColor,
    }}>
      {p.heading && (
        <h1 style={{
          fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          marginBottom: "1rem",
          color: textColor,
        }}>
          {p.heading}
        </h1>
      )}
      {p.subheading && (
        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)",
          opacity: 0.75,
          lineHeight: 1.6,
          marginBottom: "2rem",
          maxWidth: 560,
          margin: "0 auto 2rem",
          color: textColor,
        }}>
          {p.subheading}
        </p>
      )}
      {p.ctaText && (
        <a
          href={p.ctaHref ?? "#"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "0.75rem 1.75rem",
            background: ctaColor,
            color: "white",
            borderRadius: "999px",
            fontWeight: 700,
            fontSize: "1rem",
            textDecoration: "none",
            boxShadow: `0 4px 24px ${ctaColor}55`,
          }}
          onClick={e => e.preventDefault()}
        >
          {p.ctaText}
        </a>
      )}
    </section>
  );
}
