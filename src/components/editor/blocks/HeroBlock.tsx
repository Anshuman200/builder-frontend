"use client";

import type { Block, BlockStyle } from "@/stores/editorStore";

interface HeroBlockProps {
    block: Block;
    style: BlockStyle;
}

export function HeroBlock({ block, style }: HeroBlockProps) {
    const p = block.props as Record<string, string>;

    const gradientFrom = p.gradientFrom || "#0f0f23";
    const gradientTo = p.gradientTo || "#1a0533";
    const minHeight = p.minHeight || "80vh";

    return (
        <section
            style={{
                minHeight,
                background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
                padding: style.padding ?? "80px 24px",
                margin: style.margin,
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Glow blobs */}
            <div
                style={{
                    position: "absolute",
                    top: "20%",
                    left: "10%",
                    width: 400,
                    height: 400,
                    borderRadius: "50%",
                    background: "rgba(99,102,241,0.15)",
                    filter: "blur(80px)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "20%",
                    right: "10%",
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: "rgba(139,92,246,0.12)",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                }}
            />

            <div
                style={{
                    position: "relative",
                    maxWidth: 720,
                    margin: "0 auto",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 24,
                }}
            >
                {/* Headline */}
                <h1
                    style={{
                        fontSize: "clamp(2rem, 5vw, 3.5rem)",
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: "-0.03em",
                        background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        margin: 0,
                    }}
                >
                    {p.headline || "Your Headline"}
                </h1>

                {/* Subheadline */}
                <p
                    style={{
                        fontSize: "clamp(1rem, 2vw, 1.2rem)",
                        color: "rgba(255,255,255,0.6)",
                        lineHeight: 1.6,
                        maxWidth: 560,
                        margin: 0,
                    }}
                >
                    {p.subheadline || "Your subheadline goes here."}
                </p>

                {/* CTA */}
                {p.ctaLabel && (
                    <a
                        href={p.ctaUrl || "#"}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "14px 32px",
                            borderRadius: 100,
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: 15,
                            textDecoration: "none",
                            boxShadow: "0 0 24px rgba(99,102,241,0.4)",
                        }}
                        onClick={(e) => e.preventDefault()}
                    >
                        {p.ctaLabel}
                    </a>
                )}
            </div>
        </section>
    );
}
