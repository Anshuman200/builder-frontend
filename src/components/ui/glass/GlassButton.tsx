"use client";

import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

type ButtonVariant = "primary" | "ghost" | "danger" | "danger-ghost";

interface GlassButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    variant?: ButtonVariant;
    disabled?: boolean;
    loading?: boolean;
    loadingLabel?: string;
    fullWidth?: boolean;
    size?: "sm" | "md";
    style?: React.CSSProperties;
}

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
        color: "#fff",
        border: "none",
        boxShadow: "0 4px 20px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3)",
    },
    ghost: {
        background: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(255,255,255,0.14)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    },
    danger: {
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        color: "#fff",
        border: "none",
        boxShadow: "0 4px 20px rgba(239,68,68,0.4), 0 2px 8px rgba(0,0,0,0.3)",
    },
    "danger-ghost": {
        background: "rgba(239,68,68,0.08)",
        color: "#fca5a5",
        border: "1px solid rgba(239,68,68,0.25)",
        boxShadow: "none",
    },
};

export function GlassButton({
    children, onClick, type = "button", variant = "primary",
    disabled, loading, loadingLabel, fullWidth, size = "md", style,
}: GlassButtonProps) {
    const [hovered, setHovered] = useState(false);
    const variantStyles = VARIANT_STYLES[variant];
    const isDisabled = disabled || loading;

    const hoveredShadow: Record<ButtonVariant, string> = {
        primary: "0 6px 28px rgba(99,102,241,0.6), 0 2px 8px rgba(0,0,0,0.3)",
        ghost: "0 2px 12px rgba(255,255,255,0.08)",
        danger: "0 6px 28px rgba(239,68,68,0.6), 0 2px 8px rgba(0,0,0,0.3)",
        "danger-ghost": "0 2px 8px rgba(239,68,68,0.15)",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: size === "sm" ? "8px 16px" : "13px 20px",
                borderRadius: size === "sm" ? 8 : 12,
                cursor: isDisabled ? "wait" : "pointer",
                fontWeight: 700,
                fontSize: size === "sm" ? "0.82rem" : "0.9rem",
                fontFamily: "inherit",
                letterSpacing: "0.02em",
                width: fullWidth ? "100%" : undefined,
                opacity: isDisabled ? 0.75 : 1,
                transition: "all 0.2s ease",
                transform: hovered && !isDisabled ? "translateY(-1px)" : "translateY(0)",
                position: "relative", overflow: "hidden",
                ...variantStyles,
                boxShadow: hovered && !isDisabled ? hoveredShadow[variant] : variantStyles.boxShadow,
                ...style,
            }}
        >
            {/* Shimmer sweep for primary/danger */}
            {(variant === "primary" || variant === "danger") && (
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                    animation: "shimmer-btn 2.5s infinite",
                    pointerEvents: "none",
                }} />
            )}
            {loading
                ? <><ArrowPathIcon style={{ width: 15, height: 15, animation: "spin 1s linear infinite" }} />{loadingLabel ?? "Loading…"}</>
                : children}
        </button>
    );
}
