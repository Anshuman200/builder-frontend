"use client";

import { useState, useEffect, useRef } from "react";
import { Form, Input, Button, App } from "antd";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";
import { useResendOtp } from "@/lib/api/queries";

export function VerifyOtpForm({ regEmail, handleVerify, error, setTab, isLoading }: any) {
  const { message } = App.useApp();
  const [globalError, setGlobalError] = useState(error);
  const [cooldown, setCooldown] = useState(0);
  const resendMut = useResendOtp();
  const [form] = Form.useForm();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (error) setGlobalError(error);
  }, [error]);

  useEffect(() => {
    if (cooldown > 0) {
      timerRef.current = setTimeout(() => setCooldown(cooldown - 1), 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [cooldown]);

  const onFinish = async (values: any) => {
    setGlobalError("");
    try {
      await handleVerify(regEmail, values.otp);
    } catch (err: any) {
      setGlobalError(err?.message || "Invalid or expired code.");
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      await resendMut.mutateAsync({ email: regEmail });
      message.success("A new code has been sent!");
      setCooldown(60);
    } catch (err: any) {
      message.error(err.message || "Failed to resend code");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading
        title="Check your email"
        subtitle={`We sent a 6-digit code to ${regEmail}`}
      />

      <Form.Item
        name="otp"
        label={<span style={LABEL_STYLE}>Verification Code</span>}
        rules={[{ required: true, message: "OTP is required" }, { len: 6, message: "Please enter a valid 6-digit code" }]}
        style={{ marginBottom: 10 }}
      >
        <Input
          placeholder="123456"
          size="large"
          maxLength={6}
          style={{
            ...INPUT_STYLE,
            textAlign: "center",
            letterSpacing: "0.3em",
            fontSize: "1.5rem",
            fontWeight: 800,
            height: 56,
          }}
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
          Verify email
        </Button>
      </Form.Item>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <GlassLink onClick={() => setTab("register")}>← Back to sign up</GlassLink>

        <Button
          type="link"
          size="small"
          onClick={handleResend}
          loading={resendMut.isPending}
          disabled={cooldown > 0}
          style={{
            color: cooldown > 0 ? "rgba(255,255,255,0.2)" : "#a78bfa",
            fontSize: "0.82rem",
            padding: 0,
            height: "auto",
            transition: "all 0.2s"
          }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
        </Button>
      </div>
    </Form>
  );
}
