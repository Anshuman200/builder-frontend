import type { Block, IconName, BlockConfig } from "@/@Types";
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
      logoText: "PageCraft",
      logoImage: "",
      logoWidth: "120px",

      // Nav links
      links: [
        { id: "1", label: "Features", url: "#" },
        { id: "2", label: "Pricing", url: "#" },
        { id: "3", label: "About", url: "#" },
      ],

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
      bgColor: "var(--primary)",
      bgImage: "",
      bgOverlay: "var(--overlay)",
      textColor: "#ffffff",
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
      height: "50vh",
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
      label: "Click me",
      href: "#",
      // Appearance
      variant: "solid",         // solid | outline | ghost | soft | gradient | link
      size: "md",               // sm | md | lg | xl
      align: "left",
      fullWidth: true,
      // Colors
      bgColor: "",              // overrides variant bg
      textColor: "",
      borderColor: "",
      // Gradient (only used when variant = gradient)
      gradientFrom: "#6366f1",
      gradientTo: "#8b5cf6",
      gradientDir: "to right",
      // Shape
      borderRadius: "9999px",   // pill by default
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
      maxWidth: "800px",
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
      cardBg: "var(--surface)",
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
    type: "columns",
    label: "2 Columns",
    icon: "Squares2X2",
    defaultProps: {
      gap: "1.5rem",
      padding: "16px 24px",
      tabletPadding: "",
      mobilePadding: "16px 12px",
      leftWidth: "50",
      col0: [] as Block[],
      col1: [] as Block[],

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
      cardBg: "var(--surface)",
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
      bgColor: "#0f172a",
      textColor: "#f8fafc",
      padding: "48px 32px",
      tabletPadding: "32px 24px",
      mobilePadding: "24px 16px",
      fullWidth: true,

      // Branding
      logoType: "text",
      logoText: "PageCraft",
      logoImage: "",
      logoWidth: "120px",

      description: "Build beautiful pages in minutes.",
      copyright: `© ${new Date().getFullYear()} PageCraft. All rights reserved.`,

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
      buttonBg: "var(--primary)",
      buttonTextColor: "var(--button-text)",
      buttonBorderRadius: "10px",
      buttonFullWidth: true,
      buttonAlign: "right",
      bgColor: "var(--surface)",
      padding: "3rem 2rem",
      borderRadius: "20px",
      inputBg: "#f8fafc",
      inputBorderColor: "#e2e8f0",
      inputFocusBorderColor: "var(--primary)",
      labelColor: "#374151",
      inputTextColor: "var(--text)",
      titleText: "",
      subtitleText: "",
      titleColor: "var(--text)",
      subtitleColor: "var(--text-muted)",

      // Animation
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "contactInfo",
    label: "Contact Info",
    icon: "Megaphone",
    defaultProps: {
      bgColor: "transparent",
      textColor: "var(--text)",
      padding: "16px 0",
      items: [
        { id: "1", title: "Email", content: "hello@example.com", icon: "Mail", color: "#6366f1" },
        { id: "2", title: "Phone", content: "+1 (555) 000-0000", icon: "Phone", color: "#8b5cf6" },
        { id: "3", title: "Address", content: "123 Business St, New York", icon: "MapPin", color: "#ec4899" },
      ],
      layout: "list", // list | grid
      columns: 1,
      gap: "1.5rem",
      itemBg: "rgba(255,255,255,0.05)",
      itemRadius: "12px",
      itemPadding: "1rem 1.25rem",
      showIcons: true,
      iconSize: "24",
      titleSize: "0.9rem",
      contentSize: "1rem",

      // Animation
      animationType: DEFAULT_CONFIG.animationFade.type,
      animationDuration: DEFAULT_CONFIG.animationFade.duration,
      animationDelay: DEFAULT_CONFIG.animationFade.delay,
      animationPlayback: DEFAULT_CONFIG.animationFade.playback,
    },
  },
  {
    type: "carousel",
    label: "Carousel",
    icon: "Square3Stack3D",
    defaultProps: {
      padding: "24px",
      tabletPadding: "16px",
      mobilePadding: "12px",
      bgColor: "transparent",
      slidesCount: 3,
      autoplay: true,
      dots: true,
      arrows: true,
      fade: false,
      speed: 500,
      autoplaySpeed: 3000,
      childBlocks: [], // Each slide is a child block container

      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
  {
    type: "wave",
    label: "Wave Divider",
    icon: "ArrowsUpDown",
    defaultProps: {
      pattern: "smooth",
      layers: 1,
      fillColor: "var(--primary)",
      secondaryColor: "",
      bgColor: "transparent",
      height: "100px",
      flipHorizontal: false,
      flipVertical: false,
      animated: false,
      padding: "24px",
      childBlocks: [],
      
      // Animation
      animationType: DEFAULT_CONFIG.animation.type,
      animationDuration: DEFAULT_CONFIG.animation.duration,
      animationDelay: DEFAULT_CONFIG.animation.delay,
      animationPlayback: DEFAULT_CONFIG.animation.playback,
    },
  },
];

// ─── Helper to make a bare block with fresh ID ────────────────────────────────
export function makeBlock(type: string, props: Record<string, unknown>): Block {
  return { id: crypto.randomUUID(), type, props };
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
        content: "Welcome to PageCraft",
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