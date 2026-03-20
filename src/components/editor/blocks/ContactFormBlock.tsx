"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";
import type { BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

// ─── Toast Component ──────────────────────────────────────────────────────────

interface ToastProps {
    message: string;
    type: "success" | "error";
    visible: boolean;
}

function Toast({ message, type, visible }: ToastProps) {
    return (
        <div
            style={{
                position: "fixed",
                bottom: "2rem",
                right: "2rem",
                zIndex: 9999,
                transform: visible ? "translateY(0)" : "translateY(120%)",
                opacity: visible ? 1 : 0,
                transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1.25rem",
                borderRadius: "14px",
                background: type === "success"
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "0.9rem",
                fontWeight: 600,
                boxShadow: `0 8px 32px ${type === "success" ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
                minWidth: 260,
                pointerEvents: "none",
            }}
        >
            <span style={{ fontSize: "1.2rem" }}>{type === "success" ? "✓" : "✕"}</span>
            {message}
        </div>
    );
}

// ─── ContactFormBlock ─────────────────────────────────────────────────────────

export function ContactFormBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const { updateBlock } = useEditorStore();
    const p = block.props;
    const layout = (p.layout as string) || "centered";
    const isDark = useEditorStore((s) => (s.page?.theme?.mode || "light") === "dark");

    // Form values
    const [values, setValues] = useState({ firstName: "", lastName: "", email: "", message: "", gender: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "", type: "success", visible: false,
    });

    // ── Props (all customisable) ────────────────────────────────────────────────
    const receiverEmail = (p.receiverEmail as string) || "ansh.official03@gmail.com";
    const showLastName = p.showLastName !== false; // default true
    const showGender = p.showGender === true; // default false
    const showLabels = p.showLabels !== false; // default true
    const firstNameLabel = (p.firstNameLabel as string) || "First Name";
    const lastNameLabel = (p.lastNameLabel as string) || "Last Name";
    const genderLabel = (p.genderLabel as string) || "Gender";
    const emailLabel = (p.emailLabel as string) || "Email";
    const messageLabel = (p.messageLabel as string) || "Message";
    const submitLabel = (p.submitLabel as string) || "Send Message →";
    const successMessage = (p.successMessage as string) || "Thanks! We'll get back to you shortly.";
    const errorMessage = (p.errorMessage as string) || "Something went wrong. Please try again.";
    const bgColor = (p.bgColor as string) || "#ffffff";
    const padding = (p.padding as string) || "3rem 2rem";
    const borderRadius = (p.borderRadius as string) || "20px";
    const inputBg = (p.inputBg as string) || "#f8fafc";
    const inputBorderColor = (p.inputBorderColor as string) || "#e2e8f0";
    
    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    const defaultText = theme.colors?.buttonText || "#ffffff";

    const inputFocusBorderColor = (p.inputFocusBorderColor as string) || defaultPrimary;
    const labelColor = (p.labelColor as string) || "#374151";
    const inputTextColor = (p.inputTextColor as string) || "#111827";
    const buttonBg = (p.buttonBg as string) || defaultPrimary;
    const buttonTextColor = (p.buttonTextColor as string) || defaultText;
    const buttonBorderRadius = (p.buttonBorderRadius as string) || "10px";
    const buttonFullWidth = p.buttonFullWidth !== false;  // default true
    const buttonAlign = (p.buttonAlign as string) || "right";
    const titleText = (p.titleText as string) || "";
    const subtitleText = (p.subtitleText as string) || "";
    const titleColor = (p.titleColor as string) || "#0f172a";
    const subtitleColor = (p.subtitleColor as string) || "#64748b";

    const firstNameRequired = p.firstNameRequired !== false; // default true
    const lastNameRequired = p.lastNameRequired === true; // default false
    const emailRequired = p.emailRequired !== false; // default true
    const messageRequired = p.messageRequired !== false; // default true
    const genderRequired = p.genderRequired !== false; // default true

    const genderOptions = (p.genderOptions as string[]) || ["woman", "man", "other", "i don't want to answer"];


    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (firstNameRequired && !values.firstName.trim()) errs.firstName = `${firstNameLabel} is required`;
        if (showLastName && lastNameRequired && !values.lastName.trim()) errs.lastName = `${lastNameLabel} is required`;
        if (emailRequired && !values.email.trim()) errs.email = `${emailLabel} is required`;
        else if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = "Invalid email address";
        if (showGender && genderRequired && !values.gender) errs.gender = `${genderLabel} is required`;
        if (messageRequired && !values.message.trim()) errs.message = `${messageLabel} is required`;
        return errs;
    }, [values, showLastName, showGender, firstNameLabel, lastNameLabel, genderLabel, emailLabel, messageLabel, firstNameRequired, lastNameRequired, emailRequired, messageRequired, genderRequired]);

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 4000);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setErrors({});
        setSubmitting(true);
        try {
            const payload = {
                receiverEmail,
                subject: "New Contact Form Submission",
                fields: {
                    [firstNameLabel]: values.firstName,
                } as Record<string, string>
            };
            if (showLastName) payload.fields[lastNameLabel] = values.lastName;
            if (showGender) payload.fields[genderLabel] = values.gender;
            payload.fields[emailLabel] = values.email;
            payload.fields[messageLabel] = values.message;

            const endpoint = "/api/forms/submit";
            await axios.post(endpoint, payload);
            showToast(successMessage, "success");
            setValues({ firstName: "", lastName: "", email: "", message: "", gender: "" });
        } catch (error: any) {
            const serverMsg = error?.response?.data?.message || errorMessage;
            showToast(serverMsg, "error");
        } finally {
            setSubmitting(false);
        }
    }, [values, validate, receiverEmail, firstNameLabel, lastNameLabel, genderLabel, emailLabel, messageLabel, showLastName, showGender, successMessage, errorMessage]);

    // ─── Input style ───────────────────────────────────────────────────────────
    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "0.75rem 1rem",
        background: inputBg,
        border: `1.5px solid ${inputBorderColor}`,
        borderRadius: "10px",
        fontSize: "0.9rem",
        color: inputTextColor,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s, box-shadow 0.2s",
        fontFamily: "inherit",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "0.82rem",
        fontWeight: 600,
        color: labelColor,
        marginBottom: "0.4rem",
        letterSpacing: "0.01em",
        textAlign: "left",
    };

    const errorStyle: React.CSSProperties = {
        color: "#ef4444",
        fontSize: "0.75rem",
        marginTop: "0.25rem",
        fontWeight: 500,
        textAlign: "left",
    };

    const fieldWrapStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
    };

    // ── Wrapper click in editor ─────────────────────────────────────────────────
    const handleWrapperClick = (e: React.MouseEvent) => {
        if (!isPreview) {
            e.stopPropagation();
            updateBlock(block.id, {});

            // Also explicitly select it using the store
            const store = useEditorStore.getState();
            store.selectBlock(block.id);
        }
    };

    // ── Layout wrapper logic ──────────────────────────────────────────────────
    const outerBg = (p.outerBg as string) || "transparent";
    const outerPadding = (p.outerPadding as string) || "5rem 2rem";

    const formNode = (
        <div
            onClick={handleWrapperClick}
            style={{
                background: bgColor,
                padding,
                borderRadius,
                boxSizing: "border-box",
                width: "100%",
            }}
        >
            {titleText && (
                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.8rem", fontWeight: 800, color: titleColor }}>{titleText}</h2>
            )}
            {subtitleText && (
                <p style={{ margin: "0 0 1.75rem", fontSize: "0.95rem", color: subtitleColor, lineHeight: 1.6 }}>{subtitleText}</p>
            )}
            <form
                onSubmit={isPreview ? handleSubmit : e => { e.preventDefault(); e.stopPropagation(); }}
                onClick={handleWrapperClick}
                noValidate
            >
                    {/* Name row */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: showLastName ? "1fr 1fr" : "1fr",
                        gap: "1rem",
                        marginBottom: "1rem",
                    }}>
                        {/* First Name */}
                        <div style={fieldWrapStyle}>
                            {showLabels && <label style={labelStyle}>{firstNameLabel}{firstNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>}
                            <input
                                type="text"
                                value={values.firstName}
                                onChange={e => { setValues(v => ({ ...v, firstName: e.target.value })); setErrors(er => ({ ...er, firstName: "" })); }}
                                placeholder={firstNameLabel}
                                style={{ ...inputStyle, borderColor: errors.firstName ? "#ef4444" : inputBorderColor }}
                                onFocus={e => { e.target.style.borderColor = inputFocusBorderColor; e.target.style.boxShadow = `0 0 0 3px ${inputFocusBorderColor}22`; }}
                                onBlur={e => { e.target.style.borderColor = errors.firstName ? "#ef4444" : inputBorderColor; e.target.style.boxShadow = "none"; }}
                            />
                            {errors.firstName && <span style={errorStyle}>{errors.firstName}</span>}
                        </div>

                        {/* Last Name (optional) */}
                        {showLastName && (
                            <div style={fieldWrapStyle}>
                                {showLabels && <label style={labelStyle}>{lastNameLabel}{lastNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>}
                                <input
                                    type="text"
                                    value={values.lastName}
                                    onChange={e => { setValues(v => ({ ...v, lastName: e.target.value })); setErrors(er => ({ ...er, lastName: "" })); }}
                                    placeholder={lastNameLabel}
                                    style={{ ...inputStyle, borderColor: errors.lastName ? "#ef4444" : inputBorderColor }}
                                    onFocus={e => { e.target.style.borderColor = inputFocusBorderColor; e.target.style.boxShadow = `0 0 0 3px ${inputFocusBorderColor}22`; }}
                                    onBlur={e => { e.target.style.borderColor = errors.lastName ? "#ef4444" : inputBorderColor; e.target.style.boxShadow = "none"; }}
                                />
                                {errors.lastName && <span style={errorStyle}>{errors.lastName}</span>}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div style={{ ...fieldWrapStyle, marginBottom: "1rem" }}>
                        {showLabels && <label style={labelStyle}>{emailLabel}{emailRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>}
                        <input
                            type="email"
                            value={values.email}
                            onChange={e => { setValues(v => ({ ...v, email: e.target.value })); setErrors(er => ({ ...er, email: "" })); }}
                            placeholder="you@example.com"
                            style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : inputBorderColor }}
                            onFocus={e => { e.target.style.borderColor = inputFocusBorderColor; e.target.style.boxShadow = `0 0 0 3px ${inputFocusBorderColor}22`; }}
                            onBlur={e => { e.target.style.borderColor = errors.email ? "#ef4444" : inputBorderColor; e.target.style.boxShadow = "none"; }}
                        />
                        {errors.email && <span style={errorStyle}>{errors.email}</span>}
                    </div>

                    {/* Gender (optional but can be required) */}
                    {showGender && (
                        <div style={{ ...fieldWrapStyle, marginBottom: "1.5rem" }}>
                            {showLabels && <label style={labelStyle}>{genderLabel}{genderRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.25rem" }}>
                                {genderOptions.map(option => (
                                    <label key={option} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.85rem", color: inputTextColor }}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={option}
                                            checked={values.gender === option}
                                            onChange={() => { setValues(v => ({ ...v, gender: option })); setErrors(er => ({ ...er, gender: "" })); }}
                                            style={{ cursor: "pointer", accentColor: inputFocusBorderColor }}
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                            {errors.gender && <span style={errorStyle}>{errors.gender}</span>}
                        </div>
                    )}

                    {/* Message textarea */}
                    <div style={{ ...fieldWrapStyle, marginBottom: "1.5rem" }}>
                        {showLabels && <label style={labelStyle}>{messageLabel}{messageRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>}
                        <textarea
                            value={values.message}
                            onChange={e => { setValues(v => ({ ...v, message: e.target.value })); setErrors(er => ({ ...er, message: "" })); }}
                            placeholder="Write your message here..."
                            rows={5}
                            style={{
                                ...inputStyle,
                                resize: "vertical",
                                minHeight: "120px",
                                borderColor: errors.message ? "#ef4444" : inputBorderColor,
                            }}
                            onFocus={e => { e.target.style.borderColor = inputFocusBorderColor; e.target.style.boxShadow = `0 0 0 3px ${inputFocusBorderColor}22`; }}
                            onBlur={e => { e.target.style.borderColor = errors.message ? "#ef4444" : inputBorderColor; e.target.style.boxShadow = "none"; }}
                        />
                        {errors.message && <span style={errorStyle}>{errors.message}</span>}
                    </div>

                    {/* Submit button */}
                    <div style={{ display: "flex", justifyContent: buttonAlign === "left" ? "flex-start" : buttonAlign === "center" ? "center" : "flex-end" }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: buttonFullWidth ? "100%" : "auto",
                                padding: "0.85rem 2rem",
                                background: submitting ? `${buttonBg}99` : buttonBg,
                                color: buttonTextColor,
                                border: "none",
                                borderRadius: buttonBorderRadius,
                                fontSize: "0.95rem",
                                fontWeight: 700,
                                cursor: submitting ? "not-allowed" : "pointer",
                                transition: "all 0.25s ease",
                                letterSpacing: "0.02em",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem",
                                fontFamily: "inherit",
                                boxShadow: `0 4px 20px ${buttonBg}55`,
                            }}
                            onMouseEnter={e => {
                                if (!submitting) {
                                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 28px ${buttonBg}77`;
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.transform = "none";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 20px ${buttonBg}55`;
                            }}
                        >
                            {submitting ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16,
                                        border: `2px solid ${buttonTextColor}44`,
                                        borderTopColor: buttonTextColor,
                                        borderRadius: "50%",
                                        animation: "cfb-spin 0.7s linear infinite",
                                        display: "inline-block",
                                    }} />
                                    Sending…
                                </>
                            ) : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
    );

    // ── Contact info panel for split layout ──────────────────────────────────
    const infoPanel = (
        <div style={{ flex: "0 0 300px", display: "flex", flexDirection: "column", gap: "1.5rem", padding: "2rem", background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", borderRadius, border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}` }}>
            <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: (p.titleColor as string) || "#0f172a" }}>Get in Touch</h3>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.65, lineHeight: 1.7 }}>We'd love to hear from you. Fill out the form and we'll respond as soon as possible.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[{ icon: "📧", text: (p.receiverEmail as string) || "hello@company.com" }, { icon: "📍", text: (p.infoAddress as string) || "123 Main Street, City" }, { icon: "📞", text: (p.infoPhone as string) || "+1 (555) 000-0000" }].map(({ icon, text }, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.88rem" }}>
                        <span style={{ fontSize: "1.1rem" }}>{icon}</span>
                        <span style={{ opacity: 0.7 }}>{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );


    const wrapLayout = () => {
        switch (layout) {
            case "split":
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: outerBg, padding: outerPadding, width: "100%", boxSizing: "border-box" }}>
                        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "3rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                            {infoPanel}
                            <div style={{ flex: 1, minWidth: 300 }}>{formNode}</div>
                        </div>
                    </section>
                );
            case "full":
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: outerBg, padding: outerPadding, width: "100%", boxSizing: "border-box" }}>
                        {formNode}
                    </section>
                );
            case "card":
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: outerBg, padding: outerPadding, display: "flex", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                        <div style={{ width: "100%", maxWidth: 580, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", borderRadius }}>
                            {formNode}
                        </div>
                    </section>
                );
            default: // centered
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: outerBg, padding: outerPadding, display: "flex", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                        <div style={{ width: "100%", maxWidth: 680 }}>
                            {formNode}
                        </div>
                    </section>
                );
        }
    };

    return (
        <>
            <Toast message={toast.message} type={toast.type} visible={toast.visible} />
            {wrapLayout()}
            <style>{`@keyframes cfb-spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
