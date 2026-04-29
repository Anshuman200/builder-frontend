"use client";

import { useState } from "react";
import { Form, Input, Button } from "antd";
import { EnvelopeIcon, LockClosedIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { FormHeading, GlassLink, INPUT_STYLE, LABEL_STYLE, BTN_STYLE } from "./AuthShared";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm(props: any) {
  const { handleLogin, setTab, setRegEmail, setAuthError, isLoading, forced } = props;
  const { logout } = useAuth();
  const router = useRouter();
  const [globalError, setGlobalError] = useState("");
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setGlobalError("");
    try {
      await handleLogin(values.email, values.password);
    } catch (err: any) {
      if (err.status === 403 || String(err.status) === "403" || err.message?.toLowerCase().includes("verify")) {
        if (setRegEmail) setRegEmail(values.email);
        if (setAuthError) setAuthError("Account not verified. Please check your email for the code.");
        setTab("verify");
        return;
      }
      setGlobalError(err.message || "Invalid email or password. Please try again.");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <FormHeading title="Welcome back" subtitle="Sign in to your Solario Forge account" />

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

      <Form.Item
        name="password"
        label={<span style={LABEL_STYLE}>Password</span>}
        rules={[{ required: true, message: "Password is required" }]}
        style={{ marginBottom: 4 }}
        extra={
          !forced && (
            <div style={{ textAlign: "right", marginTop: 4 }}>
              <GlassLink onClick={() => setTab("forgot-password")}>Forgot password?</GlassLink>
            </div>
          )
        }
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
          Sign in
        </Button>
      </Form.Item>

      {forced ? (
        <Button
          onClick={async () => { await logout(); router.push("/"); }}
          icon={<ArrowLeftOnRectangleIcon style={{ width: 16, height: 16 }} />}
          size="large"
          block
          style={{ borderRadius: 10, height: 44, background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}
        >
          Logout & Exit
        </Button>
      ) : (
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
          No account?{" "}
          <GlassLink onClick={() => setTab("register")}>Create one free</GlassLink>
        </p>
      )}
    </Form>
  );
}
