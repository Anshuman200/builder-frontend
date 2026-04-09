"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { LockClosedIcon, KeyIcon } from "@heroicons/react/24/outline";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";

export function ResetPasswordForm({ loginEmail, handleResetPassword, setTab, isLoading }: any) {
  const [globalError, setGlobalError] = useState("");
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
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading
        title="Create new password"
        subtitle={`Enter the 6-digit code sent to ${loginEmail}`}
      />

      <Form.Item
        name="resetToken"
        label={<span style={LABEL_STYLE}>Reset Code</span>}
        rules={[{ required: true, message: "Reset code is required" }, { len: 6, message: "Code must be exactly 6 characters" }]}
        style={{ marginBottom: 10 }}
      >
        <Input
          prefix={<KeyIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />}
          placeholder="123456"
          size="large"
          maxLength={6}
          style={{ ...INPUT_STYLE, letterSpacing: "0.2em", fontWeight: 700 }}
        />
      </Form.Item>

      <Form.Item
        name="newPassword"
        label={<span style={LABEL_STYLE}>New Password</span>}
        rules={[{ required: true, message: "Password is required" }, { min: 8, message: "Password must be at least 8 characters" }]}
        style={{ marginBottom: 10 }}
      >
        <Input.Password
          prefix={<LockClosedIcon style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)" }} />}
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
          Reset password
        </Button>
      </Form.Item>

      <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
        <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
      </p>
    </Form>
  );
}
