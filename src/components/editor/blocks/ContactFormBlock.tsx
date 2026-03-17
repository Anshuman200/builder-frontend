"use client";
import React, { useState, useCallback } from "react";
import axios from "axios";
import type { BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext } from "./shared";

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

    // Form values
    const [values, setValues] = useState({ firstName: "", lastName: "", email: "", message: "" });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "", type: "success", visible: false,
    });

    // ── Props (all customisable) ────────────────────────────────────────────────
    const receiverEmail = (p.receiverEmail as string) || "ansh.official03@gmail.com";
    const showLastName = p.showLastName !== false; // default true
    const firstNameLabel = (p.firstNameLabel as string) || "First Name";
    const lastNameLabel = (p.lastNameLabel as string) || "Last Name";
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
    const inputFocusBorderColor = (p.inputFocusBorderColor as string) || "var(--primary)";
    const labelColor = (p.labelColor as string) || "#374151";
    const inputTextColor = (p.inputTextColor as string) || "#111827";
    const buttonBg = (p.buttonBg as string) || "var(--primary)";
    const buttonTextColor = (p.buttonTextColor as string) || "var(--button-text)";
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

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = useCallback(() => {
        const errs: Record<string, string> = {};
        if (firstNameRequired && !values.firstName.trim()) errs.firstName = `${firstNameLabel} is required`;
        if (showLastName && lastNameRequired && !values.lastName.trim()) errs.lastName = `${lastNameLabel} is required`;
        if (emailRequired && !values.email.trim()) errs.email = `${emailLabel} is required`;
        else if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = "Invalid email address";
        if (messageRequired && !values.message.trim()) errs.message = `${messageLabel} is required`;
        return errs;
    }, [values, showLastName, firstNameLabel, lastNameLabel, emailLabel, messageLabel, firstNameRequired, lastNameRequired, emailRequired, messageRequired]);

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
                    [emailLabel]: values.email,
                    [messageLabel]: values.message,
                } as Record<string, string>
            };
            if (showLastName) payload.fields[lastNameLabel] = values.lastName;

            const endpoint = "/api/forms/submit";
            await axios.post(endpoint, payload);
            showToast(successMessage, "success");
            setValues({ firstName: "", lastName: "", email: "", message: "" });
        } catch (error: any) {
            const serverMsg = error?.response?.data?.message || errorMessage;
            showToast(serverMsg, "error");
        } finally {
            setSubmitting(false);
        }
    }, [values, validate, receiverEmail, firstNameLabel, lastNameLabel, emailLabel, messageLabel, showLastName, successMessage, errorMessage]);

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
    };

    const errorStyle: React.CSSProperties = {
        color: "#ef4444",
        fontSize: "0.75rem",
        marginTop: "0.25rem",
        fontWeight: 500,
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

    return (
        <>
            {/* Toast */}
            <Toast message={toast.message} type={toast.type} visible={toast.visible} />

            {/* Form wrapper */}
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
                {/* Optional title/subtitle */}
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
                            <label style={labelStyle}>{firstNameLabel}{firstNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>
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
                                <label style={labelStyle}>{lastNameLabel}{lastNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>
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
                        <label style={labelStyle}>{emailLabel}{emailRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>
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

                    {/* Message textarea */}
                    <div style={{ ...fieldWrapStyle, marginBottom: "1.5rem" }}>
                        <label style={labelStyle}>{messageLabel}{messageRequired && <span style={{ color: "#ef4444" }}> *</span>}</label>
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

            {/* Spinner keyframe */}
            <style>{`@keyframes cfb-spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
}
