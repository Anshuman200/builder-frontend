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
    updatePageData: (data: Partial<Pick<EditorPage, "isTemplate" | "isPublic" | "isLocked" | "category">>) => void;
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
    const OLD_PRIMARY = ["#6366f1", "#6366F1"];
    const OLD_SECONDARY = ["#8b5cf6", "#8b5cf6"];
    const OLD_BUTTON_TEXT = ["#ffffff", "#FFFFFF", "#fff", "#FFF"];
    const OLD_OVERLAY = ["rgba(0,0,0,0.25)"];

    return blocks.map(b => {
        const p = { ...b.props };
        let changed = false;

        // Traverse props for color fields
        Object.keys(p).forEach(key => {
            const val = p[key];
            if (typeof val === 'string') {
                if (OLD_PRIMARY.includes(val)) { p[key] = "var(--primary)"; changed = true; }
                else if (OLD_SECONDARY.includes(val)) { p[key] = "var(--secondary)"; changed = true; }
                else if (OLD_OVERLAY.includes(val)) { p[key] = "var(--overlay)"; changed = true; }
                // For button text, we only replace it if it's explicitly white, 
                // but we should be careful not to break other white text.
                // In our templates, ctaTextColor/buttonTextColor use these.
                else if ((key.toLowerCase().includes('text') || key.toLowerCase().includes('button')) && OLD_BUTTON_TEXT.includes(val)) {
                    p[key] = "var(--button-text)"; changed = true;
                }
            }
            // Recurse into array props (cols)
            if (Array.isArray(val) && val.length > 0 && (val[0] as any)?.id) {
                const migratedArr = migrateBlockColors(val as Block[]);
                if (migratedArr !== val) { p[key] = migratedArr; changed = true; }
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
                    s.page.content.push(block);
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

                // 1. Remove the block from wherever it is in the tree
                const { newBlocks: afterRemove, removed } = findAndRemoveBlock(s.page.content, activeId);
                if (!removed) return; // Block not found

                // 2. Insert it at the target
                if (overId === "canvas-root") {
                    // special case: moving back to root at the end
                    s.page.content = [...afterRemove, removed];
                } else {
                    const { newBlocks: afterInsert, inserted } = insertBlockDeep(afterRemove, removed, overId, position, childProp);
                    if (inserted) {
                        s.page.content = afterInsert;
                    } else {
                        // fallback if failed (e.g., targetId not found)
                        s.page.content = [...afterRemove, removed];
                    }
                }

                s.isDirty = true;
            }),

        updateTheme: (theme, commit) => {
            set((s) => {
                if (!s.page) return;
                s.page.theme = { ...s.page.theme, ...theme };
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
            s.page.content = migrateBlockColors(s.page.content);
            const get = (s as any).get; // zustand type workaround if needed, but immer 's' is the state
            // Trigger history push
            const snapshot = JSON.parse(JSON.stringify(s.page));
            s.history = s.history.slice(0, s.historyIndex + 1);
            s.history.push(snapshot);
            s.historyIndex++;
        }),
    }))
);
