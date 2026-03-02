"use client";

import type { Tab } from "@/@Types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";

import { GlassOrb, TabSwitcher } from "./AuthShared";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { VerifyOtpForm } from "./VerifyOtpForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: Tab;
}

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Keep these two states to pass the email between steps
  const [loginEmail, setLoginEmail] = useState("");
  const [regEmail, setRegEmail] = useState("");

  const { login, register, verifyOtp, forgotPassword, resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) { setTab(defaultTab); }
  }, [open, defaultTab]);

  const reset = () => {
    setLoginEmail(""); setRegEmail("");
    setTab(defaultTab);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    handleClose();
    if (window.location.pathname === "/") router.push("/dashboard");
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setRegEmail(email);
    await register(name, email, password);
    setTab("verify");
  };

  const handleVerify = async (email: string, otp: string) => {
    await verifyOtp(email, otp);
    handleClose();
    if (window.location.pathname === "/") router.push("/dashboard");
  };

  const handleForgotPassword = async (email: string) => {
    setLoginEmail(email);
    await forgotPassword(email);
    setTab("reset-password");
  };

  const handleResetPassword = async (email: string, resetToken: string, newPassword: string) => {
    await resetPassword(email, resetToken, newPassword);
    setTab("login");
  };

  if (!open) return null;

  return (
    <>
      <style>{`
                @keyframes float-orb-1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-30px) scale(1.1)} 66%{transform:translate(-15px,20px) scale(0.9)} }
                @keyframes float-orb-2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-25px,20px) scale(1.05)} 66%{transform:translate(20px,-20px) scale(0.95)} }
                @keyframes float-orb-3 { 0%,100%{transform:translate(0,0) scale(1.05)} 50%{transform:translate(15px,-25px) scale(0.9)} }
                @keyframes modal-in { from{opacity:0;transform:scale(0.95) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
                @keyframes overlay-in { from{opacity:0} to{opacity:1} }
                @keyframes tab-slide { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
            `}</style>

      {/* Backdrop */}
      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          animation: "overlay-in 0.2s ease",
        }}
      >
        {/* Card shell */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 420,
          borderRadius: 24, overflow: "hidden",
          animation: "modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {/* Orb layer */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 24, zIndex: 0 }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(145deg, #0f0a1e 0%, #170d2d 60%, #0a0a1a 100%)" }} />
            <GlassOrb style={{ width: 260, height: 260, top: -60, left: -60, background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)", animation: "float-orb-1 8s ease-in-out infinite" }} />
            <GlassOrb style={{ width: 200, height: 200, bottom: -40, right: -40, background: "radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 70%)", animation: "float-orb-2 10s ease-in-out infinite" }} />
            <GlassOrb style={{ width: 180, height: 180, top: "50%", left: "60%", background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)", animation: "float-orb-3 12s ease-in-out infinite" }} />
            <GlassOrb style={{ width: 120, height: 120, bottom: "30%", left: "10%", background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)", animation: "float-orb-1 15s ease-in-out infinite reverse" }} />
          </div>

          {/* Iridescent border ring */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: 24, padding: 1, zIndex: 1,
            background: "linear-gradient(135deg, rgba(139,92,246,0.6) 0%, rgba(99,102,241,0.3) 25%, rgba(236,72,153,0.4) 50%, rgba(56,189,248,0.3) 75%, rgba(139,92,246,0.6) 100%)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }} />

          {/* Glass content */}
          <div style={{
            position: "relative", zIndex: 2,
            backdropFilter: "blur(32px) saturate(180%)",
            WebkitBackdropFilter: "blur(32px) saturate(180%)",
            padding: "1.75rem",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
                }}>
                  <BoltIcon style={{ width: 17, height: 17, color: "white" }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: "1.05rem", color: "rgba(255,255,255,0.95)", letterSpacing: "-0.02em" }}>
                  PageCraft
                </span>
              </div>
              <button onClick={handleClose} style={{
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.45)", transition: "all 0.15s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
              >
                <XMarkIcon style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Login / Register */}
            {(tab === "login" || tab === "register") && (
              <>
                <TabSwitcher tab={tab} onChange={(t) => { setTab(t); }} />
                <div key={tab} style={{ animation: "tab-slide 0.2s ease" }}>
                  {tab === "login" && (
                    <LoginForm
                      handleLogin={handleLogin} setTab={setTab}
                    />
                  )}
                  {tab === "register" && (
                    <RegisterForm
                      handleRegister={handleRegister} setTab={setTab}
                    />
                  )}
                </div>
              </>
            )}

            {/* Forgot Password */}
            {tab === "forgot-password" && (
              <ForgotPasswordForm
                handleForgotPassword={handleForgotPassword} setTab={setTab}
              />
            )}

            {/* Reset Password */}
            {tab === "reset-password" && (
              <ResetPasswordForm
                loginEmail={loginEmail}
                handleResetPassword={handleResetPassword} setTab={setTab}
              />
            )}

            {/* Verify OTP */}
            {tab === "verify" && (
              <VerifyOtpForm
                regEmail={regEmail}
                handleVerify={handleVerify} setTab={setTab}
              />
            )}

          </div>
        </div>
      </div>
    </>
  );
}
