"use client";

import Link from "next/link";
import { BoltIcon, GlobeAltIcon, CodeBracketIcon, EnvelopeIcon, HeartIcon } from "@heroicons/react/24/outline";
import { Logo } from "@/components/shared/Logo";
import { Container } from "@/components/ui/Container";
import { CommonContainer } from "../layout/CommonContainer";
import { useSitePages } from "@/lib/api/queries";

const SOCIAL = [
  { icon: GlobeAltIcon, href: "#", label: "Twitter / X" },
  { icon: CodeBracketIcon, href: "#", label: "GitHub" },
  { icon: GlobeAltIcon, href: "#", label: "LinkedIn" },
  { icon: EnvelopeIcon, href: "#", label: "Email" },
];

export function Footer() {
  const { data: sitePages = [] } = useSitePages();

  const FOOTER_LINKS = {
    Product: [
      { label: "Templates", href: "/explore" },
      { label: "Media", href: "/explore/media" },
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
      background: "transparent",
      borderTop: "1px solid var(--border)",
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
              <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: "1rem" }}>
                <Logo className="w-32 h-32 rounded-full" />
              </Link>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 220, marginBottom: "1.5rem" }}>
                The no-code page builder for creators who care about design and performance.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {SOCIAL.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className=" w-[34px] h-[34px] flex items-center justify-center rounded-[var(--radius)] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.4)] no-underline transition-all duration-200 hover:bg-[var(--surface-hover)] hover:border-[var(--primary)] hover:text-[var(--primary)] "
                  >
                    <Icon className="w-[14px] h-[14px]" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-subtle)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1rem" }}>
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
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
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
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            paddingBottom: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}>
            <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} Solario Forge, Inc. All rights reserved.
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
