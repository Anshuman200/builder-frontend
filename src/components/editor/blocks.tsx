"use client";

/**
 * blocks.tsx — All 6 block renderers + BlockRenderer dispatch
 * Pure presentational: reads block.props, renders HTML. No editing here.
 */

import type { Block } from "@/stores/editorStore";
import { ImageIcon } from "lucide-react";

// ─── Shared types ─────────────────────────────────────────────────────────────

interface BlockProps {
  block: Block;
}

// ─── Hero Block ───────────────────────────────────────────────────────────────

function HeroBlock({ block }: any) {
  const p = block.props;
  const align = (p.align as string) || "center";
  const alignItems = align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start";
  const textAlign = align as React.CSSProperties["textAlign"];

  return (
    <section
      style={{
        minHeight: (p.minHeight as string) || "420px",
        background: (p.bgColor as string) || "#6366f1",
        color: (p.textColor as string) || "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems,
        justifyContent: "center",
        padding: "64px 32px",
        textAlign,
      }}
    >
      <h1
        style={{
          margin: "0 0 16px",
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          fontWeight: 800,
          lineHeight: 1.15,
          maxWidth: 640,
        }}
      >
        {(p.heading as string) || "Your Headline"}
      </h1>
      {p.subheading && (
        <p
          style={{
            margin: "0 0 32px",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            opacity: 0.8,
            maxWidth: 520,
            lineHeight: 1.6,
          }}
        >
          {p.subheading as string}
        </p>
      )}
      {p.ctaLabel && (
        <a
          href={(p.ctaHref as string) || "#"}
          onClick={(e) => e.preventDefault()}
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "rgba(255,255,255,0.2)",
            color: "inherit",
            borderRadius: 9999,
            fontWeight: 700,
            fontSize: "0.95rem",
            textDecoration: "none",
            border: "2px solid rgba(255,255,255,0.4)",
            cursor: "default",
          }}
        >
          {p.ctaLabel as string}
        </a>
      )}
    </section>
  );
}

// ─── Text Block ───────────────────────────────────────────────────────────────

function TextBlock({ block }: BlockProps) {
  const p = block.props;
  const Tag = ((p.tag as string) || "p") as React.ElementType;
  const defaultSizes: Record<string, string> = {
    h1: "2.25rem", h2: "1.875rem", h3: "1.5rem", h4: "1.25rem", p: "1rem",
  };
  const tag = (p.tag as string) || "p";

  return (
    <div style={{ padding: "16px 24px" }}>
      <Tag
        style={{
          margin: 0,
          fontSize: (p.fontSize as string) || defaultSizes[tag] || "1rem",
          fontWeight: p.bold ? 700 : tag.startsWith("h") ? 700 : 400,
          color: (p.color as string) || "var(--text)",
          textAlign: (p.align as React.CSSProperties["textAlign"]) || "left",
          lineHeight: 1.6,
        }}
      >
        {(p.content as string) || (
          <span style={{ color: "var(--text-subtle)", fontStyle: "italic" }}>
            Click to edit text…
          </span>
        )}
      </Tag>
    </div>
  );
}

// ─── Image Block ──────────────────────────────────────────────────────────────

function ImageBlock({ block }: BlockProps) {
  const p = block.props;
  const src = p.src as string;

  if (!src) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 200,
          background: "var(--surface)",
          border: "2px dashed var(--border)",
          color: "var(--text-subtle)",
        }}
      >
        <ImageIcon size={28} />
        <span style={{ fontSize: 13 }}>Set image URL in properties →</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={(p.alt as string) || ""}
      style={{
        display: "block",
        width: (p.width as string) || "100%",
        objectFit: (p.objectFit as React.CSSProperties["objectFit"]) || "cover",
        borderRadius: (p.borderRadius as string) || "0px",
      }}
    />
  );
}

// ─── Button Block ─────────────────────────────────────────────────────────────

const BUTTON_VARIANTS: Record<string, React.CSSProperties> = {
  primary: { background: "var(--primary)", color: "#fff", border: "none" },
  outline: { background: "transparent", color: "var(--primary)", border: "2px solid var(--primary)" },
  ghost: { background: "transparent", color: "var(--primary)", border: "none" },
};

const BUTTON_SIZES: Record<string, React.CSSProperties> = {
  sm: { padding: "7px 18px", fontSize: "0.8rem" },
  md: { padding: "10px 24px", fontSize: "0.9rem" },
  lg: { padding: "14px 32px", fontSize: "1rem" },
};

function ButtonBlock({ block }: BlockProps) {
  const p = block.props;
  const variant = (p.variant as string) || "primary";
  const size = (p.size as string) || "md";
  const align = (p.align as string) || "left";
  const fullWidth = p.fullWidth === true;

  return (
    <div style={{ padding: "16px 24px", textAlign: align as React.CSSProperties["textAlign"] }}>
      <a
        href={(p.href as string) || "#"}
        onClick={(e) => e.preventDefault()}
        style={{
          display: fullWidth ? "block" : "inline-block",
          width: fullWidth ? "100%" : undefined,
          textAlign: "center",
          textDecoration: "none",
          borderRadius: 9999,
          fontWeight: 600,
          cursor: "default",
          ...BUTTON_VARIANTS[variant],
          ...BUTTON_SIZES[size],
        }}
      >
        {(p.label as string) || "Click me"}
      </a>
    </div>
  );
}

// ─── Divider Block ────────────────────────────────────────────────────────────

function DividerBlock({ block }: BlockProps) {
  const p = block.props;

  return (
    <div style={{ padding: `${(p.marginY as string) || "1rem"} 24px` }}>
      <hr
        style={{
          border: "none",
          borderTopWidth: (p.thickness as string) || "1px",
          borderTopStyle: ((p.style as string) || "solid") as React.CSSProperties["borderTopStyle"],
          borderTopColor: (p.color as string) || "var(--border)",
          margin: 0,
        }}
      />
    </div>
  );
}

// ─── Columns Block ────────────────────────────────────────────────────────────

function ColumnsBlock({ block }: BlockProps) {
  const p = block.props;
  const leftWidth = Number(p.leftWidth || 50);
  const rightWidth = 100 - leftWidth;
  const gap = (p.gap as string) || "1.5rem";
  const children = block.children || [];

  // Split children: even indices → col 0, odd → col 1
  const col0 = children.filter((_, i) => i % 2 === 0);
  const col1 = children.filter((_, i) => i % 2 !== 0);

  return (
    <div style={{ display: "flex", gap, padding: "24px" }}>
      <div style={{ flex: `0 0 ${leftWidth}%`, minHeight: 80 }}>
        {col0.length > 0
          ? col0.map((child) => <BlockRenderer key={child.id} block={child} />)
          : <ColumnPlaceholder label="Column 1" />}
      </div>
      <div style={{ flex: `0 0 ${rightWidth}%`, minHeight: 80 }}>
        {col1.length > 0
          ? col1.map((child) => <BlockRenderer key={child.id} block={child} />)
          : <ColumnPlaceholder label="Column 2" />}
      </div>
    </div>
  );
}

function ColumnPlaceholder({ label }: { label: string }) {
  return (
    <div
      style={{
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px dashed var(--border)",
        borderRadius: 6,
        color: "var(--text-subtle)",
        fontSize: 12,
      }}
    >
      {label}
    </div>
  );
}

// ─── Block Renderer (dispatch) ────────────────────────────────────────────────

export function BlockRenderer({ block }: BlockProps) {
  switch (block.type) {
    case "hero":    return <HeroBlock block={block} />;
    case "text":    return <TextBlock block={block} />;
    case "image":   return <ImageBlock block={block} />;
    case "button":  return <ButtonBlock block={block} />;
    case "divider": return <DividerBlock block={block} />;
    case "columns": return <ColumnsBlock block={block} />;
    default:
      return (
        <div style={{ padding: 16, color: "var(--text-subtle)", fontSize: 13 }}>
          Unknown block: {block.type}
        </div>
      );
  }
}
