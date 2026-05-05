"use client";
import React, { useState } from "react";
import { Form, Input, Radio, ConfigProvider, Space } from "antd";
import { useSubmitForm } from "@/lib/api/queries";
import type { BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext, CommonButton, getCardStyles } from "./shared";
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
    const { focusSubItem, selectBlock } = useEditorStore();
    const p = block.props;
    const layout = (p.layout as string) || "centered";

    const [form] = Form.useForm();
    const submitMutation = useSubmitForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error"; visible: boolean }>({
        message: "", type: "success", visible: false,
    });

    // ── Props (all customisable) ────────────────────────────────────────────────
    const mode = (p.mode as "email" | "api") || "email";
    const apiUrl = (p.apiUrl as string) || "";
    const receiverEmail = (p.receiverEmail as string) || "ansh.official03@gmail.com";
    const showLastName = p.showLastName !== false; // default true
    const showGender = p.showGender === true; // default false
    const showLabels = p.showLabels !== false; // default true
    const firstNameLabel = (p.firstNameLabel as string) || "First Name";
    const lastNameLabel = (p.lastNameLabel as string) || "Last Name";
    const genderLabel = (p.genderLabel as string) || "Gender";
    const emailLabel = (p.emailLabel as string) || "Email";
    const messageLabel = (p.messageLabel as string) || "Message";
    // const submitLabel = (p.submitLabel as string) || "Send Message →";
    const successMessage = (p.successMessage as string) || "Thanks! We'll get back to you shortly.";
    const errorMessage = (p.errorMessage as string) || "Something went wrong. Please try again.";
    // const cardStyle = (p.cardStyle as string) || "raised";
    // const cardBg = (p.cardBg as string) || "#ffffff";
    // const cardPadding = (p.cardPadding as string) || "3rem 2rem";
    const cardRadius = (p.cardRadius as string) || "20px";
    const inputBg = (p.inputBg as string) || "#f8fafc";
    const inputBorderColor = (p.inputBorderColor as string) || "#e2e8f0";

    const theme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const defaultPrimary = theme.colors?.primary || "#6366f1";
    // const defaultText = theme.colors?.buttonText || "#ffffff";

    const inputFocusBorderColor = (p.inputFocusBorderColor as string) || defaultPrimary;
    const labelColor = (p.labelColor as string) || "#374151";
    const inputTextColor = (p.inputTextColor as string) || "#111827";
    // const buttonBg = (p.buttonBg as string) || defaultPrimary;
    // const buttonTextColor = (p.buttonTextColor as string) || defaultText;
    // const buttonBorderRadius = (p.buttonBorderRadius as string) || "10px";
    // const buttonFullWidth = p.buttonFullWidth !== false;  // default true
    const buttonAlign = (p.buttonAlign as string) || "right";
    const titleText = (p.titleText as string) || "";
    const subtitleText = (p.subtitleText as string) || "";
    const titleColor = (p.titleColor as string) || "#0f172a";
    const subtitleColor = (p.subtitleColor as string) || "#64748b";

    const inputHeight = (p.inputHeight as string) || "48px";
    const inputRadius = (p.inputRadius as string) || "10px";
    const inputPlaceholderColor = (p.inputPlaceholderColor as string) || "rgba(0,0,0,0.4)";

    const firstNameRequired = true;
    const lastNameRequired = p.lastNameRequired === true; // default false
    const emailRequired = true;
    const messageRequired = true;
    const genderRequired = p.genderRequired !== false; // default true

    const genderOptions = (p.genderOptions as string[]) || ["Woman", "Man", "Other", "I don't want to answer"];

    // Field names for API
    const firstNameKey = (p.firstNameApiKey as string) || "firstName";
    const lastNameKey = (p.lastNameApiKey as string) || "lastName";
    const emailKey = (p.emailApiKey as string) || "email";
    const genderKey = (p.genderApiKey as string) || "gender";
    const messageKey = (p.messageApiKey as string) || "message";

    // ── Toast helper ───────────────────────────────────────────────────────────
    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type, visible: true });
        setTimeout(() => setToast(t => ({ ...t, visible: false })), 4000);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const onFinish = async (values: Record<string, string>) => {
        setIsSubmitting(true);
        try {
            if (mode === "api") {
                if (!apiUrl) throw new Error("API URL is not configured");

                const payload: Record<string, string> = {
                    [firstNameKey]: values.firstName,
                    [emailKey]: values.email,
                    [messageKey]: values.message,
                };
                if (showLastName) payload[lastNameKey] = values.lastName;
                if (showGender) payload[genderKey] = values.gender;

                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || `API error: ${response.status}`);
                }
            } else {
                // Default email submission
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

                await submitMutation.mutateAsync(payload);
            }

            showToast(successMessage, "success");
            form.resetFields();
        } catch (error: Error | unknown) {
            const serverMsg = error instanceof Error ? error.message : errorMessage;
            showToast(serverMsg, "error");
        } finally {
            setIsSubmitting(false);
        }
    };


    // ─── Input style ───────────────────────────────────────────────────────────
    // const fieldWrapStyle: React.CSSProperties = {
    //     display: "flex",
    //     flexDirection: "column",
    // };

    // ── Wrapper click in editor ─────────────────────────────────────────────────
    // const handleWrapperClick = (e: React.MouseEvent) => {
    //     if (!isPreview) {
    //         e.stopPropagation();
    //         updateBlock(block.id, {});
    //         const store = useEditorStore.getState();
    //         store.selectBlock(block.id);
    //     }
    // };

    const isSelected = !isPreview && useEditorStore.getState().selectedBlockId === block.id;

    // ── UI Components ────────────────────────────────────────────────────────
    const formNode = (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: inputFocusBorderColor,
                    borderRadius: parseInt(inputRadius),
                    colorBgContainer: inputBg,
                    colorBorder: inputBorderColor,
                    colorText: inputTextColor,
                    colorTextPlaceholder: inputPlaceholderColor,
                    colorBgContainerDisabled: inputBg,
                    colorTextDisabled: inputTextColor,
                },
                components: {
                    Form: {
                        labelColor: labelColor,
                        labelFontSize: 13,
                        fontWeightStrong: 600,
                        itemMarginBottom: 16,
                    },
                    Input: {
                        controlHeight: parseInt(inputHeight),
                    },
                }
            }}
        >
            <div
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        e.stopPropagation();
                        selectBlock(block.id);
                        focusSubItem(block.id, "Card Style");
                    }
                }}
                style={{
                    ...getCardStyles({ props: p, isFocused: isSelected }),
                    boxSizing: "border-box",
                    width: "100%",
                }}
            >
                <div onClick={(e) => { e.stopPropagation(); selectBlock(block.id); focusSubItem(block.id, "Inside Text (Optional)"); }}>
                    {titleText && (
                        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.8rem", fontWeight: 800, color: titleColor, textTransform: p.titleUppercase ? "uppercase" : "none" }}>{titleText}</h2>
                    )}
                    {subtitleText && (
                        <p style={{ margin: "0 0 1.75rem", fontSize: "0.95rem", color: subtitleColor, lineHeight: 1.6 }}>{subtitleText}</p>
                    )}
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                    disabled={isSubmitting}
                >
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            selectBlock(block.id);
                            focusSubItem(block.id, "Input Style");
                        }}
                        style={{
                            display: "grid",
                            gridTemplateColumns: showLastName ? "1fr 1fr" : "1fr",
                            gap: "1rem",
                        }}
                    >
                        <Form.Item
                            name="firstName"
                            label={showLabels ? <span>{firstNameLabel}{firstNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</span> : null}
                            rules={[{ required: firstNameRequired, message: `${firstNameLabel} is required` }]}
                        >
                            <Input placeholder={firstNameLabel} />
                        </Form.Item>

                        {showLastName && (
                            <Form.Item
                                name="lastName"
                                label={showLabels ? <span>{lastNameLabel}{lastNameRequired && <span style={{ color: "#ef4444" }}> *</span>}</span> : null}
                                rules={[{ required: lastNameRequired, message: `${lastNameLabel} is required` }]}
                            >
                                <Input placeholder={lastNameLabel} />
                            </Form.Item>
                        )}
                    </div>

                    <div onClick={(e) => {
                        e.stopPropagation();
                        selectBlock(block.id);
                        focusSubItem(block.id, "Input Style");
                    }}>
                        <Form.Item
                            name="email"
                            label={showLabels ? <span>{emailLabel}{emailRequired && <span style={{ color: "#ef4444" }}> *</span>}</span> : null}
                            rules={[
                                { required: emailRequired, message: `${emailLabel} is required` },
                                { type: 'email', message: 'Invalid email address' }
                            ]}
                        >
                            <Input placeholder="you@example.com" />
                        </Form.Item>
                    </div>

                    {showGender && (
                        <div onClick={(e) => {
                            e.stopPropagation();
                            selectBlock(block.id);
                            focusSubItem(block.id, "Input Style");
                        }}>
                            <Form.Item
                                name="gender"
                                label={showLabels ? <span>{genderLabel}{genderRequired && <span style={{ color: "#ef4444" }}> *</span>}</span> : null}
                                rules={[{ required: genderRequired, message: `${genderLabel} is required` }]}
                            >
                                <Radio.Group>
                                    <Space direction="horizontal" wrap size={[16, 8]}>
                                        {genderOptions.map(option => (
                                            <Radio key={option} value={option}>
                                                <span style={{ color: inputTextColor }}>{option}</span>
                                            </Radio>
                                        ))}
                                    </Space>
                                </Radio.Group>
                            </Form.Item>
                        </div>
                    )}

                    <div onClick={(e) => {
                        e.stopPropagation();
                        selectBlock(block.id);
                        focusSubItem(block.id, "Input Style");
                    }}>
                        <Form.Item
                            name="message"
                            label={showLabels ? <span>{messageLabel}{messageRequired && <span style={{ color: "#ef4444" }}> *</span>}</span> : null}
                            rules={[{ required: messageRequired, message: `${messageLabel} is required` }]}
                        >
                            <Input.TextArea rows={5} placeholder="Write your message here..." style={{ resize: 'vertical' }} />
                        </Form.Item>
                    </div>

                    <div onClick={(e) => {
                        e.stopPropagation();
                        selectBlock(block.id);
                        focusSubItem(block.id, "Button Content");
                    }} style={{ display: "flex", justifyContent: buttonAlign === "left" ? "flex-start" : buttonAlign === "center" ? "center" : "flex-end" }}>
                        <CommonButton
                            type="submit"
                            props={p}
                            isLoading={isSubmitting}
                            blockId={block.id}
                        // disabled={!isPreview}
                        />
                    </div>
                </Form>
            </div>
        </ConfigProvider>
    );

    const sectionBg = (p.sectionBg as string) || "transparent";
    const sectionPadding = (p.sectionPadding as string) || "4rem 1rem";

    const wrapLayout = () => {
        switch (layout) {
            case "full":
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: sectionBg, padding: sectionPadding, width: "100%", boxSizing: "border-box" }}>
                        {formNode}
                    </section>
                );
            case "card":
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: sectionBg, padding: sectionPadding, display: "flex", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
                        <div style={{ width: "100%", maxWidth: 580, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", borderRadius: cardRadius }}>
                            {formNode}
                        </div>
                    </section>
                );
            default: // centered
                return (
                    <section id={(p.sectionId as string) || `block-${block.id}`} style={{ background: sectionBg, padding: sectionPadding, display: "flex", justifyContent: "center", width: "100%", boxSizing: "border-box" }}>
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
            <style>{`
                @keyframes cfb-spin { to { transform: rotate(360deg); } }
                #block-${block.id} input::placeholder, 
                #block-${block.id} textarea::placeholder { 
                    color: ${inputPlaceholderColor}; 
                    opacity: 1;
                }
                #block-${block.id} .ant-form-item-explain-error {
                    text-align: left !important;
                }
            `}</style>
        </>
    );
}
