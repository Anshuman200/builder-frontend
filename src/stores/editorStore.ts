import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Block, BlockStyle, AnimationConfig, ThemeConfig, MetaConfig, EditorPage } from "@/@Types";

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
    },
    fonts: { heading: "Inter", body: "Inter" },
    borderRadius: "md",
    spacing: "normal",
    layout: {
        maxWidth: "100dvw",
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

    // ─ Actions ────────────────────────────────────────────────────────────────
    setPage: (page: EditorPage) => void;
    selectBlock: (id: string | null) => void;
    hoverBlock: (id: string | null) => void;
    setViewMode: (mode: "desktop" | "tablet" | "mobile") => void;
    setIsSaving: (v: boolean) => void;

    addBlock: (block: Block, parentId?: string) => void;
    updateBlock: (id: string, props: Partial<Block["props"]>) => void;
    updateBlockStyle: (id: string, style: Partial<BlockStyle>) => void;
    deleteBlock: (id: string) => void;
    moveBlock: (activeId: string, overId: string, position?: "before" | "after" | "inside", childProp?: string) => void;

    updateTheme: (theme: Partial<ThemeConfig>) => void;
    updateMeta: (meta: Partial<MetaConfig>) => void;
    updateSlug: (slug: string) => void;
    updateTitle: (title: string) => void;
    updatePageData: (data: Partial<Pick<EditorPage, "isTemplate" | "isPublic" | "isLocked" | "category">>) => void;

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

        setPage: (page) =>
            set((s) => {
                s.page = { ...page, content: page.content || [] };
                s.history = [s.page];
                s.historyIndex = 0;
                s.isDirty = false;
            }),

        selectBlock: (id) => set((s) => { s.selectedBlockId = id; }),
        hoverBlock: (id) => set((s) => { s.hoveredBlockId = id; }),
        setViewMode: (mode) => set((s) => { s.viewMode = mode; }),
        setIsSaving: (v) => set((s) => { s.isSaving = v; }),

        addBlock: (block, parentId) =>
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
                const snapshot = JSON.parse(JSON.stringify(s.page));
                s.history = s.history.slice(0, s.historyIndex + 1);
                s.history.push(snapshot);
                s.historyIndex++;
            }),

        updateBlock: (id, props) =>
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndUpdate(s.page.content, id, (b) => ({
                    ...b, props: { ...b.props, ...props },
                }));
                s.isDirty = true;
            }),

        updateBlockStyle: (id, style) =>
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndUpdate(s.page.content, id, (b) => ({
                    ...b, style: { ...b.style, ...style },
                }));
                s.isDirty = true;
            }),

        deleteBlock: (id) =>
            set((s) => {
                if (!s.page) return;
                s.page.content = findAndDelete(s.page.content, id);
                if (s.selectedBlockId === id) s.selectedBlockId = null;
                s.isDirty = true;
            }),

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

        updateTheme: (theme) =>
            set((s) => {
                if (!s.page) return;
                s.page.theme = { ...s.page.theme, ...theme };
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
    }))
);
