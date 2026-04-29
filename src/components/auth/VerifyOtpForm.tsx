"use client";

import { useState, useEffect, useRef } from "react";
import { App, Spin, Button } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useSearchParams, useRouter } from "next/navigation";
import { FormHeading, GlassLink, BTN_STYLE } from "./AuthShared";

export function VerifyOtpForm({ handleVerify, error, setTab, redirectOnSuccess }: any) {
  const { message } = App.useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [globalError, setGlobalError] = useState(error);
  const [verifying, setVerifying] = useState(true);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (error) setGlobalError(error);
  }, [error]);

  useEffect(() => {
    const processVerification = async () => {
      if (hasVerified.current) return;
      hasVerified.current = true;

      const payload = searchParams?.get("payload");

      if (!payload) {
        setVerifying(false);
        setGlobalError("Invalid verification link. Please request a new one.");
        return;
      }

      try {
        setVerifying(true);
        await handleVerify(payload);
        
        // Success
        setVerifying(false);
        message.success("Email verified successfully! Logging you in...");
        
        // Let the AuthModal handle the redirection or close, but we can enforce it here
        setTimeout(() => {
          if (redirectOnSuccess) {
            router.replace("/home");
          }
        }, 1000);
      } catch (err: any) {
        setVerifying(false);
        setGlobalError(err?.message || "Verification failed. Link may be expired.");
      }
    };

    processVerification();
  }, [searchParams, handleVerify, message, redirectOnSuccess, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", padding: "24px 0" }}>
      {verifying ? (
        <>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48, color: "#6366f1" }} spin />} />
          <FormHeading
            title="Verifying your email..."
            subtitle="Please wait while we securely verify your account."
          />
        </>
      ) : globalError ? (
        <>
          <div style={{ width: 56, height: 56, backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <FormHeading
            title="Verification failed"
            subtitle={globalError}
          />
          <Button size="large" block style={{ ...BTN_STYLE, marginTop: 16 }} onClick={() => setTab("login")}>
            Back to login
          </Button>
        </>
      ) : (
        <>
          <div style={{ width: 56, height: 56, backgroundColor: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <FormHeading
            title="Verified successfully"
            subtitle="Logging you in..."
          />
        </>
      )}
    </div>
  );
}
