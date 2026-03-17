import type { ThemeConfig } from "@/@Types";

export const DEFAULT_THEME: ThemeConfig = {
    mode: "light",
    colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        background: "#ffffff",
        surface: "#f8fafc",
        text: "#0f172a",
        textMuted: "#64748b",
        border: "#e2e8f0",
        accent: "#f59e0b",
        buttonText: "#ffffff",
        overlay: "rgba(0,0,0,0.25)",
    },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "md",
    spacing: "normal",
    layout: {
        maxWidth: "1200px",
        paddingX: "32px",
        tabletPaddingX: "24px",
        mobilePaddingX: "16px",
    },
};

export function hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export function applyThemeToElement(el: HTMLElement, theme: ThemeConfig) {
    const { colors, fonts, borderRadius, spacing } = theme;

    // Apply colors
    if (colors) {
        el.style.setProperty("--primary", colors.primary);
        el.style.setProperty("--secondary", colors.secondary);
        el.style.setProperty("--background", colors.background);
        el.style.setProperty("--surface", colors.surface);
        el.style.setProperty("--text", colors.text);
        el.style.setProperty("--text-muted", colors.textMuted);
        el.style.setProperty("--border", colors.border);
        el.style.setProperty("--accent", colors.accent);
        if (colors.buttonText) el.style.setProperty("--button-text", colors.buttonText);
        if (colors.overlay) el.style.setProperty("--overlay", colors.overlay);

        const primaryRgb = hexToRgb(colors.primary);
        if (primaryRgb) el.style.setProperty("--primary-rgb", primaryRgb);
    }

    // Apply Fonts
    if (fonts) {
        el.style.setProperty("--font-heading", `"${fonts.heading}", sans-serif`);
        el.style.setProperty("--font-body", `"${fonts.body}", sans-serif`);
    }

    // Apply geometry
    if (borderRadius) {
        const radiusMap = { none: "0px", sm: "4px", md: "8px", lg: "16px", full: "9999px" };
        el.style.setProperty("--radius", radiusMap[borderRadius as keyof typeof radiusMap] || "8px");
    }
    if (spacing) {
        const spaceMap = { compact: "0.75rem", normal: "1rem", relaxed: "1.5rem" };
        el.style.setProperty("--spacing-base", spaceMap[spacing as keyof typeof spaceMap] || "1rem");
    }
}
