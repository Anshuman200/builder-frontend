"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon, UserIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";

export function RegisterForm({ handleRegister, setTab, isLoading }: any) {
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setGlobalError("");
    try {
      await handleRegister(values.name, values.email, values.password);
      setSuccess(true);
    } catch (err: any) {
      setGlobalError(err?.message || "Registration failed.");
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <FormHeading title="Check your email" subtitle="We've sent you a verification link." />
        <p style={{ color: "var(--auth-copy)", fontSize: "0.95rem", margin: "16px 0 32px" }}>
          Please click the link in the email to complete your registration and log in. You can close this window.
        </p>
        <Button size="large" block style={BTN_STYLE} onClick={() => setTab("login")}>Back to login</Button>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading title="Create your account" subtitle="Start building pages for free" />

      <Form.Item
        name="name"
        label={<span style={LABEL_STYLE}>Full name</span>}
        rules={[{ required: true, message: "Full name is required" }]}
        style={{ marginBottom: 10 }}
      >
        <Input
          prefix={<UserIcon style={{ width: 16, height: 16, color: "var(--auth-icon)" }} />}
          placeholder="Jane Smith"
          size="large"
          style={INPUT_STYLE}
        />
      </Form.Item>

      <Form.Item
        name="email"
        label={<span style={LABEL_STYLE}>Email</span>}
        rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Please enter a valid email" }]}
        style={{ marginBottom: 10 }}
      >
        <Input
          prefix={<EnvelopeIcon style={{ width: 16, height: 16, color: "var(--auth-icon)" }} />}
          placeholder="you@example.com"
          size="large"
          style={INPUT_STYLE}
        />
      </Form.Item>

      <Form.Item
        name="password"
        label={<span style={LABEL_STYLE}>Password</span>}
        rules={[{ required: true, message: "Password is required" }, { min: 8, message: "Password must be at least 8 characters" }]}
        style={{ marginBottom: 10 }}
      >
        <Input.Password
          prefix={<LockClosedIcon style={{ width: 16, height: 16, color: "var(--auth-icon)" }} />}
          placeholder="••••••••"
          size="large"
          style={INPUT_STYLE}
        />
      </Form.Item>

      {globalError && (
        <p style={{ color: "#ef4444", fontSize: "0.82rem", margin: "4px 0 8px" }}>{globalError}</p>
      )}

      <Form.Item style={{ marginBottom: 10, marginTop: 6 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          size="large"
          block
          style={BTN_STYLE}
        >
          Create free account
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--auth-icon)", margin: 0 }}>
        Already have an account?{" "}
        <GlassLink onClick={() => setTab("login")}>Log in</GlassLink>
      </p>
    </Form>
  );
}
