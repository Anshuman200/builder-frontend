"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";

export function ForgotPasswordForm({ handleForgotPassword, setTab, isLoading }: any) {
  const [globalError, setGlobalError] = useState("");
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
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading title="Reset your password" subtitle="Enter your email to receive a reset code" />

      <Form.Item
        name="email"
        label={<span style={LABEL_STYLE}>Email</span>}
        rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Please enter a valid email" }]}
        style={{ marginBottom: 10 }}
      >
        <Input
          prefix={<EnvelopeIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />}
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
          Send reset code
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
        <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
      </p>
    </Form>
  );
}
