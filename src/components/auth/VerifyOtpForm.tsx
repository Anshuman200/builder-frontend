"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { FormHeading, GlassLink } from "./AuthShared";

export function VerifyOtpForm({ regEmail, handleVerify, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setGlobalError("");
        try {
            await handleVerify(regEmail, values.otp);
        } catch (err: any) {
            setGlobalError(err?.message || "Invalid or expired code.");
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
                title="Check your email"
                subtitle={`We sent a 6-digit code to ${regEmail}`}
            />

            <Form.Item
                name="otp"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Verification Code</span>}
                rules={[
                    { required: true, message: 'OTP is required' },
                    { len: 6, message: 'Please enter a valid 6-digit code' }
                ]}
                style={{ marginBottom: 16 }}
            >
                <Input
                    placeholder="123456"
                    size="large"
                    maxLength={6}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        textAlign: 'center',
                        letterSpacing: '0.2em',
                        fontSize: '1.2rem',
                        fontWeight: 600
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
                    Verify email
                </Button>
            </Form.Item>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("register")}>← Back to sign up</GlassLink>
            </p>
        </Form>
    );
}
