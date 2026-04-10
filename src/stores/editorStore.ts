import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Block, BlockStyle, AnimationConfig, ThemeConfig, MetaConfig, EditorPage } from "@/types";

// ─── Default Theme ───────────────────────────────────────────────────────────
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
    features: {
        scrollToTop: true,
        scrollToTopPosition: "bottom-right",
        scrollToTopColor: "#6366f1",
        themeSwitcher: true,
        themeSwitcherPosition: "bottom-left",
    }
};


// ─── Editor Store ─────────────────────────────────────────────────────────────
interface EditorStore {
    page: EditorPage | null;
    selectedBlockId: string | null;
    hoveredBlockId: string | null;
    history: EditorPage[];
    historyIndex: number;
    isDirty: boolean;
    isSaving: boolean;
    viewMode: "desktop" | "tablet" | "mobile";
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
        block?: Block;
    } | null;

    // ─ Actions ────────────────────────────────────────────────────────────────
    setPage: (page: EditorPage) => void;
    selectBlock: (id: string | null) => void;
    hoverBlock: (id: string | null) => void;
    setViewMode: (mode: "desktop" | "tablet" | "mobile") => void;
    setIsSaving: (v: boolean) => void;
    setActiveDrag: (drag: EditorStore["activeDrag"]) => void;

    showIconPicker: (params: { value: string; onSelect: (name: string) => void; anchorRect: { top: number; left: number; width: number; height: number } }) => void;
    hideIconPicker: () => void;
    setIconPickerValue: (value: string) => void;

    addBlock: (block: Block, parentId?: string) => void;
    updateBlock: (id: string, props: Partial<Block["props"]>, commit?: boolean) => void;
    updateBlockStyle: (id: string, style: Partial<BlockStyle>, commit?: boolean) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (activeId: string, overId: string, position?: "before" | "after" | "inside", childProp?: string) => void;

    updateTheme: (theme: Partial<ThemeConfig>, commit?: boolean) => void;
    updateMeta: (meta: Partial<MetaConfig>) => void;
    updateSlug: (slug: string) => void;
    updateTitle: (title: string) => void;
    updatePageData: (data: Partial<Pick<EditorPage, "isTemplate" | "isPublic" | "isLocked" | "category" | "visibility" | "password">>) => void;
    migrateThemeColors: () => void;
    pushHistory: () => void;

    undo: () => void;
    redo: () => void;
    markClean: () => void;
}

function updateColProps(b: Block, id: string, updater: (b: Block) => Block): Block {
    const col0 = b.props.col0 as Block[] | undefined;
    const col1 = b.props.col1 as Block[] | undefined;
    const childBlocks = b.props.childBlocks as Block[] | undefined;
    const newCol0 = col0 ? findAndUpdate(col0, id, updater) : col0;
    const newCol1 = col1 ? findAndUpdate(col1, id, updater) : col1;
    const newChildBlocks = childBlocks ? findAndUpdate(childBlocks, id, updater) : childBlocks;
    if (newCol0 !== col0 || newCol1 !== col1 || newChildBlocks !== childBlocks) {
        return {
            ...b, props: {
                ...b.props,
                ...(newCol0 !== col0 ? { col0: newCol0 } : {}),
                ...(newCol1 !== col1 ? { col1: newCol1 } : {}),
                ...(newChildBlocks !== childBlocks ? { childBlocks: newChildBlocks } : {}),
            }
        };
    }
    return b;
}

function deleteColProps(b: Block, id: string): Block {
    const col0 = b.props.col0 as Block[] | undefined;
    const col1 = b.props.col1 as Block[] | undefined;
    const childBlocks = b.props.childBlocks as Block[] | undefined;
    const newCol0 = col0 ? findAndDelete(col0, id) : col0;
    const newCol1 = col1 ? findAndDelete(col1, id) : col1;
    const newChildBlocks = childBlocks ? findAndDelete(childBlocks, id) : childBlocks;
    if (newCol0 !== col0 || newCol1 !== col1 || newChildBlocks !== childBlocks) {
        return {
            ...b, props: {
                ...b.props,
                ...(newCol0 !== col0 ? { col0: newCol0 } : {}),
                ...(newCol1 !== col1 ? { col1: newCol1 } : {}),
                ...(newChildBlocks !== childBlocks ? { childBlocks: newChildBlocks } : {}),
            }
        };
    }
    return b;
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
            if (position === "before") newBlocks.push(insertBlock, b);
            else if (position === "after") newBlocks.push(b, insertBlock);
            else if (position === "inside" && childProp) {
                const updated = { ...b };
                if (childProp === "children") {
                    updated.children = [...(updated.children || []), insertBlock];
                } else {
                    const existing = (updated.props[childProp] as Block[]) || [];
                    updated.props = { ...updated.props, [childProp]: [...existing, insertBlock] };
                }
                newBlocks.push(updated);
            }
            inserted = true;
        } else {
            const updated = { ...b };
            if (updated.children && !inserted) {
                const res = insertBlockDeep(updated.children, insertBlock, targetId, position, childProp);
                if (res.inserted) { updated.children = res.newBlocks; inserted = true; }
            }
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
            newBlocks.push(updated);
        }
    }
    return { newBlocks, inserted };
}

/**
 * Recursively migrates hardcoded old default hex colors to CSS variables.
 */
function migrateBlockColors(blocks: Block[]): Block[] {
    const COLOR_MAP: Record<string, string> = {
        // Pure Darks
        "#000000": "var(--text)",
        "#020617": "var(--bg)",
        "#09090b": "var(--bg)",
        "#0f172a": "var(--primary)",
        "#11181f": "var(--surface)",
        "#111827": "var(--surface)",
        "#18181b": "var(--surface)",
        "#1a1a1a": "var(--surface)",
        "#1e293b": "var(--surface)",
        // Pure Lights
        "#ffffff": "var(--bg)",
        "#fafafa": "var(--bg)",
        "#f8fafc": "var(--surface)",
        "#f1f5f9": "var(--surface)",
        "#e2e8f0": "var(--border)",
        "#cbd5e1": "var(--border-strong)",
        // Brand Indigo/Violet
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
                if (TEXT_PROPS.includes(key) && (hex === "#ffffff" || hex === "#fff" || hex === "#f8fafc" || hex === "#fafafa")) {
                    p[key] = "var(--text)";
                    changed = true;
                } else if (TEXT_PROPS.includes(key) && (hex === "#000000" || hex === "#000" || hex === "#09090b")) {
                    p[key] = "var(--text)";
                    changed = true;
                } else if (BG_PROPS.includes(key) && (hex === "#ffffff" || hex === "#fff" || hex === "#fafafa")) {
                    // For analytics cards specifically, white usually means surface
                    if (b.type === "stats" || b.type === "chart") p[key] = "var(--surface)";
                    else p[key] = "var(--bg)";
                    changed = true;
                } else if (BG_PROPS.includes(key) && (hex === "#000000" || hex === "#09090b" || hex === "#111827" || hex === "#18181b" || hex === "#1a1a1a")) {
                    p[key] = "var(--surface)";
                    changed = true;
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

export const useEditorStore = create<EditorStore>()(
    immer((set, get) => ({
        page: null,
        selectedBlockId: null,
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
        activeDrag: null,

        setPage: (page) =>
            set((state) => {
                state.page = page;
                state.isDirty = false;
                state.history = [JSON.parse(JSON.stringify(page))];
                state.historyIndex = 0;
            }),

        selectBlock: (id) => set({ selectedBlockId: id }),
        hoverBlock: (id) => set({ hoveredBlockId: id }),
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

        addBlock: (block, parentId) => {
            set((s) => {
                if (!s.page) return;
                if (!s.page.content) s.page.content = [];
                if (parentId) {
                    s.page.content = findAndUpdate(s.page.content, parentId, (b) => ({
                        ...b,
                        children: [...(b.children ?? []), block],
                    }));
                } else {
                    if (block.type === "header") {
                        s.page.content.unshift(block);
                    } else if (block.type === "footer") {
                        s.page.content.push(block);
                    } else {
                        // Insert before footer if it exists, otherwise push
                        const footerIdx = s.page.content.findIndex(b => b.type === "footer");
                        if (footerIdx !== -1) {
                            s.page.content.splice(footerIdx, 0, block);
                        } else {
                            s.page.content.push(block);
                        }
                    }
                }
                s.isDirty = true;
            });
            get().pushHistory();
        },

        updateBlock: (id, props, commit) => {
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndUpdate(s.page.content, id, (b) => ({
                    ...b, props: { ...b.props, ...props },
                }));
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        updateBlockStyle: (id, style, commit) => {
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndUpdate(s.page.content, id, (b) => ({
                    ...b, style: { ...b.style, ...style },
                }));
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        deleteBlock: (id) => {
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndDelete(s.page.content, id);
                if (s.selectedBlockId === id) s.selectedBlockId = null;
                s.isDirty = true;
            });
            get().pushHistory();
        },

        moveBlock: (activeId, overId, position = "after", childProp?) =>
            set((s) => {
                if (!s.page) return;

                const { newBlocks: afterRemove, removed } = findAndRemoveBlock(s.page.content, activeId);
                if (!removed) return;

                // Enforce positioning
                if (removed.type === "header") {
                    s.page.content = [removed, ...afterRemove];
                } else if (removed.type === "footer") {
                    s.page.content = [...afterRemove, removed];
                } else {
                    if (overId === "canvas-root") {
                        // Insert before footer if exist
                        const fIdx = afterRemove.findIndex(b => b.type === "footer");
                        if (fIdx !== -1) {
                            const updated = [...afterRemove];
                            updated.splice(fIdx, 0, removed);
                            s.page.content = updated;
                        } else {
                            s.page.content = [...afterRemove, removed];
                        }
                    } else {
                        // Prevent moving generic blocks ABOVE header or BELOW footer at root level
                        const targetBlock = afterRemove.find(b => b.id === overId);
                        if (targetBlock?.type === "header" && position === "before") {
                            s.page.content = [targetBlock, removed, ...afterRemove.filter(b => b.id !== overId)];
                        } else if (targetBlock?.type === "footer" && position === "after") {
                            s.page.content = [...afterRemove.filter(b => b.id !== overId), removed, targetBlock];
                        } else {
                            const { newBlocks: afterInsert, inserted } = insertBlockDeep(afterRemove, removed, overId, position, childProp);
                            s.page.content = inserted ? afterInsert : [...afterRemove, removed];
                        }
                    }
                }

                s.isDirty = true;
            }),

        updateTheme: (theme, commit) => {
            set((s) => {
                if (!s.page) return;
                const oldMode = s.page.theme.mode;
                s.page.theme = { ...s.page.theme, ...theme };
                
                // If mode changed (e.g. Light -> Dark), automatically sync blocks
                if (theme.mode && theme.mode !== oldMode) {
                    s.page.content = migrateBlockColors(s.page.content);
                }
                
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

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

        updatePageData: (data) =>
            set((s) => {
                if (!s.page) return;
                Object.assign(s.page, data);
                s.isDirty = true;
            }),

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
            s.page.content = migrateBlockColors(s.page.content);

            // 2. Migrate Theme Colors (if any are hardcoded to old values)
            const c = s.page.theme.colors;
            const OLD_PRIMARY = ["#6366f1", "#6366F1"];
            const OLD_SECONDARY = ["#8b5cf6", "#8B5CF6"];
            
            if (OLD_PRIMARY.includes(c.primary)) c.primary = "var(--primary)";
            if (OLD_SECONDARY.includes(c.secondary)) c.secondary = "var(--secondary)";
            if (c.background === "#ffffff") c.background = "var(--bg)";
            if (c.text === "#0f172a") c.text = "var(--text)";

            // Trigger history push
            const snapshot = JSON.parse(JSON.stringify(s.page));
            s.history = s.history.slice(0, s.historyIndex + 1);
            s.history.push(snapshot);
            s.historyIndex++;
            s.isDirty = true;
        }),
    }))
);
