"use client";

import { useState, useEffect } from "react";
import { Search, Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onSearchChange?: (q: string) => void;
  onLoginClick?: () => void;
}

export function Header({ onSearchChange, onLoginClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const navLinks = [
    { label: "Templates", href: "#templates" },
  ];

  return (
    <>
      {/* ── Header shell — fully Tailwind ── */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-[100] transition-all duration-300",
          scrolled
            ? "bg-black/85 backdrop-blur-xl border-b border-white/6"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div
              className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 16px rgba(99,102,241,0.5)",
              }}
            >
              <Zap size={18} color="white" fill="white" />
            </div>
            <span
              className="text-[1.15rem] font-extrabold tracking-[-0.03em] whitespace-nowrap bg-clip-text text-transparent"
              style={{
                background: "linear-gradient(135deg, #818cf8, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PageCraft
            </span>
          </Link>

          {/* ── Center (Search + Nav) ── */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-6 px-4">
            <div className="relative w-full max-w-[340px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search templates…"
                className="w-full pl-9 pr-9 py-2 bg-white/5 border border-white/8 rounded-full text-white text-[0.8rem] outline-none transition-all placeholder:text-white/30 focus:bg-indigo-500/10 focus:border-indigo-500/50"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-white/40 flex items-center p-0"
                  onClick={() => { setSearchQuery(""); onSearchChange?.(""); }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
              {navLinks.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="px-2.5 py-1.5 rounded-lg text-[0.85rem] font-medium text-white/55 no-underline transition-all whitespace-nowrap hover:text-white hover:bg-white/7"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* ── Right actions ── */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {/* Log in — hidden on mobile */}
            <button
              onClick={onLoginClick}
              className="hidden md:inline-flex px-4 py-1.5 rounded-full text-[0.825rem] font-semibold text-white/65 bg-transparent border border-white/10 cursor-pointer whitespace-nowrap transition-all hover:text-white hover:border-white/20 hover:bg-white/5"
            >
              Log in
            </button>

            {/* Start Free — always visible */}
            <Link
              href="/editor"
              className="inline-flex items-center px-4.5 py-[0.4rem] rounded-full text-[0.825rem] font-bold text-white no-underline whitespace-nowrap transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 0 18px rgba(99,102,241,0.4)",
              }}
            >
              Start Free
            </Link>

            {/* Hamburger — only on mobile */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Toggle menu"
              className="flex md:hidden items-center justify-center p-1.5 rounded-lg bg-white/6 border border-white/10 cursor-pointer text-white/70 shrink-0 transition-all hover:bg-white/10"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="flex flex-col gap-1 bg-[rgba(6,6,14,0.97)] backdrop-blur-xl border-t border-white/6 px-5 pt-4 pb-6 md:hidden">

            {/* Mobile search */}
            <div className="relative mb-3">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search templates…"
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/8 rounded-full text-white text-[0.8rem] outline-none transition-all placeholder:text-white/30 focus:bg-indigo-500/10 focus:border-indigo-500/50"
              />
            </div>

            {/* Nav links */}
            {navLinks.map(l => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 px-2 text-[0.95rem] font-medium text-white/55 no-underline border-b border-white/4 transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            ))}

            {/* CTA row */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => { onLoginClick?.(); setMobileOpen(false); }}
                className="flex-1 py-2.5 px-4 rounded-full text-sm font-semibold text-white bg-transparent border border-white/10 cursor-pointer transition-all hover:bg-white/5"
              >
                Log in
              </button>
              <Link
                href="/editor"
                className="flex-1 py-2.5 px-4 rounded-full text-sm font-bold text-white text-center no-underline"
                style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
              >
                Start Free
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
