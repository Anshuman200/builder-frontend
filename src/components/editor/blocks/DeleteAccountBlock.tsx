"use client";
import React, { useState, useMemo } from "react";
import { Form, Input, Select, Button, message, ConfigProvider, theme } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import type { BlockProps } from "./shared";
import { useEditorStore } from "@/stores/editorStore";
import { PreviewContext } from "./shared";
import { DEFAULT_THEME } from "@/lib/utils/theme";

const { Option } = Select;

export function DeleteAccountBlock({ block }: BlockProps) {
    const isPreview = React.useContext(PreviewContext);
    const { updateBlock, selectBlock } = useEditorStore();
    const p = block.props;
    
    const pageTheme = useEditorStore((s) => s.page?.theme) || DEFAULT_THEME;
    const isDark = pageTheme.mode === "dark";
    
    const [form] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    // ── Props ────────────────────────────────────────────────────────────────
    const apiUrl = (p.apiUrl as string) || "";
    const showFirstName = p.showFirstName === true;
    const showLastName = p.showLastName === true;
    const firstNameRequired = p.firstNameRequired === true;
    const lastNameRequired = p.lastNameRequired === true;
    const emailRequired = p.emailRequired !== false;
    const reasonRequired = p.reasonRequired === true;
    
    // Reason options from line-by-line list
    const reasonOptionsRaw = (p.reasonOptions as string) || "";
    const reasonOptions = useMemo(() => {
        return reasonOptionsRaw
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);
    }, [reasonOptionsRaw]);

    const titleText = (p.titleText as string) || "Delete Your Account";
    const subtitleText = (p.subtitleText as string) || "We're sorry to see you go. Please let us know why you're leaving so we can improve.";
    const titleColor = (p.titleColor as string) || "var(--text)";
    const subtitleColor = (p.subtitleColor as string) || "var(--text-muted)";

    const logoUrl = (p.logoUrl as string) || "";
    const logoHeight = (p.logoHeight as string) || "48px";
    const logoWidth = (p.logoWidth as string) || "auto";
    const logoRadius = (p.logoRadius as string) || "0px";
    const logoShadow = (p.logoShadow as string) || "none";

    const submitLabel = (p.submitLabel as string) || "Delete Account";
    const buttonBg = (p.buttonBg as string) || "#ef4444";
    const buttonTextColor = (p.buttonTextColor as string) || "#ffffff";
    const buttonBorderRadius = (p.buttonBorderRadius as string) || "10px";

    const bgColor = (p.bgColor as string) || "var(--surface)";
    const textColor = (p.textColor as string) || "var(--text)";
    
    // Input Styles
    const inputBg = (p.inputBg as string) || (isDark ? "#1f1f1f" : "#f8fafc");
    const inputTextColor = (p.inputTextColor as string) || (isDark ? "#ffffff" : "#111827");
    const inputBorderColor = (p.inputBorderColor as string) || (isDark ? "#303030" : "#e2e8f0");
    const labelColor = (p.labelColor as string) || (isDark ? "rgba(255,255,255,0.85)" : "#374151");

    const padding = (p.padding as string) || "3rem 2rem";
    const borderRadius = (p.borderRadius as string) || "20px";
    const boxShadow = (p.boxShadow as string) || "0 16px 48px rgba(0,0,0,0.15)";
    const bgImage = (p.bgImage as string) || "";

    const inputHeight = (p.inputHeight as string) || "50px";
    const inputRadius = (p.inputRadius as string) || "10px";
    const inputPlaceholderColor = (p.inputPlaceholderColor as string) || (isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.4)");

    const successMessageStr = (p.successMessage as string) || "Your account deletion request has been submitted.";
    const errorMessageStr = (p.errorMessage as string) || "Something went wrong. Please try again.";

    // ── Mutation ─────────────────────────────────────────────────────────────
    const mutation = useMutation({
        mutationFn: async (values: any) => {
            if (!apiUrl) {
                // If no API URL, just simulate for preview
                return new Promise((resolve) => setTimeout(resolve, 1500));
            }
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error("API request failed");
            return response.json();
        },
        onSuccess: () => {
            messageApi.success(successMessageStr);
            form.resetFields();
        },
        onError: (err: any) => {
            messageApi.error(err.message || errorMessageStr);
        },
    });

    const onFinish = (values: any) => {
        if (!isPreview) return;
        mutation.mutate(values);
    };

    // ── Styles ───────────────────────────────────────────────────────────────
    const containerStyle: React.CSSProperties = {
        background: bgImage ? `url(${bgImage}) center/cover no-repeat` : bgColor,
        padding,
        borderRadius,
        boxShadow,
        color: textColor,
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        position: "relative",
        overflow: "hidden",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
    };

    const handleWrapperClick = (e: React.MouseEvent) => {
        if (!isPreview) {
            e.stopPropagation();
            selectBlock(block.id);
        }
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
                token: {
                    colorPrimary: buttonBg,
                    borderRadius: parseInt(inputRadius) || 8,
                    controlHeight: parseInt(inputHeight) || 40,
                    colorBgContainer: inputBg,
                    colorText: inputTextColor,
                    colorBorder: inputBorderColor,
                    colorTextPlaceholder: inputPlaceholderColor,
                },
                components: {
                    Input: {
                        colorBgContainer: inputBg,
                        colorText: inputTextColor,
                        colorBorder: inputBorderColor,
                        controlHeight: parseInt(inputHeight) || 40,
                    },
                    Select: {
                        colorBgContainer: inputBg,
                        colorText: inputTextColor,
                        colorBorder: inputBorderColor,
                        colorBgElevated: isDark ? "#1f1f1f" : "#ffffff",
                        controlHeight: parseInt(inputHeight) || 40,
                    }
                }
            }}
        >
            {contextHolder}
            <section
                id={(p.sectionId as string) || `block-${block.id}`}
                style={{
                    width: "100%",
                    padding: (p.sectionPadding as string) || "4rem 1rem",
                    background: (p.sectionBg as string) || "transparent",
                    transition: "all 0.3s ease"
                }}
                onClick={handleWrapperClick}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={containerStyle}
                >
                    {/* Glassmorphism Overlay if bgImage exists */}
                    {bgImage && (
                        <div style={{
                            position: "absolute",
                            inset: 0,
                            background: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.8)",
                            backdropFilter: "blur(4px)",
                            zIndex: 0,
                        }} />
                    )}

                    <div style={{ position: "relative", zIndex: 1 }}>
                        {/* Logo */}
                        {logoUrl && (
                            <div style={{
                                display: "flex",
                                justifyContent: p.logoAlign === "left" ? "flex-start" : p.logoAlign === "right" ? "flex-end" : "center",
                                marginBottom: "1.5rem"
                            }}>
                                <img
                                    src={logoUrl}
                                    alt="Logo"
                                    style={{
                                        height: logoHeight,
                                        width: logoWidth,
                                        borderRadius: logoRadius,
                                        boxShadow: logoShadow,
                                        objectFit: "contain",
                                    }}
                                />
                            </div>
                        )}

                        {/* Heading */}
                        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                            <h2 style={{ fontSize: "2rem", fontWeight: 800, margin: "0 0 0.5rem", color: titleColor }}>
                                {titleText}
                            </h2>
                            <p style={{ fontSize: "1rem", color: subtitleColor, lineHeight: 1.6, maxWidth: "450px", margin: "0 auto" }}>
                                {subtitleText}
                            </p>
                        </div>

                        {/* Form */}
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            disabled={mutation.isPending}
                            onValuesChange={() => !isPreview && selectBlock(block.id)}
                        >
                            <div style={{ display: "grid", gridTemplateColumns: showFirstName && showLastName ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                                {showFirstName && (
                                    <Form.Item
                                        label={<span style={{ color: labelColor, fontWeight: 600 }}>First Name</span>}
                                        name="firstName"
                                        rules={[{ required: firstNameRequired, message: "Please enter your first name" }]}
                                    >
                                        <Input size="large" placeholder="John" />
                                    </Form.Item>
                                )}
                                {showLastName && (
                                    <Form.Item
                                        label={<span style={{ color: labelColor, fontWeight: 600 }}>Last Name</span>}
                                        name="lastName"
                                        rules={[{ required: lastNameRequired, message: "Please enter your last name" }]}
                                    >
                                        <Input size="large" placeholder="Doe" />
                                    </Form.Item>
                                )}
                            </div>

                            <Form.Item
                                label={<span style={{ color: labelColor, fontWeight: 600 }}>Email Address</span>}
                                name="email"
                                rules={[
                                    { required: true, message: "Please enter your email" },
                                    { type: "email", message: "Please enter a valid email" }
                                ]}
                            >
                                <Input size="large" placeholder="john@example.com" />
                            </Form.Item>

                            <Form.Item
                                label={<span style={{ color: labelColor, fontWeight: 600 }}>Password</span>}
                                name="password"
                                rules={[{ required: true, message: "Please enter your password" }]}
                            >
                                <Input.Password 
                                    size="large" 
                                    placeholder="••••••••"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                />
                            </Form.Item>

                            {p.reasonShow !== false && (
                                <Form.Item
                                    label={<span style={{ color: labelColor, fontWeight: 600 }}>Reason for Leaving</span>}
                                    name="reason"
                                    rules={[{ required: reasonRequired, message: "Please select a reason" }]}
                                >
                                    <Select size="large" placeholder="Select a reason">
                                        {reasonOptions.map((opt) => (
                                            <Option key={opt} value={opt}>{opt}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            )}

                            <Form.Item style={{ marginTop: "2rem", marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={mutation.isPending}
                                    block
                                    style={{
                                        height: "50px",
                                        background: p.buttonVariant === "ghost" ? "transparent" : p.buttonVariant === "outline" ? "transparent" : buttonBg,
                                        borderColor: p.buttonVariant === "ghost" ? "transparent" : buttonBg,
                                        borderWidth: p.buttonVariant === "outline" ? "2px" : "1px",
                                        color: p.buttonVariant === "solid" ? buttonTextColor : buttonBg,
                                        fontWeight: 700,
                                        fontSize: "1.1rem",
                                        borderRadius: buttonBorderRadius,
                                        boxShadow: p.buttonVariant === "solid" ? `0 8px 24px ${buttonBg}55` : "none",
                                    }}
                                >
                                    {submitLabel}
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </motion.div>
            </section>
        </ConfigProvider>
    );
}
