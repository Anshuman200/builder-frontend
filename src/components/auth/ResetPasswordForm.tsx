"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { LockClosedIcon, KeyIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink } from "./AuthShared";

export function ResetPasswordForm({ loginEmail, handleResetPassword, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setGlobalError("");
        try {
            await handleResetPassword(loginEmail, values.resetToken, values.newPassword);
        } catch (err: any) {
            setGlobalError(err?.message || "Failed to reset password.");
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
                title="Create new password"
                subtitle={`Enter the 6-digit code sent to ${loginEmail}`}
            />

            <Form.Item
                name="resetToken"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Reset Code</span>}
                rules={[
                    { required: true, message: 'Reset code is required' },
                    { len: 6, message: 'Token must be exactly 6 characters' }
                ]}
                style={{ marginBottom: 12 }}
            >
                <Input
                    prefix={<KeyIcon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} />}
                    placeholder="123456"
                    size="large"
                    maxLength={6}
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        letterSpacing: '0.1em'
                    }}
                />
            </Form.Item>

            <Form.Item
                name="newPassword"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>New Password</span>}
                rules={[
                    { required: true, message: 'Password is required' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                ]}
                style={{ marginBottom: 16 }}
            >
                <Input.Password
                    prefix={<LockClosedIcon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} />}
                    placeholder="••••••••"
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
                    Reset password
                </Button>
            </Form.Item>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
            </p>
        </Form>
    );
}
