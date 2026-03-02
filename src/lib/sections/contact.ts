// sections/contact.ts
import { makeBlock } from "../blockConfig";
import type { SectionTemplate } from "@/@Types";

// ─── Helper: build a frosted info card (hero block) ─────────────────────────
function infoCard(bgColor: string, iconName: string, iconColor: string, title: string, line1: string, line2: string) {
  const card = makeBlock("hero", {
    bgColor, borderRadius: "16px", padding: "2rem 1.5rem",
    minHeight: "auto", align: "center", textColor: "#fff",
  });
  card.props.childBlocks = [
    makeBlock("icon", { iconName, size: "36", color: iconColor, align: "center", padding: "0" }),
    makeBlock("text", { content: title, tag: "h4", fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc", align: "center", marginTop: "1rem" }),
    makeBlock("text", { content: `${line1}\n${line2}`, tag: "p", fontSize: "0.9rem", color: "#94a3b8", align: "center", lineHeight: "1.7", marginTop: "0.5rem" }),
  ];
  return card;
}

export const contactSections: SectionTemplate[] = [
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

  // ─── 2. Split — Info Left + Form Right ──────────────────────────────────
  {
    id: "contact-split",
    name: "Split Contact",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;display:flex;height:100%;background:var(--bg-secondary)">
      <div style="flex:1;padding:12px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--border)">
        <div style="font-size:10px;font-weight:700;color:var(--text);margin-bottom:4px">Get in touch</div>
        <div style="font-size:5px;color:var(--text-muted);margin-bottom:12px">Our team is ready to help you.</div>
        ${["Email Us", "Call Us"].map(l => `<div style="display:flex;align-items:center;gap:4px;margin-bottom:6px">
          <div style="width:12px;height:12px;border-radius:6px;background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:6px;color:var(--primary)">✉️</div>
          <div style="font-size:6px;color:var(--text)">${l}</div>
        </div>`).join("")}
      </div>
      <div style="flex:1;background:var(--surface);padding:12px;display:flex;flex-direction:column;justify-content:center">
        ${["", "", ""].map(() => `<div style="height:6px;background:var(--border);border-radius:2px;margin-bottom:4px"></div>`).join("")}
        <div style="height:10px;background:var(--primary);border-radius:2px;margin-top:6px"></div>
      </div>
    </div>`,
    create: () => {
      const container = makeBlock("container", {
        flexDirection: "row", gap: "0px", padding: "0px",
        bgColor: "var(--bg-secondary)", borderRadius: "16px", overflow: "hidden",
        border: "1px solid var(--border)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      });

      // Left Info Panel
      const infoCol = makeBlock("container", { flexDirection: "column", gap: "24px", padding: "48px", flex: "1", bgColor: "var(--bg-secondary)", borderRight: "1px solid var(--border)" });

      const emailRow = makeBlock("container", { flexDirection: "row", gap: "16px", alignItems: "center", padding: "0px", bgColor: "transparent" });
      emailRow.children = [infoCard("var(--surface)", "EnvelopeIcon", "var(--primary)", "Chat with sales", "sales@company.com", "")];

      const phoneRow = makeBlock("container", { flexDirection: "row", gap: "16px", alignItems: "center", padding: "0px", bgColor: "transparent" });
      phoneRow.children = [infoCard("var(--surface)", "PhoneIcon", "var(--primary)", "Call us", "+1 (555) 000-0000", "Mon-Fri from 8am to 5pm")];

      infoCol.children = [
        makeBlock("heading", { level: "h2", text: "Let's talk", textColor: "var(--text)", fontSize: "36px" }),
        makeBlock("paragraph", { text: "Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.", textColor: "var(--text-muted)", fontSize: "16px" }),
        emailRow,
        phoneRow
      ];

      // Right Form Panel
      const formCol = makeBlock("container", { flexDirection: "column", gap: "24px", padding: "48px", flex: "1", bgColor: "var(--surface)" });
      formCol.children = [makeBlock("contactForm", {
        buttonText: "Send message", buttonBg: "var(--primary)", buttonTextColor: "#ffffff",
        inputBg: "var(--bg-secondary)", inputTextColor: "var(--text)",
        showLabels: true,
      })];

      container.children = [infoCol, formCol];

      const root = makeBlock("container", {
        padding: "80px 20px", bgColor: "var(--background)", alignItems: "center"
      });
      root.children = [container];
      return root;
    },
  },

  // ─── 3. Light Minimal — Centered Form ───────────────────────────────────────
  {
    id: "contact-minimal-center",
    name: "Minimal Centered Form",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;padding:12px;background:#f8fafc;border-radius:8px;text-align:center">
      <div style="font-size:10px;font-weight:800;color:#0f172a;margin-bottom:3px">Contact Us</div>
      <div style="font-size:6px;color:#64748b;margin-bottom:8px">Fill out the form and we'll get back to you.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:4px">
        <div style="height:8px;background:#e2e8f0;border-radius:3px"></div>
        <div style="height:8px;background:#e2e8f0;border-radius:3px"></div>
      </div>
      <div style="height:8px;background:#e2e8f0;border-radius:3px;margin-bottom:4px"></div>
      <div style="height:16px;background:#e2e8f0;border-radius:3px;margin-bottom:6px"></div>
      <div style="height:9px;background:#6366f1;border-radius:4px"></div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "6rem 2rem", maxWidth: "720px" });
      const formCard = makeBlock("contactForm", {
        bgColor: "#ffffff", padding: "3.5rem", borderRadius: "24px",
        titleText: "Contact Us", titleColor: "#0f172a",
        subtitleText: "Fill out the form below and we'll get back to you within 24 hours.", subtitleColor: "#64748b",
        inputBg: "#f8fafc", inputBorderColor: "#e2e8f0", inputTextColor: "#0f172a", labelColor: "#374151",
        buttonBg: "linear-gradient(to right, #6366f1, #8b5cf6)", buttonTextColor: "#ffffff", buttonFullWidth: true
      });
      root.props.childBlocks = [formCard];
      return root;
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

  // ─── 7. Opening Hours + Location Card ────────────────────────────────────────
  {
    id: "contact-hours-card",
    name: "Hours & Location Card",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;padding:10px;background:#f8fafc;border-radius:8px">
      <div style="display:flex;gap:6px">
        <div style="flex:1;background:#fff;border-radius:6px;padding:8px;border:1px solid #e2e8f0">
          <div style="font-size:8px;font-weight:700;color:#0f172a;margin-bottom:5px">Opening Hours</div>
          ${[["Mon–Fri", "9:00am–6:00pm"], ["Sat", "10:00am–4:00pm"], ["Sun", "Closed"]].map(([d, h]) =>
      `<div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:5px;color:#64748b">${d}</span>
              <span style="font-size:5px;color:#0f172a;font-weight:600">${h}</span>
            </div>`
    ).join("")}
        </div>
        <div style="flex:1;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:6px;min-height:60px;display:flex;align-items:center;justify-content:center">
          <div style="font-size:16px">📍</div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f8fafc", padding: "5rem 2rem" });
      const cols = makeBlock("columns", { leftWidth: "50", gap: "2rem" });

      // Left — Hours card
      const hoursCard = makeBlock("hero", {
        bgColor: "#ffffff", padding: "2.5rem", minHeight: "auto",
        borderRadius: "20px", align: "left", textColor: "#0f172a",
      });

      const row1 = makeBlock("columns", { leftWidth: "50", gap: "0" });
      row1.props.col0 = [makeBlock("text", { content: "Monday – Friday", tag: "p", fontSize: "0.9rem", color: "#64748b" })];
      row1.props.col1 = [makeBlock("text", { content: "9:00am – 6:00pm", tag: "p", fontSize: "0.9rem", fontWeight: "700", color: "#0f172a", align: "right" })];

      const row2 = makeBlock("columns", { leftWidth: "50", gap: "0" });
      row2.props.col0 = [makeBlock("text", { content: "Saturday", tag: "p", fontSize: "0.9rem", color: "#64748b" })];
      row2.props.col1 = [makeBlock("text", { content: "10:00am – 4:00pm", tag: "p", fontSize: "0.9rem", fontWeight: "700", color: "#0f172a", align: "right" })];

      const row3 = makeBlock("columns", { leftWidth: "50", gap: "0" });
      row3.props.col0 = [makeBlock("text", { content: "Sunday", tag: "p", fontSize: "0.9rem", color: "#64748b" })];
      row3.props.col1 = [makeBlock("text", { content: "Closed", tag: "p", fontSize: "0.9rem", fontWeight: "700", color: "#ef4444", align: "right" })];

      hoursCard.props.childBlocks = [
        makeBlock("icon", { iconName: "Clock", size: "40", color: "#6366f1", align: "left", padding: "0" }),
        makeBlock("text", { content: "Opening Hours", tag: "h3", fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginTop: "1rem" }),
        makeBlock("divider", { marginY: "1.25rem", color: "#f1f5f9" }),
        row1,
        makeBlock("divider", { marginY: "0.5rem", color: "#f8fafc" }),
        row2,
        makeBlock("divider", { marginY: "0.5rem", color: "#f8fafc" }),
        row3,
        makeBlock("divider", { marginY: "1.25rem", color: "#f1f5f9" }),
        makeBlock("text", { content: "📍  123 Bay Fremont St, San Francisco, CA 94102", tag: "p", fontSize: "0.9rem", color: "#64748b" }),
        makeBlock("text", { content: "📞  (415) 555-7890", tag: "p", fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }),
        makeBlock("text", { content: "✉️  hello@company.com", tag: "p", fontSize: "0.9rem", color: "#64748b", marginTop: "0.5rem" }),
      ];

      // Right — Location visual card
      const mapCard = makeBlock("hero", {
        bgColor: "#6366f1",
        bgImage: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        padding: "3rem 2rem", minHeight: "100%",
        borderRadius: "20px", align: "center", textColor: "#ffffff",
      });
      mapCard.props.childBlocks = [
        makeBlock("icon", { iconName: "MapPin", size: "48", color: "#ffffff", align: "center", padding: "0" }),
        makeBlock("text", { content: "Find Us Here", tag: "h3", fontSize: "1.75rem", fontWeight: "800", color: "#ffffff", align: "center", marginTop: "1rem" }),
        makeBlock("text", { content: "123 Bay Fremont St\nSan Francisco, CA 94102", tag: "p", fontSize: "1rem", color: "#e0e7ff", align: "center", lineHeight: "1.7" }),
        makeBlock("button", { label: "Open in Google Maps →", variant: "solid", bgColor: "#ffffff", textColor: "#6366f1", size: "md", align: "center", marginTop: "2rem", borderRadius: "9999px", fontWeight: "700" }),
      ];

      cols.props.col0 = [hoursCard];
      cols.props.col1 = [mapCard];
      root.props.childBlocks = [cols];
      return root;
    },
  },

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

  // ─── 9. Hero Split + Service Cards Below ─────────────────────────────────────
  // Inspired by screenshot 2: dark-navy split (text left + image right), then light-gray bg with card grid
  {
    id: "contact-hero-cards-below",
    name: "Hero Split + Service Cards",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;border-radius:8px;overflow:hidden">
      <div style="background:#0a1628;padding:10px 10px 8px;display:flex;gap:6px;align-items:center">
        <div style="flex:1.2">
          <div style="font-size:9px;font-weight:800;color:#fff;margin-bottom:3px">Get in touch</div>
          <div style="font-size:5px;color:#94a3b8;line-height:1.4">Got a question? We'll connect you with the right expert.</div>
        </div>
        <div style="flex:1;background:#1e3a5f;border-radius:4px;height:40px"></div>
      </div>
      <div style="background:#f1f4f8;padding:7px;display:flex;gap:4px">
        ${["📋", "💰", "🏢"].map(e => `<div style="background:#fff;border-radius:4px;padding:5px;flex:1;border:1px solid #e5e7eb"><div style="font-size:8px;margin-bottom:2px">${e}</div><div style="font-size:4.5px;font-weight:700;color:#0a1628">Service</div><div style="font-size:4px;color:#64748b;margin-top:1px">Description text here for this card.</div></div>`).join("")}
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#f1f4f8", padding: "0" });

      // Top — navy hero split
      const topHero = makeBlock("container", { bgColor: "#0d1f3c", padding: "4rem 2rem" });
      const splitCols = makeBlock("columns", { leftWidth: "55", gap: "3rem" });
      splitCols.props.col0 = [
        makeBlock("text", { content: "Get in touch", tag: "h2", fontSize: "3rem", fontWeight: "900", color: "#ffffff", lineHeight: "1.1" }),
        makeBlock("text", { content: "Got a question? You might find the answer in our Help Centre. Otherwise, see all the ways you can speak to our team below.", tag: "p", fontSize: "1rem", color: "#94a3b8", lineHeight: "1.7", marginTop: "1rem" }),
        makeBlock("button", { label: "Visit Help Centre →", variant: "outline", borderColor: "#ffffff", textColor: "#ffffff", size: "md", align: "left", marginTop: "2rem", borderRadius: "8px", fullWidth: false }),
      ];
      splitCols.props.col1 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
          alt: "Support team", borderRadius: "16px", aspectRatio: "4/3", objectFit: "cover",
        }),
      ];
      topHero.props.childBlocks = [splitCols];

      // Bottom — light bg with 3 service cards (team block)
      const bottomSection = makeBlock("container", { bgColor: "#f1f4f8", padding: "4rem 2rem" });
      const serviceCards = makeBlock("team", {
        title: "", subtitle: "", bgColor: "transparent",
        layout: "grid", columns: 3, gap: "1.5rem",
        cardStyle: "raised", cardBg: "#ffffff", cardRadius: "12px",
        cardPadding: "2rem", cardShadow: "0 2px 12px rgba(0,0,0,0.06)",
        align: "left", nameColor: "#0d1f3c", roleColor: "#3b82f6", descColor: "#64748b",
        imageStyle: "circle", imageSize: "0px",
        members: [
          { id: "sc1", name: "Existing customers", role: "📋", description: "Already a customer? Our support team will be able to answer your questions.", image: "", socials: {} },
          { id: "sc2", name: "New savings customers", role: "💰", description: "Looking to open a business or personal savings account? Speak to our new accounts team.", image: "", socials: {} },
          { id: "sc3", name: "New business finance customers", role: "🏢", description: "Interested in a commercial mortgage or asset finance? We'll connect you with a relationship manager.", image: "", socials: {} },
        ],
      });
      bottomSection.props.childBlocks = [serviceCards];

      root.props.childBlocks = [topHero, bottomSection];
      return root;
    },
  },

  // ─── 10. Info Panel + Image + Form (3-zone) ───────────────────────────────────
  // Inspired by screenshot 3: floating info card left, image center, white form card right
  {
    id: "contact-info-image-form",
    name: "Info + Image + Form",
    category: "Contact",
    preview: `<div style="font-family:sans-serif;display:flex;border-radius:8px;overflow:hidden;min-height:80px;background:#4caf50">
      <div style="flex:0.8;padding:6px;display:flex;align-items:center">
        <div style="background:#fff;border-radius:6px;padding:6px;width:100%">
          <div style="display:flex;align-items:center;gap:2px;margin-bottom:3px"><span style="font-size:6px">📍</span><span style="font-size:5.5px;font-weight:700;color:#111">Location</span></div>
          <div style="display:flex;align-items:center;gap:2px;margin-bottom:3px"><span style="font-size:6px">📞</span><span style="font-size:5.5px;font-weight:700;color:#111">Phone</span></div>
          <div style="display:flex;align-items:center;gap:2px"><span style="font-size:6px">🕐</span><span style="font-size:5.5px;font-weight:700;color:#111">Hours</span></div>
        </div>
      </div>
      <div style="flex:1;background:#388e3c;opacity:0.7"></div>
      <div style="flex:1;padding:6px;display:flex;align-items:center">
        <div style="background:#fff;border-radius:6px;padding:6px;width:100%">
          <div style="font-size:6px;font-weight:700;color:#111;margin-bottom:3px">Contact Form</div>
          ${["", "", ""].map(() => `<div style="height:4px;background:#f3f4f6;border-radius:2px;margin-bottom:2px"></div>`).join("")}
          <div style="height:6px;background:#1a1a2e;border-radius:10px;margin-top:3px"></div>
        </div>
      </div>
    </div>`,
    create: () => {
      const root = makeBlock("container", { bgColor: "#5cb85c", padding: "4rem 2rem" });

      // 2-col: left = info card floating | right = image + form as nested columns
      const outerCols = makeBlock("columns", { leftWidth: "30", gap: "2rem" });

      // Left — floating white info card
      const infoCard = makeBlock("hero", {
        bgColor: "#ffffff", padding: "2rem 1.75rem", minHeight: "auto",
        borderRadius: "20px", align: "left", textColor: "#111",
      });
      infoCard.props.childBlocks = [
        makeBlock("text", { content: "Contact Info", tag: "h4", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }),
        makeBlock("divider", { marginY: "1rem", color: "#f1f5f9" }),
        makeBlock("icon", { iconName: "MapPin", size: "22", color: "#3b82f6", align: "left", padding: "0" }),
        makeBlock("text", { content: "Location", tag: "p", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a", marginTop: "0.35rem" }),
        makeBlock("text", { content: "The Courtyard, Al Quoz 1\nColorado, USA", tag: "p", fontSize: "0.8rem", color: "#64748b", lineHeight: "1.5" }),
        makeBlock("divider", { marginY: "1rem", color: "#f1f5f9" }),
        makeBlock("icon", { iconName: "Phone", size: "22", color: "#3b82f6", align: "left", padding: "0" }),
        makeBlock("text", { content: "Phone", tag: "p", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a", marginTop: "0.35rem" }),
        makeBlock("text", { content: "+1 (912) 567-8987\n+1 (912) 525-2336", tag: "p", fontSize: "0.8rem", color: "#64748b", lineHeight: "1.5" }),
        makeBlock("divider", { marginY: "1rem", color: "#f1f5f9" }),
        makeBlock("icon", { iconName: "Clock", size: "22", color: "#3b82f6", align: "left", padding: "0" }),
        makeBlock("text", { content: "Hours", tag: "p", fontSize: "0.85rem", fontWeight: "700", color: "#0f172a", marginTop: "0.35rem" }),
        makeBlock("text", { content: "Mon–Fri: 9am–6pm\nSat: 10am–4pm", tag: "p", fontSize: "0.8rem", color: "#64748b", lineHeight: "1.5" }),
      ];

      // Right — inner 2-col: image left, form card right
      const innerCols = makeBlock("columns", { leftWidth: "45", gap: "1.5rem" });
      innerCols.props.col0 = [
        makeBlock("image", {
          src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=80",
          alt: "Office", borderRadius: "16px", objectFit: "cover", aspectRatio: "2/3",
        }),
      ];

      const formCard = makeBlock("contactForm", {
        bgColor: "#ffffff", padding: "2rem 1.75rem", borderRadius: "20px",
        titleText: "Contact Form", titleColor: "#0f172a",
        inputBg: "#f8fafc", inputBorderColor: "#e2e8f0",
        buttonBg: "#1a1a2e", buttonTextColor: "#ffffff", buttonFullWidth: true, buttonBorderRadius: "9999px"
      });
      innerCols.props.col1 = [formCard];

      outerCols.props.col0 = [infoCard];
      outerCols.props.col1 = [innerCols];
      root.props.childBlocks = [outerCols];
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
      const glassCard = makeBlock("hero", {
        bgColor: "rgba(255,255,255,0.06)",
        borderRadius: "24px", padding: "2.5rem",
        minHeight: "auto", align: "left", textColor: "#ffffff",
      });

      const glassCols = makeBlock("columns", { leftWidth: "38", gap: "3rem" });

      // Left — Contact Information
      glassCols.props.col0 = [
        makeBlock("text", { content: "Contact Information", tag: "h3", fontSize: "1.4rem", fontWeight: "800", color: "#ffffff", lineHeight: "1.2" }),
        makeBlock("text", { content: "Fill up the form and our team will get back to you within 24 hours.", tag: "p", fontSize: "0.875rem", color: "#94a3b8", lineHeight: "1.6", marginTop: "0.75rem" }),
        makeBlock("divider", { marginY: "1.75rem", color: "rgba(255,255,255,0.08)" }),
        makeBlock("icon", { iconName: "Mail", size: "18", color: "#94a3b8", align: "left", padding: "0" }),
        makeBlock("text", { content: "contact@company.com", tag: "p", fontSize: "0.875rem", color: "#e2e8f0", marginTop: "0.35rem" }),
        makeBlock("divider", { marginY: "1rem", color: "rgba(255,255,255,0.08)" }),
        makeBlock("icon", { iconName: "MapPin", size: "18", color: "#94a3b8", align: "left", padding: "0" }),
        makeBlock("text", { content: "08 Triveni Tower 3rd Floor\nCentral Avenue, Nagpur 440002, India", tag: "p", fontSize: "0.875rem", color: "#e2e8f0", lineHeight: "1.5", marginTop: "0.35rem" }),
        makeBlock("divider", { marginY: "1.5rem", color: "rgba(255,255,255,0.08)" }),
        makeBlock("text", { content: "Follow us", tag: "p", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "0.08em" }),
        makeBlock("text", { content: "🐦  𝕏 Twitter  |  📸 Instagram  |  💼 LinkedIn", tag: "p", fontSize: "0.8rem", color: "#c7d2fe", marginTop: "0.5rem" }),
      ];

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
