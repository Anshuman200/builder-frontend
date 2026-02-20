import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { Footer } from "@/components/landing/Footer";
import { FloatingThemeSwitcher } from "@/components/landing/FloatingThemeSwitcher";

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", overflowX: "hidden" }}>
      <Header />
      <main>
        <HeroSection />
      </main>
      <Footer />
      <FloatingThemeSwitcher />
    </div>
  );
}
