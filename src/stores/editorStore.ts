import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Block, BlockStyle, AnimationConfig, ThemeConfig, MetaConfig, EditorPage } from "@/types";

// ─── Default Theme ───────────────────────────────────────────────────────────
export const LIGHT_COLORS = {
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
};

export const DEFAULT_THEME: ThemeConfig = {
    mode: "light",
    colors: LIGHT_COLORS,
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "md",
    spacing: "normal",
    layout: {
        maxWidth: "1200px",
        paddingX: "32px",
        tabletPaddingX: "24px",
        mobilePaddingX: "16px",
    },
    features: {
        scrollToTop: true,
        scrollToTopPosition: "bottom-right",
        scrollToTopColor: "#6366f1",
        themeSwitcher: false,
        themeSwitcherPosition: "bottom-left",
    }
};


// ─── Editor Store ─────────────────────────────────────────────────────────────
interface EditorStore {
    page: EditorPage | null;
    selectedBlockId: string | null;
    selectBlockTick: number;
    hoveredBlockId: string | null;
    history: EditorPage[];
    historyIndex: number;
    isDirty: boolean;
    isSaving: boolean;
    viewMode: "desktop" | "tablet" | "mobile";
    activeRouteId: string | null;
    iconPicker: {
        open: boolean;
        value: string;
        onSelect: (name: string) => void;
        anchorRect: { top: number; left: number; width: number; height: number } | null;
    };
    activeDrag: {
        type: "palette" | "canvas" | "section";
        blockType?: string;
        templateId?: string;
        blockId?: string;
    } | null;
    subItemFocus: { blockId: string; index: number | string } | null;
    blockPicker: {
        open: boolean;
        target: {
            id: string; // blockId or "canvas-root"
            position: "before" | "after" | "inside";
            childProp?: string;
        } | null;
        preferredTab?: "sections" | "elements";
    };
    templatePicker: {
        open: boolean;
    };
    mediaPicker: {
        open: boolean;
        type: "all" | "image" | "video";
        onSelect: (url: string) => void;
        title?: string;
    };
    wizard: {
        open: boolean;
        blankMode: boolean;
    };

    // ─ Actions ────────────────────────────────────────────────────────────────
    setPage: (page: EditorPage) => void;
    setActiveRoute: (routeId: string) => void;
    addRoute: (route: { path: string; name: string, hideHeader?: boolean, hideFooter?: boolean, showInHeader?: boolean, showInFooter?: boolean }) => void;
    updateRoute: (routeId: string, updates: Partial<Pick<import("@/types").RouteConfig, "path" | "name" | "hideHeader" | "hideFooter" | "showInHeader" | "showInFooter">>) => void;
    deleteRoute: (routeId: string) => void;

    selectBlock: (id: string | null) => void;
    hoverBlock: (id: string | null) => void;
    focusSubItem: (blockId: string, index: number | string) => void;
    setViewMode: (mode: "desktop" | "tablet" | "mobile") => void;
    setIsSaving: (v: boolean) => void;
    setActiveDrag: (drag: EditorStore["activeDrag"]) => void;

    showIconPicker: (params: { value: string; onSelect: (name: string) => void; anchorRect: { top: number; left: number; width: number; height: number } }) => void;
    hideIconPicker: () => void;
    setIconPickerValue: (value: string) => void;

    showMediaPicker: (params: { type?: "all" | "image" | "video"; onSelect: (url: string) => void; title?: string }) => void;
    hideMediaPicker: () => void;

    addBlock: (block: Block, parentId?: string) => void;
    updateBlock: (id: string, props: Partial<Block["props"]>, commit?: boolean) => void;
    updateBlockStyle: (id: string, style: Partial<BlockStyle>, commit?: boolean) => void;
    deleteBlock: (id: string) => void;
    duplicateBlock: (id: string) => void;
    moveBlock: (activeId: string, overId: string, position?: "before" | "after" | "inside", childProp?: string) => void;
    swapBlocks: (idA: string, idB: string) => void;
    replaceBlock: (id: string, newBlock: Block) => void;

    openBlockPicker: (target: { id: string, position: "before" | "after" | "inside", childProp?: string }, preferredTab?: "sections" | "elements") => void;
    closeBlockPicker: () => void;
    addBlockAtTarget: (block: Block, target: NonNullable<EditorStore["blockPicker"]["target"]>) => Block;
    openTemplatePicker: () => void;
    closeTemplatePicker: () => void;
    applyTemplate: (content: Block[], theme?: Partial<ThemeConfig>) => void;

    updateTheme: (theme: Partial<ThemeConfig>, commit?: boolean) => void;
    updateMeta: (meta: Partial<MetaConfig>) => void;
    updateSlug: (slug: string) => void;
    updateTitle: (title: string) => void;
    updatePageData: (data: Partial<Pick<EditorPage, "isTemplate" | "isPublic" | "isLocked" | "category" | "thumbnail" | "thumbnails" | "routes">>, commit?: boolean) => void;
    migrateThemeColors: () => void;
    pushHistory: () => void;

    undo: () => void;
    redo: () => void;
    markClean: () => void;
    openWizard: (blankMode?: boolean) => void;
    closeWizard: () => void;
}

function updateColProps(b: Block, id: string, updater: (b: Block) => Block): Block {
    const p = b.props;
    let changed = false;
    const newProps = { ...p };

    // Common array props
    for (const key of ["col0", "col1", "childBlocks"]) {
        const arr = p[key] as Block[] | undefined;
        if (arr) {
            const next = findAndUpdate(arr, id, updater);
            if (next !== arr) {
                newProps[key] = next;
                changed = true;
            }
        }
    }

    // Grid items array
    const items = p.items as { id: string, blocks: Block[] }[] | undefined;
    if (items) {
        const nextItems = items.map(item => {
            const nextBlocks = findAndUpdate(item.blocks || [], id, updater);
            if (nextBlocks !== item.blocks) {
                changed = true;
                return { ...item, blocks: nextBlocks };
            }
            return item;
        });
        if (changed) newProps.items = nextItems;
    }

    return changed ? { ...b, props: newProps } : b;
}

function deleteColProps(b: Block, id: string): Block {
    const p = b.props;
    let changed = false;
    const newProps = { ...p };

    for (const key of ["col0", "col1", "childBlocks"]) {
        const arr = p[key] as Block[] | undefined;
        if (arr) {
            const next = findAndDelete(arr, id);
            if (next !== arr) {
                newProps[key] = next;
                changed = true;
            }
        }
    }

    const items = p.items as { id: string, blocks: Block[] }[] | undefined;
    if (items) {
        const nextItems = items.map(item => {
            const nextBlocks = findAndDelete(item.blocks || [], id);
            if (nextBlocks !== item.blocks) {
                changed = true;
                return { ...item, blocks: nextBlocks };
            }
            return item;
        });
        if (changed) newProps.items = nextItems;
    }

    return changed ? { ...b, props: newProps } : b;
}

function findAndUpdate(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
    return blocks.map((b) => {
        if (b.id === id) return updater(b);
        if (b.children?.length) return { ...b, children: findAndUpdate(b.children, id, updater) };
        // Also search inside column props (col0 / col1)
        return updateColProps(b, id, updater);
    });
}

function findAndDelete(blocks: Block[], id: string): Block[] {
    return blocks.filter((b) => b.id !== id).map((b) => {
        let updated = b.children ? { ...b, children: findAndDelete(b.children, id) } : b;
        updated = deleteColProps(updated, id);
        return updated;
    });
}

function applyUpdaterDeep(page: EditorPage, activeRouteId: string | null, updater: (blocks: Block[]) => Block[]): void {
    if (page.globalBlocks) {
        if (page.globalBlocks.header) {
            page.globalBlocks.header = updater([page.globalBlocks.header])[0] || null;
        }
        if (page.globalBlocks.footer) {
            page.globalBlocks.footer = updater([page.globalBlocks.footer])[0] || null;
        }
    }
    if (page.routes && activeRouteId) {
        const route = page.routes.find(r => r.id === activeRouteId);
        if (route) {
            route.content = updater(route.content);
        }
    }
}

function findAndRemoveBlock(blocks: Block[], id: string): { newBlocks: Block[], removed: Block | null } {
    let removed: Block | null = null;
    const newBlocks = blocks.filter(b => {
        if (b.id === id) { removed = b; return false; }
        return true;
    }).map(b => {
        const updated = { ...b };
        if (updated.children && !removed) {
            const res = findAndRemoveBlock(updated.children, id);
            if (res.removed) { removed = res.removed; updated.children = res.newBlocks; }
        }
        const col0 = updated.props.col0 as Block[] | undefined;
        if (col0 && !removed) {
            const res = findAndRemoveBlock(col0, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, col0: res.newBlocks }; }
        }
        const col1 = updated.props.col1 as Block[] | undefined;
        if (col1 && !removed) {
            const res = findAndRemoveBlock(col1, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, col1: res.newBlocks }; }
        }
        const childBlocks = updated.props.childBlocks as Block[] | undefined;
        if (childBlocks && !removed) {
            const res = findAndRemoveBlock(childBlocks, id);
            if (res.removed) { removed = res.removed; updated.props = { ...updated.props, childBlocks: res.newBlocks }; }
        }
        const items = updated.props.items as { id: string, blocks: Block[] }[] | undefined;
        if (items && !removed) {
            const nextItems = items.map(item => {
                if (removed || !item.blocks) return item;
                const res = findAndRemoveBlock(item.blocks, id);
                if (res.removed) {
                    removed = res.removed;
                    return { ...item, blocks: res.newBlocks };
                }
                return item;
            });
            if (removed) updated.props = { ...updated.props, items: nextItems };
        }
        return updated;
    });
    return { newBlocks, removed };
}

function insertBlockDeep(
    blocks: Block[], insertBlock: Block, targetId: string,
    position: "before" | "after" | "inside" = "after", childProp?: string
): { newBlocks: Block[], inserted: boolean } {
    let inserted = false;
    const newBlocks: Block[] = [];
    for (const b of blocks) {
        if (b.id === targetId) {
            if (position === "before") {
                newBlocks.push(insertBlock, b);
                inserted = true;
            } else if (position === "after") {
                newBlocks.push(b, insertBlock);
                inserted = true;
            } else if (position === "inside" && childProp) {
                const updated = { ...b };
                if (childProp === "children") {
                    updated.children = [...(updated.children || []), insertBlock];
                    inserted = true;
                } else if (childProp === "col0" || childProp === "col1" || childProp === "childBlocks") {
                    updated.props = { ...updated.props, [childProp]: [...((updated.props[childProp] as Block[]) || []), insertBlock] };
                    inserted = true;
                } else {
                    // Try to find the slot in items array if it exists (for Grid, Columns, etc)
                    const items = updated.props.items as any[] | undefined;
                    if (Array.isArray(items)) {
                        const slotIdx = items.findIndex(s => s.id === childProp);
                        if (slotIdx !== -1) {
                            const newItems = [...items];
                            newItems[slotIdx] = {
                                ...newItems[slotIdx],
                                blocks: [...(newItems[slotIdx].blocks || []), insertBlock]
                            };
                            updated.props = { ...updated.props, items: newItems };
                            inserted = true;
                        }
                    }
                }
                newBlocks.push(updated);
            } else {
                newBlocks.push(b);
            }
        } else {
            const updated = { ...b };
            if (updated.children && !inserted) {
                const res = insertBlockDeep(updated.children, insertBlock, targetId, position, childProp);
                if (res.inserted) { updated.children = res.newBlocks; inserted = true; }
            }
            if (!inserted) {
                const col0 = updated.props.col0 as Block[] | undefined;
                if (col0 && !inserted) {
                    const res = insertBlockDeep(col0, insertBlock, targetId, position, childProp);
                    if (res.inserted) { updated.props = { ...updated.props, col0: res.newBlocks }; inserted = true; }
                }
                const col1 = updated.props.col1 as Block[] | undefined;
                if (col1 && !inserted) {
                    const res = insertBlockDeep(col1, insertBlock, targetId, position, childProp);
                    if (res.inserted) { updated.props = { ...updated.props, col1: res.newBlocks }; inserted = true; }
                }
                const childBlocks = updated.props.childBlocks as Block[] | undefined;
                if (childBlocks && !inserted) {
                    const res = insertBlockDeep(childBlocks, insertBlock, targetId, position, childProp);
                    if (res.inserted) { updated.props = { ...updated.props, childBlocks: res.newBlocks }; inserted = true; }
                }
                const items = updated.props.items as { id: string, blocks: Block[] }[] | undefined;
                if (items && !inserted) {
                    const nextItems = items.map(item => {
                        if (inserted || !item.blocks) return item;
                        const res = insertBlockDeep(item.blocks, insertBlock, targetId, position, childProp);
                        if (res.inserted) { inserted = true; return { ...item, blocks: res.newBlocks }; }
                        return item;
                    });
                    if (inserted) { updated.props = { ...updated.props, items: nextItems }; }
                }
            }
            newBlocks.push(updated);
        }
    }
    return { newBlocks, inserted };
}

/**
 * Ensures a page is strictly in light mode. Resets mode and base background/text colors if they were dark.
 */
function forceLightModeMigration(page: EditorPage): boolean {
    let changed = false;

    // Ensure theme exists
    if (!page.theme) {
        page.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
        changed = true;
    }

    if (page.theme.mode !== "light") {
        page.theme.mode = "light";
        changed = true;
    }

    const c = page.theme.colors;
    const DARK_BGS = ["#020617", "#09090b", "#000000", "#111827", "#18181b"];
    const LIGHT_TEXTS = ["#f8fafc", "#ffffff", "#f1f5f9", "#cbd5e1"];
    const DARK_SURFACES = ["#0f172a", "#1e293b", "#1a1a1a", "#27272a"];

    if (DARK_BGS.includes(c.background) || c.background === "var(--background)") {
        c.background = "#ffffff";
        changed = true;
    }
    if (LIGHT_TEXTS.includes(c.text) || c.text === "var(--text)") {
        c.text = "#0f172a";
        changed = true;
    }
    if (DARK_SURFACES.includes(c.surface) || c.surface === "var(--surface)") {
        c.surface = "#f8fafc";
        changed = true;
    }

    return changed;
}

/**
 * Recursively migrates hardcoded old default hex colors to CSS variables.
 */
function migrateBlockColors(blocks: Block[]): Block[] {
    const COLOR_MAP: Record<string, string> = {
        // Pure Lights
        // "#ffffff": "var(--background)",
        // "#f8fafc": "var(--surface)",
        // Theme Colors (only map if they were defaults)
        "#6366f1": "var(--primary)",
        "#818cf8": "var(--primary)",
        "#8b5cf6": "var(--secondary)",
        "#f59e0b": "var(--accent)",
    };

    const TEXT_PROPS = ["textColor", "color", "labelColor", "titleColor", "subtitleColor", "descColor", "nameColor", "roleColor", "ctaTextColor", "buttonTextColor", "inputTextColor"];
    const BG_PROPS = ["bgColor", "cardBg", "itemBg", "itemBgColor", "inputBg", "ctaBgColor", "buttonBg", "fillColor"];
    const ACCENT_PROPS = ["accentColor", "secondaryColor", "iconColor", "bulletColor"];
    const BORDER_PROPS = ["borderColor", "itemBorderColor", "inputBorderColor"];

    return blocks.map(b => {
        const p = { ...b.props };
        let changed = false;

        Object.keys(p).forEach(key => {
            const val = p[key];
            if (typeof val === 'string') {
                const hex = val.toLowerCase();

                // Specific mapping based on property type
                if (TEXT_PROPS.includes(key)) {
                    if (hex === "#ffffff" || hex === "#fff" || hex === "#f8fafc" || hex === "#fafafa") {
                        // EXCLUSION: Don't migrate white text for heros/containers with images
                        const hasBgImage = !!p.bgImage || !!p.backgroundImage;
                        if (b.type === "hero" || (b.type === "container" && hasBgImage)) {
                            // Keep as white
                        } else {
                            p[key] = "var(--text)";
                            changed = true;
                        }
                    } else if (hex === "#000000" || hex === "#000" || hex === "#09090b") {
                        p[key] = "var(--text)";
                        changed = true;
                    } else if (val === "var(--text)" && b.type === "hero") {
                        // REVERT: If it's a hero and was previously migrated to var(--text), set it back to white
                        p[key] = "#ffffff";
                        changed = true;
                    }
                } else if (BG_PROPS.includes(key)) {
                    if (hex === "#ffffff" || hex === "#fff" || hex === "#fafafa") {
                        // EXCLUSION: Don't migrate bgColor for heros with images
                        if (b.type === "hero" && (!!p.bgImage || !!p.backgroundImage)) {
                            // Keep original
                        } else if (b.type === "stats" || b.type === "chart") {
                            p[key] = "var(--surface)";
                            changed = true;
                        } else {
                            p[key] = "var(--background)";
                            changed = true;
                        }
                    } else if (hex === "#000000" || hex === "#09090b" || hex === "#111827" || hex === "#18181b" || hex === "#1a1a1a") {
                        p[key] = "var(--surface)";
                        changed = true;
                    } else if (val === "var(--background)" && b.type === "hero" && (!!p.bgImage || !!p.backgroundImage)) {
                        // REVERT: If it's a hero with an image and was migrated to var(--background), set it back to original (transparent/white)
                        p[key] = "transparent";
                        changed = true;
                    }
                } else if (ACCENT_PROPS.includes(key) && (hex === "#6366f1" || hex === "#8b5cf6" || hex === "#818cf8")) {
                    p[key] = (hex === "#6366f1" || hex === "#818cf8") ? "var(--primary)" : "var(--secondary)";
                    changed = true;
                } else if (BORDER_PROPS.includes(key) && (hex === "#e2e8f0" || hex === "#cbd5e1" || hex === "#e5e7eb" || hex === "#27272a")) {
                    p[key] = "var(--border)";
                    changed = true;
                } else if (COLOR_MAP[hex]) {
                    p[key] = COLOR_MAP[hex];
                    changed = true;
                }
            }
            // Recurse into array props (cols, items, features, members)
            if (Array.isArray(val) && val.length > 0) {
                if ((val[0] as any)?.id && typeof (val[0] as any)?.type === "string") {
                    // Array of blocks
                    const migratedArr = migrateBlockColors(val as Block[]);
                    if (migratedArr !== val) { p[key] = migratedArr; changed = true; }
                } else if (typeof val[0] === 'object') {
                    // Array of items (like stats items or features)
                    let itemsChanged = false;
                    const migratedItems = val.map(item => {
                        const newItem = { ...item };
                        Object.keys(newItem).forEach(k => {
                            if (typeof newItem[k] === 'string' && COLOR_MAP[newItem[k].toLowerCase()]) {
                                newItem[k] = COLOR_MAP[newItem[k].toLowerCase()];
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

export function recursiveClone(block: Block): Block {
    const newId = crypto.randomUUID();
    const newProps = { ...block.props };

    if (Array.isArray(newProps.childBlocks)) {
        newProps.childBlocks = newProps.childBlocks.map(recursiveClone);
    }
    if (Array.isArray(newProps.col0)) {
        newProps.col0 = newProps.col0.map(recursiveClone);
    }
    if (Array.isArray(newProps.col1)) {
        newProps.col1 = newProps.col1.map(recursiveClone);
    }
    if (Array.isArray(newProps.items)) {
        newProps.items = (newProps.items as any[]).map(item => ({
            ...item,
            id: `slot-${crypto.randomUUID()}`,
            blocks: Array.isArray(item.blocks) ? item.blocks.map(recursiveClone) : []
        }));
    }

    // Generic nested objects with IDs (e.g. Accordion items, sub-features)
    for (const key in newProps) {
        const val = newProps[key];
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null && 'id' in (val[0] as any)) {
            newProps[key] = (val as any[]).map(v => ({ ...v, id: crypto.randomUUID() }));
        }
    }

    return { ...block, id: newId, props: newProps };
}

function duplicateBlockDeep(blocks: Block[], targetId: string): { newBlocks: Block[], clonedId: string | null } {
    let clonedId: string | null = null;
    const items = blocks.flatMap(b => {
        if (b.id === targetId) {
            const clone = recursiveClone(b);
            clonedId = clone.id;
            return [b, clone]; // Insert after
        }

        let changed = false;
        const newProps = { ...b.props };

        ["childBlocks", "col0", "col1"].forEach(prop => {
            if (Array.isArray(b.props[prop])) {
                const res = duplicateBlockDeep(b.props[prop] as Block[], targetId);
                if (res.clonedId) {
                    newProps[prop] = res.newBlocks;
                    clonedId = res.clonedId;
                    changed = true;
                }
            }
        });

        // Search inside grid items
        if (Array.isArray(b.props.items) && !changed) {
            const items = b.props.items as any[];
            const newItems = items.map(item => {
                if (changed || !Array.isArray(item.blocks)) return item;
                const res = duplicateBlockDeep(item.blocks, targetId);
                if (res.clonedId) {
                    clonedId = res.clonedId;
                    changed = true;
                    return { ...item, blocks: res.newBlocks };
                }
                return item;
            });
            if (changed) newProps.items = newItems;
        }

        if (changed) return [{ ...b, props: newProps }];
        return [b];
    });
    return { newBlocks: items, clonedId };
}

export const useEditorStore = create<EditorStore>()(
    immer((set, get) => ({
        page: null,
        selectedBlockId: null,
        selectBlockTick: 0,
        hoveredBlockId: null,
        history: [],
        historyIndex: -1,
        isDirty: false,
        isSaving: false,
        viewMode: "desktop",
        iconPicker: {
            open: false,
            value: "Star",
            onSelect: () => { },
            anchorRect: null,
        },
        activeRouteId: null,
        activeDrag: null,
        subItemFocus: null,
        blockPicker: {
            open: false,
            target: null,
            preferredTab: "sections",
        },
        templatePicker: {
            open: false,
        },
        mediaPicker: {
            open: false,
            type: "all",
            onSelect: () => { },
            title: "Select Media",
        },
        wizard: {
            open: false,
            blankMode: false,
        },

        setPage: (page) =>
            set((state) => {
                // Multi-page migration check
                if (!page.routes || page.routes.length === 0) {
                    const header = page.content?.find(b => b.type === "header") || null;
                    const footer = page.content?.find(b => b.type === "footer") || null;
                    const middle = page.content?.filter(b => b.type !== "header" && b.type !== "footer") || [];

                    page.routes = [{
                        id: "home",
                        path: "/",
                        name: "Home",
                        content: middle,
                        showInHeader: false,
                        showInFooter: false
                    }];
                    page.globalBlocks = { header, footer };
                    page.content = []; // Clear legacy
                }

                // Ensure globalBlocks exists even if routes exist
                if (!page.globalBlocks) {
                    page.globalBlocks = { header: null, footer: null };
                }

                if (!page.theme) {
                    page.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
                }

                const fallbackRouteId = page.routes && page.routes.length > 0 ? page.routes[0].id : "home";

                state.page = page;
                state.activeRouteId = fallbackRouteId;
                state.isDirty = false;

                // Run migrations
                const themeChanged = forceLightModeMigration(page);
                const blocksMigratedArr = migrateBlockColors(page.routes[0]?.content || []); // Initial pass
                // Note: full deep migration happens on setPage as well

                state.history = [JSON.parse(JSON.stringify(page))];
                state.historyIndex = 0;
            }),

        setActiveRoute: (routeId) => set({ activeRouteId: routeId }),
        addRoute: (route) => {
            const { page } = get();
            if (!page) return;

            const newRoute: import("@/types").RouteConfig = {
                id: crypto.randomUUID(),
                name: route.name,
                path: route.path,
                content: [],
                hideHeader: route.hideHeader,
                hideFooter: route.hideFooter,
                showInHeader: route.showInHeader ?? true,
                showInFooter: route.showInFooter ?? false,
            };

            set((s) => {
                if (!s.page) return;
                if (!s.page.routes) s.page.routes = [];
                s.page.routes.push(newRoute);
                s.activeRouteId = newRoute.id;
                s.isDirty = true;
                get().pushHistory();
            });
        },
        updateRoute: (routeId, updates) => set((s) => {
            if (!s.page || !s.page.routes) return;
            const r = s.page.routes.find(x => x.id === routeId);
            if (r) {
                if (updates.name !== undefined) r.name = updates.name;
                if (updates.path !== undefined) r.path = updates.path;
                if (updates.hideHeader !== undefined) r.hideHeader = updates.hideHeader;
                if (updates.hideFooter !== undefined) r.hideFooter = updates.hideFooter;
                if (updates.showInHeader !== undefined) r.showInHeader = updates.showInHeader;
                if (updates.showInFooter !== undefined) r.showInFooter = updates.showInFooter;
                s.isDirty = true;
                get().pushHistory();
            }
        }),
        deleteRoute: (routeId) => set((s) => {
            if (!s.page || !s.page.routes) return;
            s.page.routes = s.page.routes.filter(x => x.id !== routeId);
            if (s.activeRouteId === routeId) {
                s.activeRouteId = s.page.routes[0]?.id || null;
            }
            s.isDirty = true;
            get().pushHistory();
        }),

        selectBlock: (id) => set((s) => { s.selectedBlockId = id; s.selectBlockTick = (s.selectBlockTick || 0) + 1; }),
        hoverBlock: (id) => set({ hoveredBlockId: id }),
        focusSubItem: (blockId, index: number | string) => set({ subItemFocus: { blockId, index } }),
        setViewMode: (mode) => set({ viewMode: mode }),
        setIsSaving: (v) => set({ isSaving: v }),
        setActiveDrag: (drag: EditorStore["activeDrag"]) => set({ activeDrag: drag }),

        showIconPicker: (params) => set((state) => {
            state.iconPicker = {
                open: true,
                value: params.value,
                onSelect: params.onSelect,
                anchorRect: params.anchorRect,
            };
        }),

        hideIconPicker: () => set((state) => {
            state.iconPicker.open = false;
        }),

        setIconPickerValue: (value) => set((state) => {
            state.iconPicker.value = value;
        }),

        showMediaPicker: (params) => set((state) => {
            state.mediaPicker = {
                open: true,
                type: params.type || "all",
                onSelect: params.onSelect,
                title: params.title || "Select Media",
            };
        }),

        hideMediaPicker: () => set((state) => {
            state.mediaPicker.open = false;
        }),

        openBlockPicker: (target, preferredTab = "sections") => set({ blockPicker: { open: true, target, preferredTab } }),
        closeBlockPicker: () => set({ blockPicker: { open: false, target: null } }),
        addBlockAtTarget: (block, target) => {
            const freshBlock = recursiveClone(block);
            set((s) => {
                if (!s.page) return;
                const activeRoute = s.page.routes?.find(r => r.id === s.activeRouteId);
                if (!activeRoute) return;

                if (target.id === "canvas-root") {
                    if (freshBlock.type === "header") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.header = freshBlock;
                    } else if (freshBlock.type === "footer") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.footer = freshBlock;
                    } else {
                        activeRoute.content.push(freshBlock);
                    }
                } else {
                    // Reuse the deep insertion logic from moveBlock
                    let roots = [
                        ...(s.page.globalBlocks?.header ? [s.page.globalBlocks.header] : []),
                        ...activeRoute.content,
                        ...(s.page.globalBlocks?.footer ? [s.page.globalBlocks.footer] : []),
                    ];

                    const { newBlocks: afterInsert, inserted } = insertBlockDeep(
                        roots, freshBlock, target.id, target.position, target.childProp
                    );

                    if (inserted) {
                        const newHeader = afterInsert.find(b => b.type === "header") || null;
                        const newFooter = afterInsert.find(b => b.type === "footer") || null;
                        const newContent = afterInsert.filter(b => b.type !== "header" && b.type !== "footer");

                        if (s.page.globalBlocks) {
                            if (newHeader) s.page.globalBlocks.header = newHeader;
                            if (newFooter) s.page.globalBlocks.footer = newFooter;
                        }
                        activeRoute.content = newContent;
                    } else {
                        // Fallback: just add to route if insertion failed
                        activeRoute.content.push(freshBlock);
                    }
                }

                s.isDirty = true;
                s.blockPicker.open = false; // Auto-close on select
            });
            get().pushHistory();
            return freshBlock;
        },

        openTemplatePicker: () => set((s) => { s.templatePicker.open = true; }),
        closeTemplatePicker: () => set((s) => { s.templatePicker.open = false; }),
        applyTemplate: (content, theme) => {
            const freshContent = content.map(b => recursiveClone(b));
            set((s) => {
                if (!s.page) return;
                const activeRoute = s.page.routes?.find(r => r.id === s.activeRouteId);
                if (!activeRoute) return;

                activeRoute.content = freshContent;
                if (theme) {
                    s.page.theme = {
                        ...s.page.theme,
                        ...theme,
                        colors: { ...s.page.theme.colors, ...theme.colors },
                        fonts: { ...s.page.theme.fonts, ...theme.fonts },
                    } as ThemeConfig;
                }
                s.isDirty = true;
                s.templatePicker.open = false;
            });
            get().pushHistory();
        },

        addBlock: (block, parentId) => {
            const freshBlock = recursiveClone(block);
            set((s) => {
                if (!s.page) return;

                // Initialize if empty
                if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                if (!s.page.routes) s.page.routes = [];
                const activeRoute = s.page.routes.find(r => r.id === s.activeRouteId);

                if (parentId) {
                    applyUpdaterDeep(s.page, s.activeRouteId, (blocks) => findAndUpdate(blocks, parentId, (b) => ({
                        ...b, children: [...(b.children ?? []), freshBlock]
                    })));
                } else {
                    if (freshBlock.type === "header") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.header = freshBlock;
                    } else if (freshBlock.type === "footer") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.footer = freshBlock;
                    } else if (activeRoute) {
                        activeRoute.content.push(freshBlock);
                    }
                }
                s.isDirty = true;
            });
            get().pushHistory();
            return freshBlock;
        },

        updateBlock: (id, props, commit) => {
            set((s) => {
                if (!s.page) return;
                applyUpdaterDeep(s.page, s.activeRouteId, (blocks) => findAndUpdate(blocks, id, (b) => ({
                    ...b, props: { ...b.props, ...props }
                })));
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        updateBlockStyle: (id, style, commit) => {
            set((s) => {
                if (!s.page) return;
                applyUpdaterDeep(s.page, s.activeRouteId, (blocks) => findAndUpdate(blocks, id, (b) => ({
                    ...b, style: { ...b.style, ...style }
                })));
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        duplicateBlock: (id) => {
            set((s) => {
                if (!s.page) return;
                const activeRoute = s.page.routes?.find(r => r.id === s.activeRouteId);

                // Regular route content duplication
                if (activeRoute) {
                    const { newBlocks, clonedId } = duplicateBlockDeep(activeRoute.content, id);
                    if (clonedId) {
                        activeRoute.content = newBlocks;
                        s.selectedBlockId = clonedId; // Auto-select clone
                        s.isDirty = true;
                    }
                } else if (s.page.content) {
                    const { newBlocks, clonedId } = duplicateBlockDeep(s.page.content, id);
                    if (clonedId) {
                        s.page.content = newBlocks;
                        s.selectedBlockId = clonedId;
                        s.isDirty = true;
                    }
                }
            });
            get().pushHistory();
        },
        deleteBlock: (id) => {
            set((s) => {
                if (!s.page) return;
                applyUpdaterDeep(s.page, s.activeRouteId, (blocks) => findAndDelete(blocks, id));
                if (s.selectedBlockId === id) s.selectedBlockId = null;
                s.isDirty = true;
            });
            get().pushHistory();
        },
        swapBlocks: (idA, idB) => {
            set((s) => {
                if (!s.page) return;

                let blockA: Block | null = null;
                let blockB: Block | null = null;

                // 1. Find both blocks
                function search(blocks: Block[]) {
                    for (const b of blocks) {
                        if (b.id === idA) blockA = b;
                        if (b.id === idB) blockB = b;
                        if (blockA && blockB) return;
                        if (b.children) search(b.children);
                        if (b.props.col0) search(b.props.col0 as Block[]);
                        if (b.props.col1) search(b.props.col1 as Block[]);
                        if (b.props.items) {
                            (b.props.items as any[]).forEach(item => {
                                if (item.blocks) search(item.blocks);
                            });
                        }
                    }
                }

                if (s.page.globalBlocks?.header) search([s.page.globalBlocks.header]);
                if (s.page.globalBlocks?.footer) search([s.page.globalBlocks.footer]);
                if (s.page.routes) {
                    s.page.routes.forEach(r => { if (!blockA || !blockB) search(r.content); });
                }

                if (!blockA || !blockB) return;

                const a = blockA as Block;
                const b = blockB as Block;
                const newA = { ...a };
                const newB = { ...b };

                function swapWalk(blocks: Block[]): Block[] {
                    let changedAny = false;
                    const nextBlocks = blocks.map(b => {
                        if (b.id === idA) { changedAny = true; return newB; }
                        if (b.id === idB) { changedAny = true; return newA; }

                        let updated = b;
                        let localChanged = false;

                        if (updated.children && updated.children.length > 0) {
                            const nextChildren = swapWalk(updated.children);
                            if (nextChildren !== updated.children) {
                                updated = { ...updated, children: nextChildren };
                                localChanged = true;
                            }
                        }

                        const newProps = { ...updated.props };
                        for (const key of ["col0", "col1", "childBlocks"]) {
                            const arr = updated.props[key] as Block[] | undefined;
                            if (arr && arr.length > 0) {
                                const nextArr = swapWalk(arr);
                                if (nextArr !== arr) { newProps[key] = nextArr; localChanged = true; }
                            }
                        }

                        const items = updated.props.items as { id: string, blocks: Block[] }[] | undefined;
                        if (items && items.length > 0) {
                            let itemsChanged = false;
                            const nextItems = items.map(item => {
                                if (item.blocks && item.blocks.length > 0) {
                                    const nextBlocks = swapWalk(item.blocks);
                                    if (nextBlocks !== item.blocks) {
                                        itemsChanged = true;
                                        return { ...item, blocks: nextBlocks };
                                    }
                                }
                                return item;
                            });
                            if (itemsChanged) { newProps.items = nextItems; localChanged = true; }
                        }

                        if (localChanged) {
                            changedAny = true;
                            return { ...updated, props: newProps };
                        }
                        return updated;
                    });
                    return changedAny ? nextBlocks : blocks;
                }

                applyUpdaterDeep(s.page, s.activeRouteId, swapWalk);
                s.isDirty = true;
            });
            get().pushHistory();
        },
        
        replaceBlock: (id, newBlock) => set((s) => {
            if (!s.page) return;
            applyUpdaterDeep(s.page, s.activeRouteId, (blocks) => {
                const updater = (list: Block[]): Block[] => {
                    return list.map(b => {
                        if (b.id === id) return { ...newBlock, id }; // Keep original ID to preserve position
                        const next = { ...b };
                        let changed = false;
                        if (next.children) {
                            const res = updater(next.children);
                            if (res !== next.children) { next.children = res; changed = true; }
                        }
                        ["col0", "col1", "childBlocks"].forEach(key => {
                            if (Array.isArray(next.props[key])) {
                                const res = updater(next.props[key] as Block[]);
                                if (res !== next.props[key]) {
                                    next.props = { ...next.props, [key]: res };
                                    changed = true;
                                }
                            }
                        });
                        if (Array.isArray(next.props.items)) {
                            const nextItems = (next.props.items as any[]).map(item => {
                                if (!item.blocks) return item;
                                const res = updater(item.blocks);
                                if (res !== item.blocks) { changed = true; return { ...item, blocks: res }; }
                                return item;
                            });
                            if (changed) next.props = { ...next.props, items: nextItems };
                        }
                        return next;
                    });
                };
                return updater(blocks);
            });
            s.isDirty = true;
            get().pushHistory();
        }),


        moveBlock: (activeId, overId, position = "after", childProp?) =>
            set((s) => {
                if (!s.page || !s.activeRouteId) return;

                const activeRoute = s.page.routes?.find(r => r.id === s.activeRouteId);
                if (!activeRoute) return;

                // Flatten to a single array for findAndRemove / insert actions 
                // However, we only allow reordering within activeRoute.content OR internal to header/footer.
                // You cannot move header to route or route block to header at root level.

                // Construct a virtual flattened tree:
                let roots = [
                    ...(s.page.globalBlocks?.header ? [s.page.globalBlocks.header] : []),
                    ...activeRoute.content,
                    ...(s.page.globalBlocks?.footer ? [s.page.globalBlocks.footer] : []),
                ];

                const { newBlocks: afterRemove, removed } = findAndRemoveBlock(roots, activeId);
                if (!removed) return;

                if (removed.type === "header" || removed.type === "footer") {
                    // Header/Footer cannot be moved. Reject move.
                    return;
                }

                if (overId === "canvas-root") {
                    // Append to end of route content
                    activeRoute.content = activeRoute.content.filter(b => b.id !== activeId);
                    
                    if (removed.type === "header") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.header = removed;
                    } else if (removed.type === "footer") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        s.page.globalBlocks.footer = removed;
                    } else {
                        activeRoute.content.push(removed);
                    }
                } else {
                    const { newBlocks: afterInsert, inserted } = insertBlockDeep(afterRemove, removed, overId, position, childProp);

                    if (inserted) {
                        // Extract back header/footer and assign route content
                        const newHeader = afterInsert.find(b => b.type === "header") || null;
                        const newFooter = afterInsert.find(b => b.type === "footer") || null;
                        const newContent = afterInsert.filter(b => b.type !== "header" && b.type !== "footer");

                        // We do NOT allow moving standard blocks into header/footer level as roots
                        // If they went into Header/Footer children, that's fine, the newHeader will contain them.
                        if (s.page.globalBlocks) {
                            if (newHeader) s.page.globalBlocks.header = newHeader;
                            if (newFooter) s.page.globalBlocks.footer = newFooter;
                        }
                        activeRoute.content = newContent;
                    }
                }

                s.isDirty = true;
            }),

        updateTheme: (theme, commit) => {
            set((s: any) => {
                if (!s.page) return;

                // Safety: Ensure theme object exists
                if (!s.page.theme) {
                    s.page.theme = JSON.parse(JSON.stringify(DEFAULT_THEME));
                }

                // Hard enforce light mode
                const newTheme = { ...theme, mode: "light" as const };
                s.page.theme = { ...s.page.theme, ...newTheme };

                // Ensure base colors are light-compatible
                if (s.page.theme.colors.background === "#020617" || s.page.theme.colors.background === "#09090b") {
                    s.page.theme.colors.background = "#ffffff";
                }
                if (s.page.theme.colors.text === "#f8fafc" || s.page.theme.colors.text === "#ffffff") {
                    s.page.theme.colors.text = "#0f172a";
                }

                applyUpdaterDeep(s.page, s.activeRouteId, migrateBlockColors);
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        forceLightMode: () => set((s) => {
            if (!s.page || !s.page.theme) return;
            if (s.page.theme.mode === "light") return;

            s.page.theme.mode = "light";
            s.page.theme.colors = { ...s.page.theme.colors, ...LIGHT_COLORS };
            if (s.page.theme.colors.background === "#020617" || s.page.theme.colors.background === "#09090b") {
                s.page.theme.colors.background = "#ffffff";
            }
            applyUpdaterDeep(s.page, s.activeRouteId, migrateBlockColors);
            s.isDirty = true;
        }),

        updateMeta: (meta) =>
            set((s) => {
                if (!s.page) return;
                s.page.meta = { ...s.page.meta, ...meta };
                s.isDirty = true;
            }),

        updateSlug: (slug) =>
            set((s) => {
                if (!s.page) return;
                s.page.slug = slug;
                s.isDirty = true;
            }),

        updateTitle: (title) =>
            set((s) => {
                if (!s.page) return;
                s.page.title = title;
                s.isDirty = true;
            }),

        updatePageData: (data, commit = false) => {
            set((s) => {
                if (!s.page) return;
                Object.assign(s.page, data);
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        undo: () =>
            set((s) => {
                if (s.historyIndex <= 0) return;
                s.historyIndex--;
                s.page = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
                s.isDirty = true;
            }),

        redo: () =>
            set((s) => {
                if (s.historyIndex >= s.history.length - 1) return;
                s.historyIndex++;
                s.page = JSON.parse(JSON.stringify(s.history[s.historyIndex]));
                s.isDirty = true;
            }),

        markClean: () => set((s) => { s.isDirty = false; }),

        // ─ Internal Helper ──────────────────────────────────────────────────────
        pushHistory: () => set((s) => {
            if (!s.page) return;
            const snapshot = JSON.parse(JSON.stringify(s.page));
            // Only push if content/theme actually changed from the last history entry
            const last = s.history[s.historyIndex];
            if (last && JSON.stringify(last) === JSON.stringify(snapshot)) return;

            s.history = s.history.slice(0, s.historyIndex + 1);
            s.history.push(snapshot);
            // Limit history to 50 states
            if (s.history.length > 50) {
                s.history.shift();
            } else {
                s.historyIndex++;
            }
            s.isDirty = true;
        }),

        migrateThemeColors: () => set((s) => {
            if (!s.page) return;

            // 1. Migrate Blocks
            applyUpdaterDeep(s.page, s.activeRouteId, migrateBlockColors);

            // 2. Migrate Theme Colors (if any are hardcoded to old values)
            const c = s.page.theme.colors;
            const OLD_PRIMARY = ["#6366f1", "#6366F1"];
            const OLD_SECONDARY = ["#8b5cf6", "#8B5CF6"];

            if (OLD_PRIMARY.includes(c.primary)) c.primary = "var(--primary)";
            if (OLD_SECONDARY.includes(c.secondary)) c.secondary = "var(--secondary)";
            if (c.background === "#ffffff") c.background = "var(--background)";
            if (c.text === "#0f172a") c.text = "var(--text)";

            // Trigger history push
            const snapshot = JSON.parse(JSON.stringify(s.page));
            s.history = s.history.slice(0, s.historyIndex + 1);
            s.history.push(snapshot);
            s.historyIndex++;
            s.isDirty = true;
        }),

        openWizard: (blankMode = false) => set((s) => {
            s.wizard.open = true;
            s.wizard.blankMode = blankMode;
        }),
        closeWizard: () => set((s) => {
            s.wizard.open = false;
        }),
    }))
);
