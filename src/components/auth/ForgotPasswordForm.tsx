"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";

export function ForgotPasswordForm({ handleForgotPassword, setTab, isLoading }: any) {
  const [globalError, setGlobalError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setGlobalError("");
    try {
      await handleForgotPassword(values.email);
      setSuccess(true);
    } catch (err: any) {
      setGlobalError(err?.message || "Failed to send reset link.");
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "24px 0" }}>
        <FormHeading title="Check your email" subtitle="We've sent you a secure reset link." />
        <p style={{ color: "var(--auth-copy)", fontSize: "0.95rem", margin: "16px 0 32px" }}>
          Please click the link in the email to set a new password. You can close this window.
        </p>
        <Button size="large" block style={BTN_STYLE} onClick={() => setTab("login")}>Back to login</Button>
      </div>
    );
  }

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading title="Reset your password" subtitle="Enter your email to receive a reset link" />

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
          Send reset link
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--auth-icon)", margin: 0 }}>
        <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
      </p>
    </Form>
  );
}
