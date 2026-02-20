"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useState, useEffect } from "react";

export function FloatingThemeSwitcher() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const options = [
        { value: "light", icon: Sun, label: "Light" },
        { value: "dark", icon: Moon, label: "Dark" },
        { value: "system", icon: Monitor, label: "Auto" },
    ];

    const current = options.find(o => o.value === theme) ?? options[1];
    const Icon = current.icon;

    return (
        <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 200 }}>
            {/* Popup panel */}
            {open && (
                <div style={{
                    position: "absolute", bottom: "calc(100% + 0.75rem)", right: 0,
                    background: "rgba(18,18,21,0.95)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-lg)",
                    padding: "0.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                    minWidth: "9rem",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
                    animation: "fade-in-up 0.15s ease-out",
                }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-subtle)", padding: "0.25rem 0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Theme
                    </p>
                    {options.map(({ value, icon: OptionIcon, label }) => (
                        <button
                            key={value}
                            onClick={() => { setTheme(value); setOpen(false); }}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.625rem",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "var(--radius)",
                                background: theme === value ? "rgba(99,102,241,0.2)" : "transparent",
                                border: theme === value ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                                color: theme === value ? "var(--primary)" : "var(--text-muted)",
                                fontSize: "0.875rem", fontWeight: theme === value ? 600 : 400,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                width: "100%",
                                textAlign: "left",
                            }}
                            onMouseEnter={e => {
                                if (theme !== value) {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                                    (e.currentTarget as HTMLElement).style.color = "var(--text)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (theme !== value) {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                    (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                                }
                            }}
                        >
                            <OptionIcon size={14} />
                            {label}
                        </button>
                    ))}
                </div>
            )}

            {/* FAB button */}
            <button
                onClick={() => setOpen(!open)}
                aria-label="Toggle theme"
                style={{
                    width: 48, height: 48,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    boxShadow: open
                        ? "0 0 0 4px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.5)"
                        : "0 4px 20px rgba(99,102,241,0.5), 0 8px 24px rgba(0,0,0,0.4)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white",
                    transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                    transform: open ? "rotate(45deg) scale(1.05)" : "scale(1)",
                }}
                onMouseEnter={e => {
                    if (!open) (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                }}
                onMouseLeave={e => {
                    if (!open) (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
            >
                <Icon size={20} />
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    onClick={() => setOpen(false)}
                    style={{ position: "fixed", inset: 0, zIndex: -1 }}
                />
            )}
        </div>
    );
}
