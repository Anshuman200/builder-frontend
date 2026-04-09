// sections/footer.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/types";

export const footerSections: SectionTemplate[] = [
  {
    id: "footer-simple",
    name: "Simple Footer",
    category: "Footer",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--surface);border:1px solid var(--border)">
      <div style="display:flex;gap:12px;margin-bottom:8px">
        <div style="flex:1">
          <div style="font-size:8px;font-weight:700;color:var(--text);margin-bottom:4px">Company Logo</div>
          <div style="font-size:6px;color:var(--text-muted)">Build beautiful pages.</div>
        </div>
        ${["Company", "Quick Link"].map(c => `<div>
          <div style="font-size:5px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:3px">${c}</div>
          <div style="font-size:5px;color:var(--text-subtle);margin-bottom:2px">Pricing</div>
          <div style="font-size:5px;color:var(--text-subtle)">Resources</div>
        </div>`).join("")}
      </div>
      <div style="border-top:1px solid var(--border);padding-top:6px;font-size:5px;color:var(--text-subtle);text-align:center">© 2025 Company. All rights reserved.</div>
    </div>`,
    create: () => makeBlock("footer", {
      bgColor: "var(--surface)", textColor: "var(--text)", padding: "48px 32px",
      description: "The easiest way to build pages.",
      copyright: `© ${new Date().getFullYear()} Company. All rights reserved.`,
      links: [{ id: "1", label: "Privacy", url: "#" }, { id: "2", label: "Terms of Use", url: "#" }],
    }),
  },
  {
    id: "footer-subscribe",
    name: "Footer Subscribe",
    category: "Footer",
    preview: `<div style="font-family:sans-serif;padding:12px;background:var(--bg-secondary)">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <div style="font-size:7px;font-weight:700;color:var(--text);flex:1">Subscribe Newsletters</div>
        <div style="display:flex;gap:3px">
          <div style="background:var(--surface);border:1px solid var(--border);border-radius:3px;padding:3px 6px;font-size:6px;color:var(--text-muted)">Enter email</div>
          <div style="background:var(--primary);color:#fff;border-radius:3px;padding:3px 6px;font-size:6px;font-weight:600">SUB</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;font-size:6px;color:var(--text-muted)">About &nbsp; Features &nbsp; Pricing</div>
    </div>`,
    create: () => makeBlock("footer", {
      bgColor: "var(--bg-secondary)", textColor: "var(--text)", padding: "32px",
      description: "",
      copyright: `© ${new Date().getFullYear()} Company name. All rights reserved.`,
      links: [{ id: "1", label: "About us", url: "#" }, { id: "2", label: "Features", url: "#" }, { id: "3", label: "Pricing", url: "#" }],
    }),
  },
];
