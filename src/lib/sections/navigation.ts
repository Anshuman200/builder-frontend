// sections/navigation.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const navigationSections: SectionTemplate[] = [
    {
        id: "nav-logo-left",
        name: "Navbar Logo Left",
        category: "Navigation",
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f1f5f9;padding:20px">
                <div style="width:100%;background:#ffffff;padding:12px 16px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:20px;height:20px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:6px"></div>
                    <div style="width:50px;height:8px;background:#0f172a;border-radius:4px"></div>
                  </div>
                  <div style="display:flex;gap:8px">
                    <div style="width:24px;height:4px;background:#e2e8f0;border-radius:2px"></div>
                    <div style="width:24px;height:4px;background:#e2e8f0;border-radius:2px"></div>
                  </div>
                  <div style="width:40px;height:16px;background:#6366f1;border-radius:6px"></div>
                </div>
                <div style="margin-top:12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Standard Branding</div>
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
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f1f5f9;padding:20px">
                <div style="width:100%;background:#ffffff;padding:12px 16px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06)">
                  <div style="display:flex;gap:8px;width:30%">
                    <div style="width:20px;height:4px;background:#e2e8f0;border-radius:2px"></div>
                    <div style="width:20px;height:4px;background:#e2e8f0;border-radius:2px"></div>
                  </div>
                  <div style="display:flex;align-items:center;gap:6px;justify-content:center;width:40%">
                    <div style="width:18px;height:18px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:50%"></div>
                    <div style="width:40px;height:8px;background:#0f172a;border-radius:4px"></div>
                  </div>
                  <div style="display:flex;justify-content:flex-end;width:30%">
                    <div style="width:36px;height:16px;background:#0f172a;border-radius:6px"></div>
                  </div>
                </div>
                <div style="margin-top:12px;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">Elegant Centered</div>
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
        preview: `<div style="font-family:'Inter',sans-serif;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0f172a;padding:20px">
                <div style="width:100%;background:rgba(255,255,255,0.05);padding:12px 16px;border-radius:12px;display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(8px)">
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:18px;height:18px;border:1.5px solid #6366f1;border-radius:4px;display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;background:#6366f1;border-radius:1px"></div></div>
                    <div style="width:50px;height:8px;background:#ffffff;border-radius:4px"></div>
                  </div>
                  <div style="display:flex;gap:8px">
                    <div style="width:20px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px"></div>
                    <div style="width:20px;height:4px;background:rgba(255,255,255,0.2);border-radius:2px"></div>
                  </div>
                  <div style="width:44px;height:16px;border:1.5px solid rgba(255,255,255,0.3);border-radius:6px"></div>
                </div>
                <div style="margin-top:12px;font-size:10px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.05em">Premium Dark</div>
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
