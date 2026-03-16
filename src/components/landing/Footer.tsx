"use client";

import Link from "next/link";
import { BoltIcon, GlobeAltIcon, CodeBracketIcon, EnvelopeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Container } from "@/components/ui/Container";
import { CommonContainer } from "../layout/CommonContainer";
import { useSitePages } from "@/lib/api/queries";

const SOCIAL = [
  { icon: GlobeAltIcon, href: "#", label: "Twitter" },
  { icon: CodeBracketIcon, href: "#", label: "GitHub" },
  { icon: GlobeAltIcon, href: "#", label: "LinkedIn" },
  { icon: EnvelopeIcon, href: "#", label: "Email" },
];

export function Footer() {
  const { data: sitePages = [] } = useSitePages();

  const FOOTER_LINKS = {
    Product: [
      { label: "Templates", href: "/explore" },
      { label: "Features", href: "/#features" },
    ],
    Company: [
      { label: "Contact", href: "/contact" },
    ],
    Legal: sitePages.length > 0 ? sitePages.map((p: { title: string; slug: string }) => ({ label: p.title, href: `/${p.slug}` })) : [],
  };

  const bottomLinks = [
    ...(sitePages.slice(0, 1).map((p: { title: string; slug: string }) => ({ label: p.title, href: `/${p.slug}` }))),
    { label: "Contact", href: "/contact" }
  ];

  return (
    <footer style={{
      position: "relative",
      background: "linear-gradient(180deg, transparent 0%, rgba(6,6,14,0.98) 8%, #06060e 100%)",
      borderTop: "1px solid rgba(255,255,255,0.05)",
      overflow: "hidden",
    }}
    >
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: '100dvw', height: 1,
        boxShadow: "0 0 120px 60px rgba(99,102,241,0.12)",
        pointerEvents: "none",
      }} />

      {/* CTA banner */}
      <CommonContainer>
        <Container size="full" className="pc-footer-inner" style={{ paddingTop: "4rem" }}>

          {/* ── Link Grid ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Brand column */}
            <div>
              <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", marginBottom: "1rem" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyItems: "center",
                }}>
                  <BoltIcon style={{ width: 16, height: 16, color: "white" }} />
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
                    <Icon style={{ width: 14, height: 14 }} />
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
                  {links.map(({ label, href }: { label: string; href: string }) => (
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
              Made with <HeartIcon style={{ width: 11, height: 11, color: "#ef4444", fill: "#ef4444" }} /> for creators worldwide
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {bottomLinks.map(({ label, href }) => (
                <Link key={label} href={href} style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </CommonContainer>
    </footer >
  );
}
