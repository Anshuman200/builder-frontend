import type { ComponentType, SVGProps } from "react";

// ─── EDITOR ────────────────────────────────────────────────────────────────────
export interface Block {
    id: string;
    type: string;
    props: Record<string, unknown>;
    children?: Block[];
    style?: BlockStyle;
}

export interface BlockStyle {
    margin?: string;
    padding?: string;
    background?: string;
    animation?: AnimationConfig;
    responsive?: {
        mobile?: Partial<BlockStyle>;
        tablet?: Partial<BlockStyle>;
    };
}

export interface AnimationConfig {
    type: "fade-in" | "slide-up" | "slide-in-left" | "zoom-in" | "bounce" | "none" | string;
    delay: number;
    duration: number;
    trigger: "load" | "scroll";
    playback?: "once" | "always" | string;
}

export interface ThemeConfig {
    mode: "light" | "dark";
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
        border: string;
        accent: string;
        buttonText?: string;
        overlay?: string;
    };
    fonts: { heading: string; body: string };
    borderRadius: "none" | "sm" | "md" | "lg" | "full" | string;
    spacing: "compact" | "normal" | "relaxed" | string;
    layout?: {
        maxWidth: string;
        paddingX: string;
        tabletPaddingX: string;
        mobilePaddingX: string;
    };
    features?: {
        scrollToTop: boolean;
        scrollToTopPosition: "bottom-right" | "bottom-left" | string;
        scrollToTopColor: string;
        themeSwitcher: boolean;
        themeSwitcherPosition: "bottom-right" | "bottom-left" | string;
    };
}

export interface MetaConfig {
    title?: string;
    description?: string;
    ogImage?: string;
    robots?: string;
    favicon?: string;
    keywords?: string;
}

export interface RouteConfig {
    id: string;
    path: string;
    name: string;
    content: Block[];
    meta?: MetaConfig;
    hideHeader?: boolean;
    hideFooter?: boolean;
    showInHeader?: boolean;
    showInFooter?: boolean;
}

export interface EditorPage {
    id: string;
    title: string;
    slug: string;
    content: Block[]; // Legacy content array
    routes?: RouteConfig[]; // New multi-page routes
    globalBlocks?: {
        header: Block | null;
        footer: Block | null;
    };
    theme: ThemeConfig;
    meta: MetaConfig;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | string;
    isTemplate?: boolean;
    isPublic?: boolean;
    isLocked?: boolean;
    category?: string;
    thumbnail?: string | null;
    thumbnails?: string[];
}

// ─── BLOCKS & TEMPLATES ────────────────────────────────────────────────────────
export type IconName = string;

export interface BlockConfig {
    type: string;
    label: string;
    icon: IconName;
    defaultProps: Record<string, unknown>;
    hidden?: boolean;
}

export interface SectionTemplate {
    id: string;
    name: string;
    category: string;
    preview: string;
    previewImage?: string;
    create: () => Block;
}

// ─── UI & ICONS ───────────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "loading" | "info";

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

export type HeroIcon = ComponentType<SVGProps<SVGSVGElement> & { title?: string }>;

export interface IconEntry {
    name: string;
    label: string;
    Icon: HeroIcon;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export type Tab = "login" | "register" | "verify" | "forgot-password" | "reset-password" | string;
