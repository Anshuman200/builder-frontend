"use client";

import { useState } from "react";

interface GlassInputProps {
    id?: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
    autoComplete?: string;
    icon?: React.ReactNode;
    /** Rendered absolutely on the right side (e.g. show/hide password button) */
    suffix?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function GlassInput({
    id, type = "text", value, onChange, onBlur, placeholder, maxLength,
    required, autoComplete, icon, suffix, style,
}: GlassInputProps) {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{
            position: "relative",
            background: focused ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${focused ? "rgba(139,92,246,0.6)" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 12,
            transition: "all 0.2s ease",
            boxShadow: focused
                ? "0 0 0 3px rgba(139,92,246,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
                : "inset 0 1px 0 rgba(255,255,255,0.08)",
            ...style,
        }}>
            {icon && (
                <div style={{
                    position: "absolute", left: 12, top: "50%",
                    transform: "translateY(-50%)",
                    color: focused ? "rgba(139,92,246,0.9)" : "rgba(255,255,255,0.35)",
                    transition: "color 0.2s",
                    display: "flex", pointerEvents: "none",
                }}>
                    {icon}
                </div>
            )}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                maxLength={maxLength}
                required={required}
                autoComplete={autoComplete}
                onFocus={() => setFocused(true)}
                onBlur={() => { setFocused(false); if (onBlur) onBlur(); }}
                style={{
                    width: "100%", background: "transparent", border: "none", outline: "none",
                    color: "rgba(255,255,255,0.95)",
                    padding: `12px ${suffix ? "42px" : "14px"} 12px ${icon ? "40px" : "14px"}`,
                    fontSize: "0.9rem", fontFamily: "inherit",
                    caretColor: "#a78bfa",
                }}
            />
            {suffix && (
                <div style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    display: "flex", alignItems: "center",
                }}>
                    {suffix}
                </div>
            )}
        </div>
    );
}
