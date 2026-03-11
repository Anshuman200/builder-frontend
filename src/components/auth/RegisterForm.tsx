"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink } from "./AuthShared";

export function RegisterForm({ handleRegister, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setGlobalError("");
        try {
            await handleRegister(values.name, values.email, values.password);
        } catch (err: any) {
            setGlobalError(err?.message || "Registration failed.");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
            requiredMark={false}
        >
            <FormHeading title="Create your account" subtitle="Start building pages for free" />

            <Form.Item
                name="name"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Full name</span>}
                rules={[{ required: true, message: 'Full name is required' }]}
                style={{ marginBottom: 12 }}
            >
                <Input
                    prefix={<UserIcon style={{ width: 15, height: 15, color: 'rgba(255,255,255,0.4)' }} />}
                    placeholder="Jane Smith"
                    size="large"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                    }}
                />
            </Form.Item>

            <Form.Item
                name="email"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Email</span>}
                rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Please enter a valid email' }
                ]}
                style={{ marginBottom: 12 }}
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

            <Form.Item
                name="password"
                label={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>Password</span>}
                rules={[
                    { required: true, message: 'Password is required' },
                    { min: 8, message: 'Password must be at least 8 characters' }
                ]}
                style={{ marginBottom: 12 }}
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
                    Create free account
                </Button>
            </Form.Item>

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                Already have an account?{" "}<GlassLink onClick={() => setTab("login")}>Log in</GlassLink>
            </p>
        </Form>
    );
}
