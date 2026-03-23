"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon, LockClosedIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink } from "./AuthShared";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm(props: any) {
    const { handleLogin, error, setTab, isLoading, forced } = props;
    const { logout } = useAuth();
    const [globalError, setGlobalError] = useState(error);
    const [form] = Form.useForm();

    const onFinish = async (values: any) => {
        setGlobalError("");
        try {
            await handleLogin(values.email, values.password);
        } catch (err: any) {
            setGlobalError("Invalid email or password. Please try again.");
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="flex flex-col gap-0"
            requiredMark={false}
        >
            <FormHeading title="Welcome back" subtitle="Sign in to your PageCraft account" />

            <Form.Item
                name="email"
                label={<span className="text-white/70 text-sm">Email</span>}
                rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Please enter a valid email' }]}
                className="mb-0"
            >
                <Input
                    prefix={<EnvelopeIcon className="w-4 h-4 text-white/40" />}
                    placeholder="you@example.com"
                    size="large"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder-white/20 rounded-xl"
                />
            </Form.Item>

            <Form.Item
                name="password"
                label={<span className="text-white/70 text-sm">Password</span>}
                rules={[{ required: true, message: 'Password is required' }]}
                className="mb-0"
                extra={
                    !forced && (
                        <div className="flex justify-end mt-1">
                            <GlassLink onClick={() => setTab("forgot-password")}>Forgot password?</GlassLink>
                        </div>
                    )
                }
            >
                <Input.Password
                    prefix={<LockClosedIcon className="w-4 h-4 text-white/40" />}
                    placeholder="••••••••"
                    size="large"
                    className="h-12 bg-white/5 border-white/10 text-white placeholder-white/20 rounded-xl"
                />
            </Form.Item>

            {globalError && (
                <div className="text-red-500 text-sm mb-3">
                    {globalError}
                </div>
            )}

            <Form.Item className="mb-4">
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    size="large"
                    block
                    className="bg-linear-to-br from-indigo-500 to-indigo-600 border-none font-bold h-12 rounded-xl"
                >
                    Sign in
                </Button>
            </Form.Item>

            {forced ? (
                <Button
                    onClick={async () => { await logout(); window.location.href = "/"; }}
                    icon={<ArrowLeftOnRectangleIcon className="w-4 h-4" />}
                    size="large"
                    block
                    className="bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl mt-2"
                >
                    Logout & Exit
                </Button>
            ) : (
                <p className="text-center text-sm text-white/30">
                    No account?{" "}
                    <GlassLink onClick={() => setTab("register")}>Create one free</GlassLink>
                </p>
            )}
        </Form>
    );
}
