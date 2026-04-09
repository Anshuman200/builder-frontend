"use client";

import type { Tab } from "@/types";
import { memo } from "react";

// ─── Decorative orb ──────────────────────────────────────────────────────────
export const GlassOrb = memo(function GlassOrb({ style }: { style: React.CSSProperties }) {
  return (
    <div style={{
      position: "absolute", borderRadius: "50%",
      filter: "blur(60px)", pointerEvents: "none",
      willChange: "transform",
      ...style,
    }} />
  );
});

// ─── Shared dark-theme design tokens ─────────────────────────────────────────
export const INPUT_STYLE: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  borderColor: "rgba(255,255,255,0.1)",
  borderRadius: 10,
  height: 44,
  color: "#f9fafb",
};

export const LABEL_STYLE: React.CSSProperties = {
  color: "rgba(255,255,255,0.65)",
  fontSize: "0.82rem",
  fontWeight: 600,
};

export const BTN_STYLE: React.CSSProperties = {
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  border: "none",
  fontWeight: 700,
  borderRadius: 10,
  height: 44,
};

// ─── Tab switcher (Log in / Sign up) ─────────────────────────────────────────
export function TabSwitcher({ tab, onChange }: { tab: Tab; onChange: (t: "login" | "register") => void }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr",
      background: "rgba(255,255,255,0.05)",
      borderRadius: 10, padding: 3,
      border: "1px solid rgba(255,255,255,0.07)",
      marginBottom: "1.5rem",
    }}>
      {(["login", "register"] as const).map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          style={{
            padding: "9px 12px", borderRadius: 8, border: "none",
            background: tab === t ? "rgba(99,102,241,0.25)" : "transparent",
            color: tab === t ? "#a5b4fc" : "rgba(255,255,255,0.35)",
            fontWeight: tab === t ? 700 : 500,
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s ease",
            boxShadow: tab === t ? "0 0 0 1px rgba(99,102,241,0.3)" : "none",
          }}
        >
          {t === "login" ? "Log in" : "Sign up"}
        </button>
      ))}
    </div>
  );
}

// ─── Form heading ─────────────────────────────────────────────────────────────
export function FormHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h3 style={{
        fontWeight: 800, fontSize: "1.25rem",
        color: "#f9fafb",
        margin: "0 0 4px", letterSpacing: "-0.02em",
      }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Inline link button ───────────────────────────────────────────────────────
export function GlassLink({
  onClick,
  children,
  style,
}: {
  onClick: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#a78bfa", fontWeight: 700,
        fontSize: "0.82rem", fontFamily: "inherit",
        padding: 0, transition: "color 0.15s",
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
    >
      {children}
    </button>
  );
}
