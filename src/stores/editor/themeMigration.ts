import type { Block, EditorPage, ThemeConfig } from "@/types";

export function forceLightModeMigration(page: EditorPage, defaultTheme: ThemeConfig): boolean {
    let changed = false;

    if (!page.theme) {
        page.theme = JSON.parse(JSON.stringify(defaultTheme));
        changed = true;
    }

    if (page.theme.mode !== "light") {
        page.theme.mode = "light";
        changed = true;
    }

    const c = page.theme.colors;
    const darkBackgrounds = ["#020617", "#09090b", "#000000", "#111827", "#18181b"];
    const lightTexts = ["#f8fafc", "#ffffff", "#f1f5f9", "#cbd5e1"];
    const darkSurfaces = ["#0f172a", "#1e293b", "#1a1a1a", "#27272a"];

    if (darkBackgrounds.includes(c.background) || c.background === "var(--background)") {
        c.background = "#ffffff";
        changed = true;
    }
    if (lightTexts.includes(c.text) || c.text === "var(--text)") {
        c.text = "#0f172a";
        changed = true;
    }
    if (darkSurfaces.includes(c.surface) || c.surface === "var(--surface)") {
        c.surface = "#f8fafc";
        changed = true;
    }

    return changed;
}

export function migratePageBlocks(page: EditorPage): void {
    if (page.globalBlocks?.header) {
        page.globalBlocks.header = migrateBlockColors([page.globalBlocks.header])[0] || null;
    }
    if (page.globalBlocks?.footer) {
        page.globalBlocks.footer = migrateBlockColors([page.globalBlocks.footer])[0] || null;
    }
    page.routes?.forEach((route) => {
        route.content = migrateBlockColors(route.content || []);
    });
    if (Array.isArray(page.content) && page.content.length > 0) {
        page.content = migrateBlockColors(page.content);
    }
}

export function migrateBlockColors(blocks: Block[]): Block[] {
    const colorMap: Record<string, string> = {
        "#6366f1": "var(--primary)",
        "#818cf8": "var(--primary)",
        "#8b5cf6": "var(--secondary)",
        "#f59e0b": "var(--accent)",
    };

    const textProps = ["textColor", "color", "labelColor", "titleColor", "subtitleColor", "descColor", "nameColor", "roleColor", "ctaTextColor", "buttonTextColor", "inputTextColor"];
    const bgProps = ["bgColor", "cardBg", "itemBg", "itemBgColor", "inputBg", "ctaBgColor", "buttonBg", "fillColor"];
    const accentProps = ["accentColor", "secondaryColor", "iconColor", "bulletColor"];
    const borderProps = ["borderColor", "itemBorderColor", "inputBorderColor"];

    return blocks.map(b => {
        const p = { ...b.props };
        let changed = false;

        Object.keys(p).forEach(key => {
            const val = p[key];
            if (typeof val === "string") {
                const hex = val.toLowerCase();

                if (textProps.includes(key)) {
                    if (hex === "#ffffff" || hex === "#fff" || hex === "#f8fafc" || hex === "#fafafa") {
                        const hasBgImage = !!p.bgImage || !!p.backgroundImage;
                        if (b.type !== "hero" && !(b.type === "container" && hasBgImage)) {
                            p[key] = "var(--text)";
                            changed = true;
                        }
                    } else if (hex === "#000000" || hex === "#000" || hex === "#09090b") {
                        p[key] = "var(--text)";
                        changed = true;
                    } else if (val === "var(--text)" && b.type === "hero") {
                        p[key] = "#ffffff";
                        changed = true;
                    }
                } else if (bgProps.includes(key)) {
                    if (hex === "#ffffff" || hex === "#fff" || hex === "#fafafa") {
                        if (b.type === "hero" && (!!p.bgImage || !!p.backgroundImage)) {
                            return;
                        } else if (b.type === "stats" || b.type === "chart") {
                            p[key] = "var(--surface)";
                        } else {
                            p[key] = "var(--background)";
                        }
                        changed = true;
                    } else if (hex === "#000000" || hex === "#09090b" || hex === "#111827" || hex === "#18181b" || hex === "#1a1a1a") {
                        p[key] = "var(--surface)";
                        changed = true;
                    } else if (val === "var(--background)" && b.type === "hero" && (!!p.bgImage || !!p.backgroundImage)) {
                        p[key] = "transparent";
                        changed = true;
                    }
                } else if (accentProps.includes(key) && (hex === "#6366f1" || hex === "#8b5cf6" || hex === "#818cf8")) {
                    p[key] = (hex === "#6366f1" || hex === "#818cf8") ? "var(--primary)" : "var(--secondary)";
                    changed = true;
                } else if (borderProps.includes(key) && (hex === "#e2e8f0" || hex === "#cbd5e1" || hex === "#e5e7eb" || hex === "#27272a")) {
                    p[key] = "var(--border)";
                    changed = true;
                } else if (colorMap[hex]) {
                    p[key] = colorMap[hex];
                    changed = true;
                }
            }

            if (Array.isArray(val) && val.length > 0) {
                if ((val[0] as any)?.id && typeof (val[0] as any)?.type === "string") {
                    const migratedArr = migrateBlockColors(val as Block[]);
                    if (migratedArr !== val) { p[key] = migratedArr; changed = true; }
                } else if (typeof val[0] === "object") {
                    let itemsChanged = false;
                    const migratedItems = val.map(item => {
                        const newItem = { ...item };
                        Object.keys(newItem).forEach(k => {
                            if (typeof newItem[k] === "string" && colorMap[newItem[k].toLowerCase()]) {
                                newItem[k] = colorMap[newItem[k].toLowerCase()];
                                itemsChanged = true;
                            }
                        });
                        return newItem;
                    });
                    if (itemsChanged) { p[key] = migratedItems; changed = true; }
                }
            }
        });

        const updatedBlock = changed ? { ...b, props: p } : b;
        if (updatedBlock.children) {
            const migratedChildren = migrateBlockColors(updatedBlock.children);
            if (migratedChildren !== updatedBlock.children) {
                return { ...updatedBlock, children: migratedChildren };
            }
        }
        return updatedBlock;
    });
}

