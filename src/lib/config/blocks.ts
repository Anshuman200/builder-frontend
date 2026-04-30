import type { Block, IconName, BlockConfig } from "@/types";
// lib/blockConfig.ts


// ─── Global Default Configurations ───────────────────────────────────────────
// Centralized defaults to allow easy global changes in the future
export const DEFAULT_CONFIG = {
  // Padding & Spacing
  padding: {
    section: "64px 24px",
    container: "24px",
    element: "16px 24px",
    mobile: "16px",
  },
  // Animations - Base
  animation: {
    type: "fade",
    duration: 0.5,
    delay: 0,
    playback: "once"
  },
  // Animations - Specific
  animationFade: {
    type: "fade",
    duration: 0.6,
    delay: 0,
    playback: "once"
  },
  animationZoom: {
    type: "zoom-in",
    duration: 0.8,
    delay: 0,
    playback: "once"
  },
  animationHeader: {
    type: "slide-down",
    duration: 0.6,
    delay: 0,
    playback: "once"
  },
  cardShadow: "0 16px 48px #00000033, 0 4px 16px #00000026",
};

// ✅ Block definitions
export const BLOCK_TYPES: BlockConfig[] = [
  {
    type: "header",
    label: "Header",
    icon: "LayoutPanelTop",
    defaultProps: {
      layout: "standard",       // standard | centered | split
      layoutWidth: "fluid",     // fluid | centered | narrow
      position: "static",       // static | sticky | fixed
      style: "solid",           // solid | glass | transparent
      bgColor: "var(--primary)",
      textColor: "var(--button-text)",
      padding: "16px 32px",
      tabletPadding: "16px 24px",
      mobilePadding: "12px 16px",
      fullWidth: true,

      // Logo text or image
      logoType: "text",         // text | image
      logoText: "Solario Forge",
      logoImage: "",
      logoWidth: "120px",

      // Nav links
      links: [],

      // CTA Button
      showCta: true,
      ctaText: "Get Started",
      ctaUrl: "#",
      ctaVariant: "solid",
      ctaBgColor: "var(--primary)",
      ctaTextColor: "var(--button-text)",

      // Animation
      animationType: DEFAULT_CONFIG.animationHeader.type,
      animationDuration: DEFAULT_CONFIG.animationHeader.duration,
      animationDelay: DEFAULT_CONFIG.animationHeader.delay,
      animationPlayback: DEFAULT_CONFIG.animationHeader.playback,
    },
  },
  {
    type: "hero",
    label: "Hero",
    icon: "Sparkles",
    defaultProps: {
      align: "center",
      layout: "fluid",
      bgColor: "var(--primary)",
      bgImage: "",
      bgOverlay: "var(--overlay)",
      textColor: "var(--button-text)",
      minHeight: "480px",
      padding: "4rem 2rem",
      tabletPadding: "",
      mobilePadding: "2rem 1rem",
      childBlocks: [],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "container",
    label: "Container",
    icon: "Square",
    defaultProps: {
      padding: "24px",
      tabletPadding: "",
      mobilePadding: "16px",
      bgColor: "",
      bgImage: "",
      maxWidth: "100%",
      borderRadius: "0px",
      contentAlign: "center",
      contentJustify: "center",
      childBlocks: [],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "text",
    label: "Text / Heading",
    icon: "DocumentText",
    defaultProps: {
      content: "Add your text here.",
      tag: "p",
      align: "left",
      fontSize: "1rem",
      mobileFontSize: "",
      tabletFontSize: "",
      color: "var(--text)",
      bold: false,
      italic: false,
      letterSpacing: "",
      lineHeight: "1.6",

      // Animation
      animationType: DEFAULT_CONFIG.animationFade.type,
      animationDuration: DEFAULT_CONFIG.animationFade.duration,
      animationDelay: DEFAULT_CONFIG.animationFade.delay,
      animationPlayback: DEFAULT_CONFIG.animationFade.playback,
    },
  },
  {
    type: "image",
    label: "Image",
    icon: "Photo",
    defaultProps: {
      src: "https://placehold.co/800x400/e2e8f0/64748b?text=Image",
      alt: "Image",
      width: "100%",
      height: "250px",
      objectFit: "cover",
      borderRadius: "0px",
      align: "center",
      caption: "",
      link: "",
      aspectRatio: "auto",

      // Animation
      animationType: DEFAULT_CONFIG.animationZoom.type,
      animationDuration: DEFAULT_CONFIG.animationZoom.duration,
      animationDelay: DEFAULT_CONFIG.animationZoom.delay,
      animationPlayback: DEFAULT_CONFIG.animationZoom.playback,
    },
  },
  {
    type: "button",
    label: "Button",
    icon: "MousePointerClick",
    defaultProps: {
      buttonText: "Click me",
      href: "#",
      // Appearance
      buttonVariant: "solid",    // solid | outline | ghost | soft | gradient | link
      size: "md",               // sm | md | lg | xl
      align: "left",
      fullWidth: true,
      // Colors
      buttonBg: "var(--primary)",
      buttonTextColor: "var(--button-text)",
      borderColor: "",
      // Gradient (only used when variant = gradient)
      gradientFrom: "#6366f1",
      gradientTo: "#8b5cf6",
      gradientDir: "to right",
      // Shape
      buttonBorderRadius: "9999px",   // pill by default
      borderWidth: "2px",
      // Text style
      fontWeight: "700",
      letterSpacing: "0.02em",
      fontSize: "",
      // Shadow
      shadow: "none",           // none | sm | md | lg | glow
      // Icon (Lucide icon name)
      iconLeft: "",
      iconRight: "",

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "Minus",
    defaultProps: {
      style: "solid",
      color: "",
      thickness: "1px",
      marginY: "1rem",

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "accordion",
    label: "FAQ / Accordion",
    icon: "ChevronDown",
    defaultProps: {
      items: [
        { id: "1", title: "What is your return policy?", content: "You can return any item within 30 days of purchase." },
        { id: "2", title: "Do you offer international shipping?", content: "Yes, we ship worldwide. Shipping costs vary by location." },
        { id: "3", title: "How can I contact support?", content: "You can reach our support team 24/7 via the contact form." },
      ],
      width: "100%",
      maxWidth: "100%",
      padding: "24px",
      bgColor: "transparent",
      itemBgColor: "var(--surface)",
      itemBorderColor: "var(--border)",
      itemRadius: "8px",
      titleColor: "var(--text)",
      contentColor: "var(--text-muted)",
      iconColor: "var(--primary)",
      divider: "line",     // line | none | seamless
      variant: "contained", // contained | separated | minimal
      titleSize: "16px",
      titleWeight: "600",
      descSize: "15px",
      iconStyle: "chevron",
      iconSize: "20px",

      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "icon",
    label: "Icon",
    icon: "Sparkle",
    defaultProps: {
      iconName: "Star",
      size: "24",
      color: "var(--primary)",
      align: "center",
      padding: "16px",

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "qrcode",
    label: "QR Code",
    icon: "QrCode",
    defaultProps: {
      value: "https://solarioforge.com",
      renderType: "canvas", // canvas | svg
      errorLevel: "M", // L | M | Q | H
      color: "#000000",
      bgColor: "transparent",
      icon: "",
      iconSize: 40,
      bordered: true,
      size: 160,
      align: "center",
      padding: "16px",

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "video",
    label: "Video",
    icon: "VideoCamera",
    defaultProps: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      autoPlay: false,
      loop: false,
      muted: false,
      controls: true,
      width: "100%",
      aspectRatio: "16/9",
      borderRadius: "8px",
      align: "center",
      padding: "16px",

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "features",
    label: "Features",
    icon: "LayoutList",
    defaultProps: {
      bgColor: "transparent",
      textColor: "var(--text)",
      padding: "64px 24px",
      tabletPadding: "48px 16px",
      mobilePadding: "32px 16px",
      title: "Our Features",
      subtitle: "What makes us different",
      align: "center",
      columns: 3,
      gap: "2rem",
      features: [
        { id: "1", title: "Fast", description: "Lightning fast performance.", icon: "Zap", iconType: "icon", image: "" },
        { id: "2", title: "Secure", description: "Your data is always safe.", icon: "Shield", iconType: "icon", image: "" },
        { id: "3", title: "Reliable", description: "99.9% uptime guaranteed.", icon: "CheckCircle", iconType: "icon", image: "" },
      ],

      // Card Styling
      cardStyle: "raised", // none | raised | outlined | filled
      cardBg: "#ffffff",
      cardRadius: "16px",
      cardHeight: "auto",
      cardPadding: "2rem 1.75rem",
      cardShadow: DEFAULT_CONFIG.cardShadow,

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "grid",
    label: "Layout Grid",
    icon: "Squares2X2",
    defaultProps: {
      columns: 3,
      gap: "1.5rem",
      padding: "24px",
      tabletPadding: "16px",
      mobilePadding: "12px",
      bgColor: "transparent",
      borderRadius: "0px",
      items: [
        { id: "slot-0", blocks: [] as Block[] },
        { id: "slot-1", blocks: [] as Block[] },
        { id: "slot-2", blocks: [] as Block[] },
      ],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "team",
    label: "Team",
    icon: "Users",
    defaultProps: {
      bgColor: "transparent",
      textColor: "var(--text)",
      padding: "64px 24px",
      tabletPadding: "48px 16px",
      mobilePadding: "32px 16px",
      title: "Meet Our Team",
      subtitle: "The people behind the magic",
      align: "center",

      // Layout
      layout: "grid", // grid | list
      columns: 3,
      gap: "2rem",

      // Card Styling
      cardStyle: "raised", // none | raised | outlined | filled
      cardBg: "#ffffff",
      cardRadius: "16px",
      cardHeight: "auto",
      cardPadding: "2rem 1.75rem",
      cardShadow: DEFAULT_CONFIG.cardShadow,

      // Image Styling
      imageStyle: "circle", // circle | square | cover | float
      imageSize: "120px",
      imageHeight: "240px",
      imageRadius: "50%",
      imagePosition: "center",

      // Colors
      nameColor: "var(--text)",
      roleColor: "var(--primary)",
      descColor: "var(--text-muted)",
      socialColor: "var(--text-subtle)",

      // Data
      members: [
        {
          id: "1",
          name: "Alex Smith",
          role: "Creative Leader",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
          socials: { twitter: "#", linkedin: "#", github: "#" }
        },
        {
          id: "2",
          name: "May Brown",
          role: "Sales Manager",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
          socials: { twitter: "#", linkedin: "#" }
        },
        {
          id: "3",
          name: "Ann Richmond",
          role: "Web Developer",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
          socials: { twitter: "#", github: "#" }
        }
      ],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    }
  },
  {
    type: "footer",
    label: "Footer",
    icon: "PanelBottom",
    defaultProps: {
      bgColor: "#ffffff",
      textColor: "var(--text)",
      padding: "48px 32px",
      tabletPadding: "32px 24px",
      mobilePadding: "24px 16px",
      fullWidth: true,

      // Branding
      logoType: "text",
      logoText: "Solario Forge",
      logoImage: "",
      logoWidth: "120px",

      description: "Build beautiful pages in minutes.",
      copyright: `© ${new Date().getFullYear()} Solario Forge. All rights reserved.`,

      // Links
      links: [
        { id: "1", label: "Privacy Policy", url: "#" },
        { id: "2", label: "Terms of Service", url: "#" },
        { id: "3", label: "Contact Us", url: "#" },
      ],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "contactForm",
    label: "Contact Form",
    icon: "BookOpen",
    defaultProps: {
      receiverEmail: "ansh.official03@gmail.com",
      showLastName: true,
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email",
      messageLabel: "Message",
      firstNameKey: "firstName",
      lastNameKey: "lastName",
      emailKey: "email",
      messageKey: "message",
      submitLabel: "Send Message →",
      successMessage: "Thanks! We'll get back to you shortly.",
      errorMessage: "Something went wrong. Please try again.",
      buttonVariant: "solid",
      buttonBg: "var(--primary)",
      buttonTextColor: "var(--button-text)",
      buttonBorderRadius: "10px",
      buttonFullWidth: true,
      buttonAlign: "right",
      sectionBg: "#ffffff",
      sectionPadding: "5rem 2rem",
      bgColor: "#ffffff",
      padding: "3rem 2rem",
      borderRadius: "20px",
      inputBg: "",
      inputBorderColor: "",
      inputFocusBorderColor: "var(--primary)",
      labelColor: "",
      inputTextColor: "",
      titleText: "",
      subtitleText: "",
      titleColor: "var(--text)",
      subtitleColor: "var(--text-muted)",

      // Animation
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "deleteAccount",
    label: "Delete Account",
    icon: "Trash",
    defaultProps: {
      apiUrl: "",
      showFirstName: false,
      showLastName: false,
      firstNameRequired: false,
      lastNameRequired: false,
      reasonRequired: false,
      reasonOptions: "I don't use it anymore\nPrivacy concerns\nFound a better alternative\nToo many emails\nOther",

      titleText: "Delete Your Account",
      subtitleText: "We're sorry to see you go. Please let us know why you're leaving so we can improve.",
      titleColor: "var(--text)",
      subtitleColor: "var(--text-muted)",

      logoUrl: "",
      logoHeight: "48px",
      logoWidth: "auto",
      logoRadius: "0px",
      logoShadow: "none",

      submitLabel: "Delete Account",
      buttonVariant: "solid",
      buttonBg: "#ef4444",
      buttonTextColor: "#ffffff",
      buttonBorderRadius: "10px",

      sectionBg: "#ffffff",
      sectionPadding: "4rem 1rem",
      bgColor: "#ffffff",
      textColor: "var(--text)",
      inputBg: "",
      inputTextColor: "",
      inputBorderColor: "",
      labelColor: "",
      padding: "3rem 2rem",
      borderRadius: "20px",
      boxShadow: "0 16px 48px #00000033, 0 4px 16px #00000026",

      successMessage: "Your account deletion request has been submitted.",
      errorMessage: "Something went wrong. Please try again.",

      // Animation
      animationPlayback: "once",
    },
  },
  {
    type: "wave",
    label: "Wave Divider",
    icon: "ArrowsUpDown",
    defaultProps: {
      pattern: "smooth",
      layers: 3,
      fillColor: "var(--primary)",
      secondaryColor: "",
      bgColor: "transparent",
      height: "450px",
      waveHeight: "150px",
      flipHorizontal: true,
      flipVertical: true,
      animated: true,
      waveOnTop: true,
      padding: "24px",
      childBlocks: [],

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "masonry",
    label: "Masonry Gallery",
    icon: "Squares2X2",
    hidden: true,
    defaultProps: {
      columns: 4,
      columnsTablet: 2,
      columnsMobile: 1,
      gap: 16,
      padding: "24px",
      bgColor: "transparent",
      childBlocks: [
        { id: "m1", type: "image", props: { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m2", type: "image", props: { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m3", type: "image", props: { src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m4", type: "image", props: { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m4", type: "image", props: { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m4", type: "image", props: { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m4", type: "image", props: { src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m5", type: "image", props: { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m6", type: "image", props: { src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800", borderRadius: "12px", objectFit: "cover" } },
        { id: "m-picker", type: "media-picker", props: {} }
      ],

      // Animation
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "stats",
    label: "Stats & KPIs",
    icon: "ChartBar",
    defaultProps: {
      layout: "kpi", // grid | strip | kpi
      columns: 4,
      gap: "2rem",
      padding: "4rem 2rem",
      bgColor: "transparent",
      textColor: "var(--text)",
      accentColor: "var(--primary)",

      // Card Styling
      cardStyle: "card", // none | card | glass | flat
      cardBg: "#ffffff",
      cardRadius: "1.5rem",
      cardPadding: "1.5rem",

      items: [
        { id: "1", value: "24.5K", label: "Active Revenue", unit: "$", icon: "Banknotes", trend: "up", trendValue: "12%", description: "Total earnings from subscriptions" },
        { id: "2", value: "8.2M", label: "Global Reach", unit: "", icon: "GlobeAlt", trend: "up", trendValue: "5.4%", description: "Monthly active users across regions" },
        { id: "3", value: "99.9%", label: "Uptime SLA", unit: "", icon: "ShieldCheck", trend: "none", trendValue: "", description: "System reliability and performance" },
        { id: "4", value: "1.2K", label: "New Signups", unit: "", icon: "UserPlus", trend: "up", trendValue: "18%", description: "Acquisition growth in past 30 days" },
      ],

      // Animation
      animationType: "fade",
      animationDuration: 0.6,
      animationDelay: 0,
      animationPlayback: "once",
    },
  },
  {
    type: "chart",
    label: "Data Chart",
    icon: "ChartPie",
    defaultProps: {
      chartType: "area", // area | bar | line | pie | donut
      title: "Performance Monitor",
      subtitle: "Last 30 days activity",
      height: "300px",
      padding: "2rem",
      bgColor: "#ffffff",
      borderRadius: "1.5rem",

      // Data
      data: [
        { name: "Mon", value: 400 },
        { name: "Tue", value: 300 },
        { name: "Wed", value: 600 },
        { name: "Thu", value: 800 },
        { name: "Fri", value: 500 },
        { name: "Sat", value: 900 },
        { name: "Sun", value: 700 },
      ],

      // Styling
      color: "var(--primary)",
      secondaryColor: "var(--secondary)",
      textColor: "var(--text)",
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showTooltip: true,
      showLegend: false,
      curve: "smooth", // smooth | step | linear

      // Animation
      animationDuration: 1000,
    },
  },
  {
    type: "media-picker",
    label: "Add Media",
    icon: "PlusCircle",
    hidden: true,
    defaultProps: {
      padding: "0px",
      borderRadius: "12px",
    },
  },
  {
    type: "tos",
    label: "Terms of Service",
    icon: "ShieldCheck",
    defaultProps: {
      title: "Terms of Service",
      showTitle: true,
      titleAlign: "left",
      titleFontSize: "2rem",
      titleTabletFontSize: "1.75rem",
      titleMobileFontSize: "1.5rem",
      titleColor: "var(--text)",
      titleFontWeight: "700",
      mode: "manual",
      content: "<h2>Terms of Service</h2><p>Please read these terms carefully before using our service.</p><p>By accessing or using the service, you agree to be bound by these terms.</p>",
      apiUrl: "",
      dataPath: "",
      padding: "64px 24px",
      bgColor: "transparent",
      textColor: "var(--text)",
    },
  },
  {
    type: "privacy",
    label: "Privacy Policy",
    icon: "LockClosed",
    defaultProps: {
      title: "Privacy Policy",
      showTitle: true,
      titleAlign: "left",
      titleFontSize: "2rem",
      titleTabletFontSize: "1.75rem",
      titleMobileFontSize: "1.5rem",
      titleColor: "var(--text)",
      titleFontWeight: "700",
      mode: "manual",
      content: "<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how we collect and use your data.</p>",
      apiUrl: "",
      dataPath: "",
      padding: "64px 24px",
      bgColor: "transparent",
      textColor: "var(--text)",
    },
  },
  {
    type: "about",
    label: "About Us",
    icon: "InformationCircle",
    defaultProps: {
      title: "About Us",
      showTitle: true,
      titleAlign: "left",
      titleFontSize: "2rem",
      titleTabletFontSize: "1.75rem",
      titleMobileFontSize: "1.5rem",
      titleColor: "var(--text)",
      titleFontWeight: "700",
      mode: "manual",
      content: "<h2>About Us</h2><p>We are dedicated to providing the best experience for our users.</p>",
      apiUrl: "",
      dataPath: "",
      padding: "64px 24px",
      bgColor: "transparent",
      textColor: "var(--text)",
    },
  },
];

// ─── Helper to make a bare block with fresh ID ────────────────────────────────
export function makeBlock(type: string, props: Record<string, unknown>): Block {
  return { id: crypto.randomUUID(), type, props };
}

// ─── Replace "Solario Forge" placeholder with the real project name everywhere ────
export function injectProjectName(block: Block, projectName: string): Block {
  if (!projectName || projectName === "Solario Forge") return block;
  // Safety: some legacy saved blocks may have no props
  if (!block || !block.props) return block;
  const replace = (v: unknown): unknown => {
    if (typeof v === "string") return v.replace(/Solario Forge/g, projectName);
    if (Array.isArray(v)) return (v as unknown[]).map(replace);
    return v;
  };
  const newProps: Record<string, unknown> = {};
  for (const key of Object.keys(block.props)) {
    const val = block.props[key];
    if (typeof val === "string") {
      newProps[key] = val.replace(/Solario Forge/g, projectName);
    } else if (Array.isArray(val) && val.length > 0 && typeof (val[0] as any)?.id === "string") {
      // Array of child blocks — recurse
      newProps[key] = (val as Block[]).map(b => injectProjectName(b, projectName));
    } else {
      newProps[key] = replace(val);
    }
  }
  return { ...block, props: newProps };
}

// ─── Migrate an entire page's blocks to replace Solario Forge with project name ───
export function migrateProjectName(data: any, projectName: string): any {
  if (!projectName || projectName === "Solario Forge" || !data) return data;

  // If it's an array of blocks
  if (Array.isArray(data)) {
    return data.map(b => injectProjectName(b, projectName));
  }

  // If it's an EditorPage object
  const pageDetails = { ...data };
  if (pageDetails.content && Array.isArray(pageDetails.content)) {
    pageDetails.content = pageDetails.content.map((b: Block) => injectProjectName(b, projectName));
  }

  if (pageDetails.globalBlocks) {
    if (pageDetails.globalBlocks.header) {
      pageDetails.globalBlocks.header = injectProjectName(pageDetails.globalBlocks.header, projectName);
    }
    if (pageDetails.globalBlocks.footer) {
      pageDetails.globalBlocks.footer = injectProjectName(pageDetails.globalBlocks.footer, projectName);
    }
  }

  if (pageDetails.routes && Array.isArray(pageDetails.routes)) {
    pageDetails.routes = pageDetails.routes.map((r: any) => ({
      ...r,
      content: r.content.map((b: Block) => injectProjectName(b, projectName))
    }));
  }

  return pageDetails;
}

// ✅ Create a block with default props + pre-built templates
export function createBlock(type: string): Block {
  const config = BLOCK_TYPES.find((b) => b.type === type);
  const defaultProps = config?.defaultProps ?? {};

  const block: Block = {
    id: crypto.randomUUID(),
    type,
    props: { ...defaultProps },
  };

  // ── Hero: inject prebuilt template ───────────────────────────────────────
  if (type === "hero") {
    block.props.childBlocks = [
      makeBlock("text", {
        content: "Welcome to Solario Forge",
        tag: "h1",
        align: "center",
        fontSize: "3rem",
        color: "#ffffff",
        bold: true,
        animationType: "slide-up",
        animationDuration: 0.8,
        animationDelay: 0.1,
      }),
      makeBlock("text", {
        content: "Build beautiful pages in minutes — no code needed.",
        tag: "p",
        align: "center",
        fontSize: "1.2rem",
        color: "#ffffff",
        bold: false,
        animationType: "slide-up",
        animationDuration: 0.8,
        animationDelay: 0.2,
      }),
      makeBlock("button", {
        label: "Get Started →",
        href: "#",
        variant: "solid",
        size: "lg",
        align: "center",
        fullWidth: false,
        animationType: "slide-up",
        animationDuration: 0.8,
        animationDelay: 0.3,
      }),
    ];
  }

  return block;
}