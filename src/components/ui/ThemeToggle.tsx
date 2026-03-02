"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export function ThemeToggle({ className }: { className?: string }) {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [hovered, setHovered] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return <div style={{ width: 36, height: 36 }} />;

    const isDark = resolvedTheme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            title={`Switch to ${isDark ? "light" : "dark"} mode`}
            style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: hovered ? "rgba(255,255,255,0.08)" : "transparent",
                color: hovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.5)",
                transition: "all 0.15s",
                flexShrink: 0,
            }}
            className={className}
        >
            {isDark ? <SunIcon style={{ width: 17, height: 17 }} /> : <MoonIcon style={{ width: 17, height: 17 }} />}
        </button>
    );
}

// Full 3-way toggle: light / dark / system
export function ThemeSelector() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    const options = [
        { value: "light", icon: SunIcon, label: "Light" },
        { value: "dark", icon: MoonIcon, label: "Dark" },
        { value: "system", icon: ComputerDesktopIcon, label: "System" },
    ];

    return (
        <div
            role="radiogroup"
            style={{ background: "var(--surface)", borderRadius: "var(--radius)", padding: "2px", display: "flex", gap: "2px" }}
        >
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    role="radio"
                    aria-checked={theme === value}
                    onClick={() => setTheme(value)}
                    title={label}
                    style={{
                        padding: "0.375rem 0.625rem",
                        borderRadius: "calc(var(--radius) - 2px)",
                        background: theme === value ? "#6366f1" : "transparent",
                        color: theme === value ? "white" : "rgba(255,255,255,0.5)",
                        display: "flex", alignItems: "center", gap: "0.25rem",
                        fontSize: "0.75rem", fontWeight: 500,
                        transition: "all 0.15s",
                        border: "none", cursor: "pointer",
                        fontFamily: "inherit",
                    }}
                >
                    <Icon style={{ width: 13, height: 13 }} />
                    {label}
                </button>
            ))}
        </div>
    );
}
