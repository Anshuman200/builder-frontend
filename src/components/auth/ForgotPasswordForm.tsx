"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink } from "./AuthShared";

export function ForgotPasswordForm({ handleForgotPassword, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setGlobalError("");
        try {
            await handleForgotPassword(values.email);
        } catch (err: any) {
            setGlobalError(err?.message || "Failed to send reset link.");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ display: "flex", flexDirection: "column", gap: 8, animation: "tab-slide 0.2s ease" }}
            requiredMark={false}
        >
            <FormHeading
                title="Reset your password"
                subtitle="Enter your email to receive a reset code"
            />

            <Form.Item
                name="email"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Email</span>}
                rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' }
                ]}
                style={{ marginBottom: 16 }}
            >
                <Input
                    prefix={<EnvelopeIcon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} />}
                    placeholder="you@example.com"
                    size="large"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                    }}
                />
            </Form.Item>

            {globalError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: 12 }}>
                    {globalError}
                </div>
            )}

            <Form.Item style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    size="large"
                    block
                    style={{
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        fontWeight: 600,
                    }}
                >
                    Send reset code
                </Button>
            </Form.Item>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
            </p>
        </Form>
    );
}
