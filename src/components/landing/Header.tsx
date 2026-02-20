"use client";

import { useState, useEffect } from "react";
import { Menu, X, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onLoginClick?: () => void;
}

export function Header({ onLoginClick }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── Outer wrapper to handle fixed position ── */}
      <div className="fixed top-0 inset-x-0 z-[100] flex justify-center p-4 md:p-6 transition-all duration-300">

        {/* ── The "Pill" Header ── */}
        <header
          className={cn(
            "w-full max-w-5xl flex items-center justify-between gap-4 px-6 h-14 md:h-16 rounded-2xl md:rounded-full transition-all duration-500 ease-in-out border",
            scrolled || mobileOpen
              ? "bg-[#09090b]/80 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              : "bg-transparent border-transparent"
          )}
        >
          {/* Logo Section */}
          <Link href="/" className="group flex items-center gap-2 no-underline shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 0 15px rgba(99,102,241,0.4)",
              }}
            >
              <Zap size={16} color="white" fill="white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white hidden sm:block">
              PageCraft
            </span>
          </Link>

          {/* Desktop Nav: Middle Section */}
          <nav className="hidden md:flex items-center bg-white/5 border border-white/8 px-1.5 py-1 rounded-full">
            <Link
              href="#templates"
              className="px-6 py-1.5 rounded-full text-sm font-medium text-white/70 hover:text-white transition-all hover:bg-white/5"
            >
              Templates
            </Link>
          </nav>

          {/* Right Section: Auth */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onLoginClick}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-all"
            >
              Log in
            </button>

            <Link
              href="/editor"
              className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold text-white no-underline shadow-lg transition-all hover:scale-105 active:scale-95 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500"
              style={{
                boxShadow: "0 4px 20px -5px rgba(99,102,241,0.6)",
              }}
            >
              Start Free
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex md:hidden items-center justify-center w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile menu overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-md animate-fade-in md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-24 left-4 right-4 bg-[#09090b] border border-white/10 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-2">
              <Link
                href="#templates"
                className="py-4 px-4 text-lg font-medium text-white/70 border-b border-white/5 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Templates
              </Link>
            </nav>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { onLoginClick?.(); setMobileOpen(false); }}
                className="w-full py-4 rounded-2xl bg-white/5 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Log in
              </button>
              <Link
                href="/editor"
                className="w-full py-4 rounded-2xl text-center font-bold text-white bg-linear-to-r from-indigo-600 to-violet-600"
                onClick={() => setMobileOpen(false)}
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}