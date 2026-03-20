// sections/contact.ts
import { makeBlock } from "../config/blocks";
import type { SectionTemplate } from "@/@Types";

// ─── Helper: build a frosted info card (container block) ────────────────────
function infoCard(bgColor: string, iconName: string, iconColor: string, title: string, line1: string, line2: string) {
  const card = makeBlock("container", {
    bgColor, borderRadius: "16px", padding: "1.5rem",
    align: "center",
  });
  card.props.childBlocks = [
    makeBlock("icon", { iconName, size: "32", color: iconColor, align: "center", padding: "0" }),
    makeBlock("text", { content: title, tag: "h4", fontSize: "1.1rem", bold: true, color: "var(--text)", align: "center", marginTop: "0.75rem" }),
    makeBlock("text", { content: `${line1}\n${line2}`, tag: "p", fontSize: "0.9rem", color: "var(--text-muted)", align: "center", lineHeight: "1.5", marginTop: "0.25rem" }),
  ];
  return card;
}

export const contactSections: SectionTemplate[] = [
  // ─── 8. Teal Simple Form + Icon Cards Below ───────────────────────────────────
  // Inspired by screenshot 1: white top with email/name inputs → teal footer with 3 circle-icon cards
  {
    id: "contact-teal-icon-cards",
    name: "Simple Form & Icon Cards",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;border-radius:8px;overflow:hidden">
      <div style="background:#fff;padding:10px;text-align:center">
        <div style="font-size:9px;font-weight:800;color:#111;margin-bottom:2px">Contact Us</div>
        <div style="font-size:5px;color:#555;margin-bottom:6px">Any questions? Just write us!</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px">
          <div style="height:7px;background:#f0f0f0;border-radius:10px"></div>
          <div style="height:7px;background:#f0f0f0;border-radius:10px"></div>
        </div>
        <div style="height:8px;background:#00bcd4;border-radius:10px"></div>
      </div>
      <div style="background:#e0f7fa;padding:8px;display:flex;gap:4px;justify-content:center">
        ${["🏃", "📞", "📍"].map(e => `<div style="text-align:center;flex:1"><div style="width:14px;height:14px;background:#00bcd4;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 2px;font-size:7px">${e}</div><div style="font-size:4px;font-weight:700;color:#111">Info</div></div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#ffffff", padding: "0" });

      // Top — white form section
      const topSection = makeBlock("hero", {
        bgColor: "#ffffff", padding: "5rem 2rem 4rem", minHeight: "auto",
        align: "center", textColor: "#111111",
      });

      const formBlock = makeBlock("contactForm", {
        bgColor: "transparent", padding: "0",
        showLastName: false, firstNameLabel: "Name",
        inputBg: "#f9fafb", inputBorderColor: "#e5e7eb", inputFocusBorderColor: "#00bcd4",
        buttonBg: "#00bcd4", buttonTextColor: "#ffffff", buttonFullWidth: true, buttonBorderRadius: "9999px"
      });

      topSection.props.childBlocks = [
        makeBlock("text", { content: "Contact Us", tag: "h2", fontSize: "3rem", fontWeight: "900", color: "#111111", align: "center" }),
        makeBlock("text", { content: "Any questions or remarks? Just write us a message!", tag: "p", fontSize: "1.1rem", color: "#555555", align: "center", lineHeight: "1.6", marginTop: "0.5rem" }),
        makeBlock("divider", { marginY: "2rem", color: "#e5e7eb" }),
        formBlock,
      ];

      // Bottom — teal/light section with 3 icon cards
      const bottomSection = makeBlock("container", { bgColor: "#e0f7fa", padding: "4rem 2rem" });
      const infoTeam = makeBlock("team", {
        title: "", subtitle: "", bgColor: "transparent",
        layout: "grid", columns: 3, gap: "2rem",
        cardStyle: "raised", cardBg: "#f5feff", cardRadius: "12px",
        cardPadding: "2rem 1.5rem", cardShadow: "0 2px 16px rgba(0,188,212,0.12)",
        align: "center", nameColor: "#111111", roleColor: "#00838f", descColor: "#4b5563",
        imageStyle: "circle", imageSize: "64px", imageRadius: "50%",
        members: [
          { id: "ic1", name: "ABOUT CLUB", role: "🏃", description: "Running Guide\nWorkouts", image: "https://via.placeholder.com/64/00bcd4/ffffff?text=🏃", socials: {} },
          { id: "ic2", name: "PHONE (LANDLINE)", role: "📞", description: "+ 912 3 567 8987\n+ 912 5 252 3336", image: "https://via.placeholder.com/64/00bcd4/ffffff?text=📞", socials: {} },
          { id: "ic3", name: "OUR OFFICE LOCATION", role: "📍", description: "The Interior Design Studio\nThe Courtyard, Al Quoz 1, USA", image: "https://via.placeholder.com/64/00bcd4/ffffff?text=📍", socials: {} },
        ],
      });
      bottomSection.props.childBlocks = [infoTeam];

      root.props.childBlocks = [topSection, bottomSection];
      return root;
    },
  },
  // ─── 1. Simple CTA Banner ────────────────────────────────────────────────────
  {
    id: "cta-banner",
    name: "Simple CTA Banner",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;padding:14px;text-align:center;margin:6px;border-radius:8px">
      <div style="background:var(--primary);padding:10px;border-radius:6px;text-align:center">
        <div style="font-size:10px;font-weight:800;color:#fff;margin-bottom:4px">Ready to get started?</div>
        <div style="font-size:7px;color:#c7d2fe;margin-bottom:8px">Join thousands of creators.</div>
        <div style="font-size:7px;background:#fff;color:var(--primary);padding:3px 10px;border-radius:4px;display:inline-block;font-weight:700">Create Free Account</div>
      </div>
    </div>`,
    create: () => {
      const cta = makeBlock("hero", {
        align: "center", bgColor: "#4f46e5", textColor: "#ffffff",
        padding: "6rem 2rem", minHeight: "auto", borderRadius: "24px",
      });
      cta.props.childBlocks = [
        makeBlock("text", { content: "Ready to get started?", tag: "h2", fontSize: "3rem", bold: true, align: "center" }),
        makeBlock("text", { content: "Join thousands of creators building on PageCraft today.", tag: "p", fontSize: "1.25rem", align: "center", opacity: 0.9 }),
        makeBlock("button", { label: "Create Your Free Account", variant: "solid", bgColor: "#ffffff", textColor: "#4f46e5", size: "lg", align: "center", marginTop: "2rem", borderRadius: "8px" }),
      ];
      const container = makeBlock("container", { padding: "4rem 2rem" });
      container.props.childBlocks = [cta];
      return container;
    },
  },

  // ─── 4. Gradient Hero CTA with 3 info cards ──────────────────────────────────
  {
    id: "contact-gradient-cta",
    name: "Gradient CTA with Cards",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6,#ec4899);border-radius:8px;text-align:center">
      <div style="font-size:10px;font-weight:800;color:#fff;margin-bottom:3px">Let's Work Together</div>
      <div style="font-size:6px;color:#e0e7ff;margin-bottom:8px">Start your project with us today.</div>
      <div style="display:flex;gap:4px;justify-content:center">
        ${["📍", "✉️", "📞"].map(e => `<div style="background:rgba(255,255,255,0.15);border-radius:4px;padding:4px 6px;font-size:9px">${e}</div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("hero", {
        bgColor: "#6366f1",
        bgImage: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
        textColor: "#ffffff", padding: "7rem 2rem", minHeight: "auto", align: "center",
      });

      // 3 info cards using team layout
      const cardsTeam = makeBlock("team", {
        title: "", subtitle: "", bgColor: "transparent",
        layout: "grid", columns: 3, gap: "1.5rem",
        cardStyle: "filled", cardBg: "rgba(255,255,255,0.12)", cardRadius: "16px", cardPadding: "2rem 1.5rem",
        align: "center", nameColor: "#ffffff", roleColor: "#e0e7ff", descColor: "#c7d2fe",
        members: [
          {
            id: "c1", name: "Our Office", role: "📍",
            description: "123 Bay Fremont St\nSan Francisco, CA 94102",
            image: "", socials: {}
          },
          {
            id: "c2", name: "Email Us", role: "✉️",
            description: "hello@company.com\nsupport@company.com",
            image: "", socials: {}
          },
          {
            id: "c3", name: "Call Us", role: "📞",
            description: "(415) 555-7890\nMon–Fri, 9am–6pm PST",
            image: "", socials: {}
          },
        ],
      });

      root.props.childBlocks = [
        makeBlock("text", { content: "Let's Work Together", tag: "h2", fontSize: "3.5rem", fontWeight: "900", color: "#ffffff", align: "center", lineHeight: "1.1" }),
        makeBlock("text", { content: "Whether you have a question, a project idea, or want to say hi — we're here for you.", tag: "p", fontSize: "1.15rem", color: "#e0e7ff", align: "center", lineHeight: "1.7", marginTop: "1rem" }),
        cardsTeam,
        makeBlock("button", { label: "Start a Conversation", variant: "solid", bgColor: "#ffffff", textColor: "#6366f1", size: "xl", align: "center", marginTop: "2.5rem", borderRadius: "9999px", fullWidth: false, fontWeight: "700" }),
      ];
      return root;
    },
  },

  // ─── 5. Image Left + Contact Form Right ──────────────────────────────────────
  {
    id: "contact-image-split",
    name: "Image Split Contact",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;display:flex;border-radius:8px;overflow:hidden;min-height:80px">
      <div style="flex:1;background:linear-gradient(to bottom,#a78bfa,#6366f1);min-height:80px;position:relative">
        <div style="position:absolute;inset:0;background:#6366f1;opacity:0.7"></div>
      </div>
      <div style="flex:1;padding:10px;background:#fff">
        <div style="font-size:9px;font-weight:800;color:#0f172a;margin-bottom:3px">Contact Us</div>
        ${["", "", "", ""].map(() => `<div style="height:5px;background:#f1f5f9;border-radius:2px;margin-bottom:3px"></div>`).join("")}
        <div style="height:8px;background:#6366f1;border-radius:2px;margin-top:4px"></div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#ffffff", padding: "0" });
      const cols = makeBlock("columns", { leftWidth: "45", gap: "0" });

      cols.props.col0 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
          alt: "Contact office", objectFit: "cover",
          aspectRatio: "3/4",
        }),
      ];

      const rightPane = makeBlock("hero", {
        bgColor: "#ffffff", padding: "5rem 4rem", minHeight: "auto",
        borderRadius: "0", align: "left", textColor: "#0f172a",
      });
      const formBlock = makeBlock("contactForm", {
        bgColor: "transparent", padding: "0",
        titleText: "Contact Us", titleColor: "#0f172a",
        subtitleText: "Have a question or want to work together? Drop us a line.", subtitleColor: "#64748b",
        inputBg: "#f8fafc", inputBorderColor: "#e2e8f0",
        buttonBg: "#0f172a", buttonTextColor: "#ffffff", buttonFullWidth: false, buttonAlign: "left"
      });
      rightPane.props.childBlocks = [
        formBlock,
        makeBlock("divider", { marginY: "2rem", color: "#f1f5f9" }),
        makeBlock("text", { content: "📍  123 Bay Fremont St, San Francisco, CA 94102", tag: "p", fontSize: "0.875rem", color: "#64748b" }),
        makeBlock("text", { content: "📞  (415) 555-7890", tag: "p", fontSize: "0.875rem", color: "#64748b", marginTop: "0.4rem" }),
        makeBlock("text", { content: "✉️  hello@company.com", tag: "p", fontSize: "0.875rem", color: "#64748b", marginTop: "0.4rem" }),
      ];
      cols.props.col1 = [rightPane];
      root.props.childBlocks = [cols];
      return root;
    },
  },

  // ─── 11. Dark Glassmorphism ──────────────────────────────────────────────────
  // Inspired by screenshot 4: very dark bg with colorful blob orbs, big title, glass card
  {
    id: "contact-glassmorphism",
    name: "Dark Glassmorphism",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;background:#0d0d1a;border-radius:8px;padding:10px;position:relative;overflow:hidden">
      <div style="position:absolute;width:30px;height:30px;border-radius:50%;background:radial-gradient(#a855f7,transparent);top:-5px;right:10px;opacity:0.7"></div>
      <div style="position:absolute;width:20px;height:20px;border-radius:50%;background:radial-gradient(#06b6d4,transparent);bottom:5px;left:5px;opacity:0.7"></div>
      <div style="text-align:center;margin-bottom:6px">
        <div style="font-size:10px;font-weight:900;color:#fff">Contact Us</div>
        <div style="font-size:5px;color:#94a3b8">Any question? Just write us!</div>
      </div>
      <div style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:6px;display:flex;gap:5px">
        <div style="flex:0.8">
          <div style="font-size:5.5px;font-weight:700;color:#fff;margin-bottom:3px">Contact Info</div>
          <div style="font-size:4.5px;color:#94a3b8">✉ contact@company.com</div>
          <div style="font-size:4.5px;color:#94a3b8;margin-top:1px">📍 Central Avenue, India</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:2px">
          ${["", "", ""].map(() => `<div style="height:4px;background:rgba(255,255,255,0.1);border-radius:2px;border-bottom:1px solid rgba(255,255,255,0.2)"></div>`).join("")}
          <div style="height:5px;background:rgba(255,255,255,0.3);border-radius:3px;margin-top:2px"></div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("hero", {
        bgColor: "#0d0d1a", textColor: "#ffffff",
        padding: "6rem 2rem", minHeight: "auto", align: "center",
      });

      // Glass card — split: info left + form right
      const glassCard = makeBlock("container", {
        bgColor: "rgba(255,255,255,0.06)",
        borderRadius: "24px", padding: "2.5rem",
        align: "left",
      });

      const glassCols = makeBlock("columns", { leftWidth: "38", gap: "3rem" });

      const rightPanel = makeBlock("contactForm", {
        bgColor: "transparent", padding: "0",
        inputBg: "rgba(255,255,255,0.05)", inputBorderColor: "rgba(255,255,255,0.15)", inputTextColor: "#ffffff", labelColor: "#94a3b8",
        buttonBg: "rgba(255,255,255,0.85)", buttonTextColor: "#0d0d1a", buttonFullWidth: false, buttonAlign: "right",
        showLastName: true,
      });

      glassCols.props.col1 = [rightPanel];
      glassCard.props.childBlocks = [glassCols];

      root.props.childBlocks = [
        makeBlock("text", { content: "Contact Us", tag: "h2", fontSize: "5rem", fontWeight: "900", color: "#ffffff", align: "center", lineHeight: "1" }),
        makeBlock("text", { content: "Any question or remarks? Just write us a message!", tag: "p", fontSize: "1rem", color: "#94a3b8", align: "center", marginTop: "0.5rem" }),
        glassCard,
      ];
      return root;
    },
  },
];
