"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { LockClosedIcon, KeyIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";

export function ResetPasswordForm({ handleResetPassword, setTab, isLoading }: any) {
  const [globalError, setGlobalError] = useState("");
  const searchParams = useSearchParams();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setGlobalError("");
    const payload = searchParams?.get("payload");

    if (!payload) {
      setGlobalError("Invalid reset link. Please request a new one.");
      return;
    }

    try {
      await handleResetPassword(payload, values.newPassword);
    } catch (err: any) {
      setGlobalError(err?.message || "Failed to reset password.");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading
        title="Create new password"
        subtitle={`Set a new secure password for your account`}
      />

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
