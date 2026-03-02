"use client";

import { useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ConfirmDialogProps {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    /** Icon element rendered in the header badge */
    icon?: React.ReactNode;
    iconColor?: string;
    title: string;
    subtitle?: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    /** 'danger' = red confirm button (default), 'primary' = indigo */
    variant?: "danger" | "primary";
}

export function ConfirmDialog({
    open, onCancel, onConfirm,
    icon, iconColor = "#ef4444",
    title, subtitle, description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "danger",
}: ConfirmDialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    if (!open) return null;

    const confirmBg =
        variant === "danger"
            ? "linear-gradient(135deg, #ef4444, #dc2626)"
            : "linear-gradient(135deg, #6366f1, #8b5cf6)";
    const confirmShadow =
        variant === "danger"
            ? "0 4px 20px rgba(239,68,68,0.4)"
            : "0 4px 20px rgba(99,102,241,0.4)";

    return (
        <>
            <style>{`
                @keyframes overlay-fade-in { from{opacity:0} to{opacity:1} }
                @keyframes dialog-scale-in {
                    from { opacity:0; transform: scale(0.94) translateY(10px); }
                    to   { opacity:1; transform: scale(1) translateY(0); }
                }
            `}</style>
            <div
                ref={overlayRef}
                onClick={(e) => { if (e.target === overlayRef.current) onCancel(); }}
                style={{
                    position: "fixed", inset: 0, zIndex: 10000,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
                    background: "rgba(0,0,0,0.7)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    animation: "overlay-fade-in 0.2s ease",
                }}
            >
                {/* Card */}
                <div style={{
                    position: "relative",
                    width: "100%", maxWidth: 400,
                    borderRadius: 20,
                    overflow: "hidden",
                    animation: "dialog-scale-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                }}>
                    {/* Deep glass base */}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(145deg, rgba(20,14,40,0.97) 0%, rgba(12,8,28,0.97) 100%)",
                        backdropFilter: "blur(40px) saturate(160%)",
                        WebkitBackdropFilter: "blur(40px) saturate(160%)",
                    }} />
                    {/* Iridescent border */}
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: 20, padding: 1, zIndex: 0,
                        background: `linear-gradient(135deg, ${iconColor}55 0%, rgba(139,92,246,0.3) 50%, ${iconColor}33 100%)`,
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                    }} />
                    {/* Subtle glow matching icon color */}
                    <div style={{
                        position: "absolute", width: 200, height: 200,
                        borderRadius: "50%", top: -80, right: -40,
                        background: `radial-gradient(circle, ${iconColor}22 0%, transparent 70%)`,
                        filter: "blur(30px)", pointerEvents: "none",
                    }} />

                    {/* Content */}
                    <div style={{ position: "relative", zIndex: 2, padding: "1.75rem" }}>
                        {/* Header */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                {icon && (
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                                        background: `${iconColor}18`,
                                        border: `1px solid ${iconColor}35`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: iconColor,
                                    }}>
                                        {icon}
                                    </div>
                                )}
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "rgba(255,255,255,0.95)", letterSpacing: "-0.01em" }}>
                                        {title}
                                    </div>
                                    {subtitle && (
                                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                                            {subtitle}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button onClick={onCancel} style={{
                                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                color: "rgba(255,255,255,0.4)",
                            }}>
                                <XMarkIcon style={{ width: 13, height: 13 }} />
                            </button>
                        </div>

                        {description && (
                            <div style={{
                                fontSize: "0.875rem", color: "rgba(255,255,255,0.55)",
                                marginBottom: "1.5rem", lineHeight: 1.55,
                                padding: "12px 14px",
                                background: "rgba(255,255,255,0.04)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 10,
                            }}>
                                {description}
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={onCancel} style={{
                                flex: 1, padding: "11px 16px", borderRadius: 10,
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: "rgba(255,255,255,0.7)",
                                cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                                fontFamily: "inherit", transition: "all 0.15s",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}
                            >
                                {cancelLabel}
                            </button>
                            <button onClick={onConfirm} style={{
                                flex: 1, padding: "11px 16px", borderRadius: 10,
                                background: confirmBg,
                                border: "none",
                                color: "#fff",
                                cursor: "pointer", fontWeight: 700, fontSize: "0.875rem",
                                fontFamily: "inherit",
                                boxShadow: confirmShadow,
                                transition: "all 0.15s",
                                position: "relative", overflow: "hidden",
                            }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
