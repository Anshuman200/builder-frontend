"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ open, onClose, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const { login, register, isLoading } = useAuth();
  const router = useRouter();

  if (!open) return null;

  const reset = () => {
    setError("");
    setLoginEmail(""); setLoginPassword("");
    setRegName(""); setRegEmail(""); setRegPassword("");
    setShowPass(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(loginEmail, loginPassword);
      handleClose();
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await register(regName, regEmail, regPassword);
      handleClose();
      router.push("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 420,
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
        overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.5rem 1.5rem 0",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--text)" }}>
              PageCraft
            </span>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--text-muted)", padding: 4, borderRadius: "var(--radius-sm)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ padding: "1.25rem 1.5rem 0" }}>
          <div style={{
            display: "flex",
            background: "var(--surface)",
            borderRadius: "var(--radius-md)",
            padding: 4,
          }}>
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "0.5rem",
                  borderRadius: "calc(var(--radius-md) - 2px)",
                  border: "none", cursor: "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                  transition: "all var(--transition)",
                  background: tab === t ? "var(--bg)" : "transparent",
                  color: tab === t ? "var(--text)" : "var(--text-muted)",
                  boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                }}
              >
                {t === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "1.25rem 1.5rem 1.5rem" }}>
          {tab === "login" ? (
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                  Welcome back
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Sign in to your PageCraft account
                </p>
              </div>

              <Field label="Email">
                <input
                  type="email" required value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </Field>

              <Field label="Password">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"} required value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={eyeBtn}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

              <button type="submit" disabled={isLoading} style={submitBtn(isLoading)}>
                {isLoading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</> : "Sign in"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                No account?{" "}
                <button type="button" onClick={() => setTab("register")} style={linkBtn}>
                  Create one free
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                  Create your account
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Start building pages for free
                </p>
              </div>

              <Field label="Full name">
                <input
                  type="text" required value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="Jane Smith"
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  type="email" required value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={inputStyle}
                />
              </Field>

              <Field label="Password">
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"} required value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={eyeBtn}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {error && <p style={{ color: "var(--danger)", fontSize: "0.8rem", margin: 0 }}>{error}</p>}

              <button type="submit" disabled={isLoading} style={submitBtn(isLoading)}>
                {isLoading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</> : "Create free account"}
              </button>

              <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Already have an account?{" "}
                <button type="button" onClick={() => setTab("login")} style={linkBtn}>
                  Log in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.875rem",
  borderRadius: "var(--radius)",
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: "0.875rem",
  outline: "none",
  transition: "border-color var(--transition)",
  boxSizing: "border-box",
};

const eyeBtn: React.CSSProperties = {
  position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", cursor: "pointer",
  color: "var(--text-muted)", display: "flex", alignItems: "center",
};

const linkBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "var(--primary)", fontWeight: 600, fontSize: "0.8rem",
  padding: 0,
};

const submitBtn = (loading: boolean): React.CSSProperties => ({
  padding: "0.75rem",
  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
  color: "white", border: "none", borderRadius: "var(--radius)",
  fontWeight: 700, fontSize: "0.9rem", cursor: loading ? "not-allowed" : "pointer",
  opacity: loading ? 0.7 : 1,
  transition: "all var(--transition)",
  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
});
