"use client";

import Link from "next/link";
import { Zap, Twitter, Github, Linkedin, Mail, ArrowRight, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";

const FOOTER_LINKS = {
  Product: [
    { label: "Templates", href: "#templates" },
    { label: "Features", href: "#features" },
  ],
  Company: [
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#privacy" },
    { label: "Terms of Service", href: "#terms" },
  ],
};

const SOCIAL = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer style={{
      position: "relative",
      background: "linear-gradient(180deg, transparent 0%, rgba(6,6,14,0.98) 8%, #06060e 100%)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: 600, height: 1,
        boxShadow: "0 0 120px 60px rgba(99,102,241,0.12)",
        pointerEvents: "none",
      }} />

      {/* Newsletter CTA banner */}
      <Container className="pc-footer-inner" style={{ paddingTop: "4rem" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "var(--radius-xl)",
          padding: "clamp(1.5rem, 4vw, 3rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
          flexWrap: "wrap",
          marginBottom: "4rem",
          position: "relative",
          overflow: "hidden",
        }}>
          <div className="glow-blob" style={{ width: 300, height: 300, background: "#6366f1", left: -100, top: -100, opacity: 0.12 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h3 style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", fontWeight: 800, color: "white", marginBottom: "0.35rem", letterSpacing: "-0.02em" }}>
              Stay in the loop
            </h3>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
              Get new templates, features &amp; tips delivered weekly.
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flex: "1 1 300px", maxWidth: 420, position: "relative", zIndex: 1 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "var(--radius-full)",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
            <button style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-full)",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              color: "white",
              fontWeight: 700,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              whiteSpace: "nowrap",
              boxShadow: "0 0 20px rgba(99,102,241,0.35)",
              transition: "filter 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.15)")}
              onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
            >
              Subscribe <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* ── Link Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr repeat(4, 1fr)",
          gap: "2rem",
          marginBottom: "3rem",
        }}
          className="footer-grid"
        >
          {/* Brand column */}
          <div>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "1rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <span style={{
                fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                PageCraft
              </span>
            </Link>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 220, marginBottom: "1.5rem" }}>
              The no-code page builder for creators who care about design and performance.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label} style={{
                  width: 34, height: 34,
                  borderRadius: "var(--radius)",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(99,102,241,0.15)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "#818cf8";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
                  }}
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
                {section}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} style={{
                      color: "rgba(255,255,255,0.38)",
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      transition: "color 0.15s",
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          paddingTop: "1.5rem",
          paddingBottom: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} PageCraft, Inc. All rights reserved.
          </p>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            Made with <Heart size={11} fill="#ef4444" color="#ef4444" /> for creators worldwide
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy", "Terms", "Cookies"].map(l => (
              <Link key={l} href="#" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </Container>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer >
  );
}
