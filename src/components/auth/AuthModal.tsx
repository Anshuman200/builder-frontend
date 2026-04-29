"use client";

import type { Tab } from "@/types";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useToasts } from "@/hooks/useToasts";
import { Modal } from "antd";

import { GlassOrb, TabSwitcher } from "./AuthShared";
import { Logo } from "@/components/shared/Logo";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { VerifyOtpForm } from "./VerifyOtpForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: Tab;
  redirectOnSuccess?: boolean;
  forced?: boolean;
}

export function AuthModal({
  open,
  onClose,
  defaultTab = "login",
  redirectOnSuccess = true,
  forced = false,
}: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [authError, setAuthError] = useState("");

  const { login, register, verifyOtp, forgotPassword, resetPassword, isLoading } = useAuth();
  const { error: toastError } = useToasts();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (open) {
      const authParam = searchParams.get("auth");
      if (authParam === "reset-password") {
        setTab("reset-password");
      } else if (authParam === "verify") {
        setTab("verify");
      } else {
        setTab(defaultTab);
      }
    }
  }, [open, defaultTab, searchParams]);

  const reset = () => {
    setLoginEmail("");
    setRegEmail("");
    setAuthError("");
    setTab(defaultTab);
  };

  const handleClose = () => {
    if (forced) { window.location.href = "/"; return; }
    reset();
    onClose();
  };

  const executeLogin = async (email: string, password: string) => {
    setLoginEmail(email);
    const result = await login(email, password);
    if (result) {
      if (redirectOnSuccess) {
        const destination = result?.redirectTo ?? "/home";
        router.replace(destination);
      }
      onClose();
    }
  };

  const executeRegister = async (name: string, email: string, password: string) => {
    setRegEmail(email);
    await register(name, email, password);
    // Registration succeeded → magic link sent, let RegisterForm show success
  };

  const executeForgotPassword = async (email: string) => {
    setLoginEmail(email);
    await forgotPassword(email);
    // Note: Do not transition tab here, let ForgotPasswordForm show success message
  };

  const executeResetPassword = async (payload: string, newPassword: string) => {
    await resetPassword(payload, newPassword);
    setTab("login");
  };

  const executeVerify = async (payload: string) => {
    await verifyOtp(payload);
    // Let VerifyOtpForm handle the redirection internally
  };

  // Memoised decorative orbs
  const ModalBackground = useMemo(() => (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 20, zIndex: 0, pointerEvents: "none" }}>
      <GlassOrb style={{
        width: 280, height: 280, top: -80, left: -80,
        background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
        animation: "float-orb-1 8s ease-in-out infinite",
      }} />
      <GlassOrb style={{
        width: 220, height: 220, bottom: -50, right: -50,
        background: "radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 70%)",
        animation: "float-orb-2 10s ease-in-out infinite",
      }} />
      <GlassOrb style={{
        width: 150, height: 150, top: "40%", right: -30,
        background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
        animation: "float-orb-3 12s ease-in-out infinite",
      }} />
    </div>
  ), []);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      classNames={{
        container: 'bg-transparent !shadow-none !p-0',
      }}
      centered
    >
      {/* Outer card — stops clicks bubbling to the mask */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          borderRadius: 20,
          overflow: "hidden",
          background: "linear-gradient(145deg, rgba(17,24,39,0.97) 0%, rgba(10,10,20,0.99) 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
        }}
      >
        {ModalBackground}

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, padding: "2rem 2.25rem" }}>

          {/* ── Header ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Logo src="/logoOnly.png" className="w-8 h-8 md:w-9 md:h-9" />
            </div>

            {!forced && (
              <button
                onClick={handleClose}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 30, height: 30, borderRadius: 8, border: "none",
                  background: "rgba(255,255,255,0.06)", cursor: "pointer",
                  color: "rgba(255,255,255,0.4)", transition: "all 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <XMarkIcon style={{ width: 15, height: 15 }} />
              </button>
            )}
          </div>

          {/* ── Forms ── */}
          {(tab === "login" || tab === "register") && (
            <>
              {!forced && <TabSwitcher tab={tab} onChange={setTab} />}
              <div key={tab}>
                {tab === "login" && (
                  <LoginForm
                    handleLogin={executeLogin}
                    setTab={setTab}
                    setRegEmail={setRegEmail}
                    setAuthError={setAuthError}
                    isLoading={isLoading}
                    forced={forced}
                  />
                )}
                {tab === "register" && (
                  <RegisterForm handleRegister={executeRegister} setTab={setTab} isLoading={isLoading} />
                )}
              </div>
            </>
          )}

          {tab === "forgot-password" && (
            <ForgotPasswordForm handleForgotPassword={executeForgotPassword} setTab={setTab} isLoading={isLoading} />
          )}

          {tab === "reset-password" && (
            <ResetPasswordForm handleResetPassword={executeResetPassword} setTab={setTab} isLoading={isLoading} />
          )}

          {tab === "verify" && (
            <VerifyOtpForm handleVerify={executeVerify} setTab={setTab} redirectOnSuccess={redirectOnSuccess} />
          )}
        </div>
      </div>
    </Modal>
  );
}
