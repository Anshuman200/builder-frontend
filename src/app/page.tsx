"use client";

import { useState } from "react";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { Footer } from "@/components/landing/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { TemplatesSection } from "@/components/landing/TemplatesSection";

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <Header onLoginClick={() => setAuthOpen(true)} />
      <main>
        <HeroSection />
        <TemplatesSection />
      </main>
      <Footer />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
