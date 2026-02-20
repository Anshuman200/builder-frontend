import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

// ─── Types ────────────────────────────────────────────────────────────────────
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
    type: "fade-in" | "slide-up" | "slide-in-left" | "zoom-in" | "bounce" | "none";
    delay: number;
    duration: number;
    trigger: "load" | "scroll";
}

export interface ThemeConfig {
    colors: {
        primary: string;
        secondary: string;
        background: string;
        surface: string;
        text: string;
        textMuted: string;
        border: string;
        accent: string;
    };
    fonts: { heading: string; body: string };
    borderRadius: "none" | "sm" | "md" | "lg" | "full";
    spacing: "compact" | "normal" | "relaxed";
}

export interface MetaConfig {
    title?: string;
    description?: string;
    ogImage?: string;
    robots?: string;
    favicon?: string;
}

export interface EditorPage {
    id: string;
    title: string;
    slug: string;
    content: Block[];
    theme: ThemeConfig;
    meta: MetaConfig;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

// ─── Default Theme ───────────────────────────────────────────────────────────
export const DEFAULT_THEME: ThemeConfig = {
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
    moveBlock: (activeId: string, overId: string) => void;

    updateTheme: (theme: Partial<ThemeConfig>) => void;
    updateMeta: (meta: Partial<MetaConfig>) => void;
    updateSlug: (slug: string) => void;
    updateTitle: (title: string) => void;

    undo: () => void;
    redo: () => void;
    markClean: () => void;
}

function findAndUpdate(blocks: Block[], id: string, updater: (b: Block) => Block): Block[] {
    return blocks.map((b) => {
        if (b.id === id) return updater(b);
        if (b.children?.length) return { ...b, children: findAndUpdate(b.children, id, updater) };
        return b;
    });
}

function findAndDelete(blocks: Block[], id: string): Block[] {
    return blocks.filter((b) => b.id !== id).map((b) =>
        b.children ? { ...b, children: findAndDelete(b.children, id) } : b
    );
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
                s.page = page;
                s.history = [page];
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

        moveBlock: (activeId, overId) =>
            set((s) => {
                if (!s.page) return;
                const blocks = s.page.content;
                const activeIdx = blocks.findIndex((b) => b.id === activeId);
                const overIdx = blocks.findIndex((b) => b.id === overId);
                if (activeIdx === -1 || overIdx === -1) return;
                const [removed] = blocks.splice(activeIdx, 1);
                blocks.splice(overIdx, 0, removed);
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
