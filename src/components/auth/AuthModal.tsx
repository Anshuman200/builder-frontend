"use client";

import type { Tab } from "@/types";
import { useState, useEffect, useMemo, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useToasts } from "@/hooks/useToasts";
import { Modal } from "antd";

import { TabSwitcher } from "./AuthShared";
import { Logo } from "@/components/shared/Logo";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { VerifyEmailForm } from "./VerifyEmailForm";

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

  const { login, register, verifyEmail, forgotPassword, resetPassword, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const authThemeVars = useMemo(() => ({
    "--auth-card-bg": "linear-gradient(145deg, rgba(17,24,39,0.97) 0%, rgba(10,10,20,0.99) 100%)",
    "--auth-border": "rgba(255,255,255,0.1)",
    "--auth-shadow": "0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
    "--auth-text": "#f9fafb",
    "--auth-label": "rgba(255,255,255,0.68)",
    "--auth-muted": "rgba(255,255,255,0.45)",
    "--auth-copy": "rgba(255,255,255,0.78)",
    "--auth-control-bg": "rgba(255,255,255,0.05)",
    "--auth-input-bg": "rgba(255,255,255,0.05)",
    "--auth-input-border": "rgba(255,255,255,0.12)",
    "--auth-icon": "rgba(255,255,255,0.42)",
    "--auth-close-bg": "rgba(255,255,255,0.06)",
    "--auth-close-bg-hover": "rgba(255,255,255,0.12)",
    "--auth-close-color": "rgba(255,255,255,0.5)",
    "--auth-close-color-hover": "rgba(255,255,255,0.84)",
    "--auth-link": "#a78bfa",
    "--auth-link-hover": "#c4b5fd",
    "--auth-tab-active-bg": "rgba(99,102,241,0.25)",
    "--auth-tab-active-border": "rgba(99,102,241,0.3)",
  }) as CSSProperties, []);

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
    setTab(defaultTab);
  };

  const handleClose = () => {
    if (forced) { window.location.href = "/"; return; }
    reset();
    onClose();
  };

  const executeLogin = async (email: string, password: string) => {
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
    await register(name, email, password);
    // Registration succeeded → magic link sent, let RegisterForm show success
  };

  const executeForgotPassword = async (email: string) => {
    await forgotPassword(email);
    // Note: Do not transition tab here, let ForgotPasswordForm show success message
  };

  const executeResetPassword = async (payload: string, newPassword: string) => {
    await resetPassword(payload, newPassword);
    setTab("login");
  };

  const executeVerify = async (payload: string) => {
    await verifyEmail(payload);
    // Let VerifyEmailForm handle the redirection internally
  };

  const ModalBackground = useMemo(() => (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[20px]">
      <div className="absolute -left-20 -top-20 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,transparent_70%)] blur-[60px] will-change-transform [animation:float-orb-1_8s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[50px] -right-[50px] h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.28)_0%,transparent_70%)] blur-[60px] will-change-transform [animation:float-orb-2_10s_ease-in-out_infinite]" />
      <div className="absolute right-[-30px] top-[40%] h-[150px] w-[150px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.15)_0%,transparent_70%)] blur-[60px] will-change-transform [animation:float-orb-3_12s_ease-in-out_infinite]" />
    </div>
  ), []);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closable={false}
      className="auth-modal"
      rootClassName="auth-modal-root"
      styles={{
        body: { padding: 0 },
        mask: {
          background: "rgba(0,0,0,0.72)",
          backdropFilter: "blur(15px)",
        },
      }}
      centered
    >
      {/* Outer card — stops clicks bubbling to the mask */}
      <div
        className="auth-modal-shell relative overflow-hidden rounded-[20px] bg-[var(--auth-card-bg)] shadow-[var(--auth-shadow)]"
        onClick={(e) => e.stopPropagation()}
        style={authThemeVars}
      >
        {ModalBackground}

        <div className="relative z-[1] px-8 py-8 md:px-9">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Logo src="/logoOnly.png" className="w-8 h-8 md:w-9 md:h-9" />
            </div>

            {!forced && (
              <button
                type="button"
                onClick={handleClose}
                className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-[var(--auth-close-bg)] text-[var(--auth-close-color)] transition-colors duration-150 hover:bg-[var(--auth-close-bg-hover)] hover:text-[var(--auth-close-color-hover)]"
              >
                <XMarkIcon className="h-[15px] w-[15px]" />
              </button>
            )}
          </div>

          {(tab === "login" || tab === "register") && (
            <>
              {!forced && <TabSwitcher tab={tab} onChange={setTab} />}
              <div key={tab}>
                {tab === "login" && (
                  <LoginForm
                    handleLogin={executeLogin}
                    setTab={setTab}
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
            <VerifyEmailForm 
              handleVerify={executeVerify} 
              setTab={setTab} 
              redirectOnSuccess={redirectOnSuccess} 
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
