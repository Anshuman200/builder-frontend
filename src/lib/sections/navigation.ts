// sections/navigation.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const navigationSections: SectionTemplate[] = [
    {
        id: "nav-logo-left",
        name: "Navbar Logo Left",
        category: "Navigation",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;align-items:center;justify-content:space-between;background:#ffffff;padding:0 80px;border-bottom:1px solid #f1f5f9">
                <div style="display:flex;align-items:center;gap:16px">
                  <div style="width:40px;height:40px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px"></div>
                  <div style="font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.03em">PageCraft</div>
                </div>
                <div style="display:flex;gap:40px">
                  <div style="font-size:18px;font-weight:600;color:#64748b">Features</div>
                  <div style="font-size:18px;font-weight:600;color:#64748b">Pricing</div>
                  <div style="font-size:18px;font-weight:600;color:#64748b">About</div>
                </div>
                <div style="padding:16px 32px;background:#6366f1;color:#fff;border-radius:12px;font-size:18px;font-weight:700">Get Started</div>
                </div>`,
        create: () => makeBlock("header", {
            layout: "standard",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "PageCraft",
            links: [
                { id: "1", label: "Features", url: "#features" },
                { id: "2", label: "Pricing", url: "#pricing" },
                { id: "3", label: "About", url: "#about" }
            ],
            showCta: true, ctaText: "Get Started",
            bgColor: "#ffffff", textColor: "#0f172a",
        }),
    },
    {
        id: "nav-logo-center",
        name: "Navbar Logo Center",
        category: "Navigation",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;align-items:center;justify-content:space-between;background:#ffffff;padding:0 80px;border-bottom:1px solid #f1f5f9">
                <div style="display:flex;gap:40px;width:33%">
                  <div style="font-size:18px;font-weight:600;color:#64748b">Product</div>
                  <div style="font-size:18px;font-weight:600;color:#64748b">Blog</div>
                </div>
                <div style="display:flex;align-items:center;gap:12px;justify-content:center;width:33%">
                  <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%"></div>
                  <div style="font-size:28px;font-weight:900;color:#0f172a;letter-spacing:-0.03em">PageCraft</div>
                </div>
                <div style="display:flex;justify-content:flex-end;width:33%">
                  <div style="padding:14px 32px;background:#0f172a;color:#fff;border-radius:12px;font-size:18px;font-weight:700">Login</div>
                </div>
                </div>`,
        create: () => makeBlock("header", {
            layout: "centered",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "PageCraft",
            links: [
                { id: "1", label: "Product", url: "#product" },
                { id: "2", label: "Blog", url: "#blog" }
            ],
            showCta: true, ctaText: "Login",
            bgColor: "#ffffff", textColor: "#0f172a",
            ctaBgColor: "#0f172a",
        }),
    },
    {
        id: "nav-glass-dark",
        name: "Navbar Glass Dark",
        category: "Navigation",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;align-items:center;justify-content:space-between;background:#0f172a;padding:0 80px">
                <div style="display:flex;align-items:center;gap:16px">
                  <div style="width:40px;height:40px;border:2px solid #6366f1;border-radius:10px;display:flex;align-items:center;justify-content:center"><div style="width:16px;height:16px;background:#6366f1;border-radius:4px"></div></div>
                  <div style="font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.03em">PageCraft</div>
                </div>
                <div style="display:flex;gap:40px">
                  <div style="font-size:18px;font-weight:600;color:#94a3b8">Tour</div>
                  <div style="font-size:18px;font-weight:600;color:#94a3b8">Docs</div>
                </div>
                <div style="padding:14px 32px;border:2px solid rgba(255,255,255,0.2);color:#fff;border-radius:12px;font-size:18px;font-weight:700">Launch App</div>
                </div>`,
        create: () => makeBlock("header", {
            layout: "standard",
            layoutWidth: "fluid",
            fullWidth: true,
            logoText: "PageCraft",
            style: "glass",
            links: [
                { id: "1", label: "Tour", url: "#tour" },
                { id: "2", label: "Docs", url: "#docs" }
            ],
            showCta: true, ctaText: "Launch App", ctaVariant: "outline",
            bgColor: "#0f172a", textColor: "#ffffff",
        }),
    },
];
