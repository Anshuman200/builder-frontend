"use client";

import type { Tab } from "@/@Types";
import { useState } from "react";

export function GlassOrb({ style }: { style: React.CSSProperties }) {
    return (
        <div style={{
            position: "absolute", borderRadius: "50%",
            filter: "blur(60px)", pointerEvents: "none", ...style,
        }} />
    );
}

export function TabSwitcher({ tab, onChange }: { tab: Tab; onChange: (t: "login" | "register") => void }) {
    return (
        <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 10, padding: 3,
            border: "1px solid rgba(255,255,255,0.08)",
            marginBottom: "1.5rem",
        }}>
            {(["login", "register"] as const).map(t => (
                <button
                    key={t}
                    type="button"
                    onClick={() => onChange(t)}
                    style={{
                        padding: "8px", borderRadius: 8, border: "none",
                        background: tab === t ? "rgba(255,255,255,0.13)" : "transparent",
                        color: tab === t ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.4)",
                        fontWeight: tab === t ? 700 : 500,
                        fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.2s ease",
                        boxShadow: tab === t
                            ? "0 1px 0 rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)"
                            : "none",
                    }}
                >
                    {t === "login" ? "Log in" : "Sign up"}
                </button>
            ))}
        </div>
    );
}

export function FormHeading({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div style={{ marginBottom: 4 }}>
            <h3 style={{
                fontWeight: 800, fontSize: "1.2rem",
                color: "rgba(255,255,255,0.95)",
                margin: "0 0 4px", letterSpacing: "-0.02em",
            }}>
                {title}
            </h3>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: 0 }}>
                {subtitle}
            </p>
        </div>
    );
}

export function GlassLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#a78bfa", fontWeight: 700,
                fontSize: "0.82rem", fontFamily: "inherit",
                padding: 0, transition: "color 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#a78bfa"; }}
        >
            {children}
        </button>
    );
}
