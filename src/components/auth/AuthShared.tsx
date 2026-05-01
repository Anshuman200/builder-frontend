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

// ─── Shared theme-aware design tokens ────────────────────────────────────────
export const INPUT_STYLE: React.CSSProperties = {
  background: "var(--auth-input-bg)",
  borderColor: "var(--auth-input-border)",
  borderRadius: 10,
  height: 44,
  color: "var(--auth-text)",
};

export const LABEL_STYLE: React.CSSProperties = {
  color: "var(--auth-label)",
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
      background: "var(--auth-control-bg)",
      borderRadius: 10, padding: 3,
      border: "1px solid var(--auth-border)",
      marginBottom: "1.5rem",
    }}>
      {(["login", "register"] as const).map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          style={{
            padding: "9px 12px", borderRadius: 8, border: "none",
            background: tab === t ? "var(--auth-tab-active-bg)" : "transparent",
            color: tab === t ? "var(--auth-link)" : "var(--auth-muted)",
            fontWeight: tab === t ? 700 : 500,
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.2s ease",
            boxShadow: tab === t ? "0 0 0 1px var(--auth-tab-active-border)" : "none",
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
        color: "var(--auth-text)",
        margin: "0 0 4px",
      }}>
        {title}
      </h3>
      <p style={{ fontSize: "0.82rem", color: "var(--auth-muted)", margin: 0 }}>
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
        color: "var(--auth-link)", fontWeight: 700,
        fontSize: "0.82rem", fontFamily: "inherit",
        padding: 0, transition: "color 0.15s",
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--auth-link-hover)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--auth-link)"; }}
    >
      {children}
    </button>
  );
}
