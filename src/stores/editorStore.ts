import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import type { Block, BlockStyle, AnimationConfig, ThemeConfig, MetaConfig, EditorPage, RouteConfig } from "@/types";
import {
    applyUpdaterDeep as applyBlockUpdaterDeep,
    findAndDelete as deleteBlockFromTree,
    findAndRemoveBlock as removeBlockFromTree,
    findAndUpdate as updateBlockInTree,
    insertBlockDeep as insertBlockInTree,
    recursiveClone,
    duplicateBlockDeep as duplicateBlockTree,
} from "./editor/blockTree";
import { clonePage as cloneEditorPage, createHistory, pushHistorySnapshot } from "./editor/history";
import {
    forceLightModeMigration as enforceLightMode,
    migrateBlockColors as migrateEditorBlockColors,
    migratePageBlocks as migrateEditorPageBlocks,
} from "./editor/themeMigration";

export { recursiveClone };

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
    button: {
        width: "auto",
        minWidth: "",
        bgColor: "",
        textColor: "",
    },
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
            position: "before" | "after" | "inside" | "inside-start";
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
    waveEditorPos: { x: number, y: number } | null;
    waveEditorTrigger: number;
    textEditorTrigger: number;
    textEditorPos: { x: number, y: number } | null;
    wizard: {
        open: boolean;
        blankMode: boolean;
    };

    setWaveEditorPos: (pos: { x: number, y: number } | null) => void;
    setTextEditorPos: (pos: { x: number, y: number } | null) => void;
    triggerWaveEditor: () => void;
    triggerTextEditor: () => void;

    // ─ Actions ────────────────────────────────────────────────────────────────
    setPage: (page: EditorPage) => void;
    setActiveRoute: (routeId: string) => void;
    addRoute: (route: { path: string; name: string, hideHeader?: boolean, hideFooter?: boolean, showInHeader?: boolean, showInFooter?: boolean }) => void;
    updateRoute: (routeId: string, updates: Partial<Pick<RouteConfig, "path" | "name" | "hideHeader" | "hideFooter" | "showInHeader" | "showInFooter">>) => void;
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
    moveBlock: (activeId: string, overId: string, position?: "before" | "after" | "inside" | "inside-start", childProp?: string) => void;
    swapBlocks: (idA: string, idB: string) => void;
    replaceBlock: (id: string, newBlock: Block) => void;

    openBlockPicker: (target: { id: string, position: "before" | "after" | "inside" | "inside-start", childProp?: string }, preferredTab?: "sections" | "elements") => void;
    closeBlockPicker: () => void;
    addBlockAtTarget: (block: Block, target: NonNullable<EditorStore["blockPicker"]["target"]>) => Block;
    openTemplatePicker: () => void;
    closeTemplatePicker: () => void;
    applyTemplate: (content: Block[], theme?: Partial<ThemeConfig>) => void;

    updateTheme: (theme: Partial<ThemeConfig>, commit?: boolean) => void;
    updateMeta: (meta: Partial<MetaConfig>) => void;
    updateSlug: (slug: string) => void;
    updateTitle: (title: string) => void;
    updatePageData: (data: Partial<Pick<EditorPage, "isTemplate" | "isPublic" | "isLocked" | "category" | "tags" | "thumbnail" | "thumbnails" | "routes">>, commit?: boolean) => void;
    migrateThemeColors: () => void;
    pushHistory: () => void;

    undo: () => void;
    redo: () => void;
    markClean: () => void;
    openWizard: (blankMode?: boolean) => void;
    closeWizard: () => void;
    _mergeBlockProps: (oldBlock: Block | null, newBlock: Block) => Block["props"];
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
        waveEditorTrigger: 0,
        waveEditorPos: null,
        textEditorTrigger: 0,
        textEditorPos: null,
        wizard: {
            open: false,
            blankMode: false,
        },

        setWaveEditorPos: (pos) => set({ waveEditorPos: pos }),
        setTextEditorPos: (pos) => set({ textEditorPos: pos }),
        triggerWaveEditor: () => set((s) => {
            s.waveEditorTrigger = (s.waveEditorTrigger || 0) + 1;
            if (!s.waveEditorPos) {
                s.waveEditorPos = {
                    x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - 150,
                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - 300
                };
            }
        }),
        triggerTextEditor: () => set((s) => {
            s.textEditorTrigger = (s.textEditorTrigger || 0) + 1;
            if (!s.textEditorPos) {
                s.textEditorPos = {
                    x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - 150,
                    y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - 300
                };
            }
        }),

        setPage: (incomingPage) =>
            set((state) => {
                const page = cloneEditorPage(incomingPage);

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

                const currentRouteId = get().activeRouteId;
                let fallbackRouteId = page.routes && page.routes.length > 0 ? page.routes[0].id : "home";

                if (currentRouteId && page.routes?.some(r => r.id === currentRouteId)) {
                    fallbackRouteId = currentRouteId;
                } else if (typeof window !== "undefined") {
                    // 1. Try URL param first
                    const params = new URLSearchParams(window.location.search);
                    const queryRouteId = params.get("route");

                    if (queryRouteId && page.routes?.some(r => r.id === queryRouteId)) {
                        fallbackRouteId = queryRouteId;
                    } else {
                        // 2. Try localStorage backup
                        const saved = localStorage.getItem(`activeRoute_${page.id}`);
                        if (saved && page.routes?.some(r => r.id === saved)) {
                            fallbackRouteId = saved;
                        }
                    }
                }

                state.page = page;
                state.activeRouteId = fallbackRouteId;
                state.isDirty = false;

                enforceLightMode(page, DEFAULT_THEME);
                migrateEditorPageBlocks(page);

                const nextHistory = createHistory(page);
                state.history = nextHistory.history;
                state.historyIndex = nextHistory.historyIndex;
            }),

        setActiveRoute: (routeId) => set((s) => {
            s.activeRouteId = routeId;
            if (typeof window !== "undefined" && s.page?.id) {
                localStorage.setItem(`activeRoute_${s.page.id}`, routeId);
            }
        }),
        addRoute: (route) => {
            const { page } = get();
            if (!page) return;

            const newRoute: import("@/types").RouteConfig = {
                id: crypto.randomUUID(),
                name: route.name,
                path: route.path.startsWith("/") ? route.path : `/${route.path}`,
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
            });
            get().pushHistory();
        },
        updateRoute: (routeId, updates) => {
            set((s) => {
                if (!s.page || !s.page.routes) return;
                const r = s.page.routes.find(x => x.id === routeId);
                if (r) {
                    if (updates.name !== undefined) r.name = updates.name;
                    if (updates.path !== undefined) {
                        const p = updates.path;
                        r.path = p.startsWith("/") ? p : `/${p}`;
                    }
                    if (updates.hideHeader !== undefined) r.hideHeader = updates.hideHeader;
                    if (updates.hideFooter !== undefined) r.hideFooter = updates.hideFooter;
                    if (updates.showInHeader !== undefined) r.showInHeader = updates.showInHeader;
                    if (updates.showInFooter !== undefined) r.showInFooter = updates.showInFooter;
                    s.isDirty = true;
                }
            });
            get().pushHistory();
        },
        deleteRoute: (routeId) => {
            set((s) => {
                if (!s.page || !s.page.routes) return;
                s.page.routes = s.page.routes.filter(x => x.id !== routeId);
                if (s.activeRouteId === routeId) {
                    s.activeRouteId = s.page.routes[0]?.id || null;
                }
                s.isDirty = true;
            });
            get().pushHistory();
        },

        selectBlock: (id) => set((s) => {
            // Only clear sub-item focus if we are switching to a DIFFERENT block
            if (s.selectedBlockId !== id) {
                s.subItemFocus = null;
            }
            s.selectedBlockId = id;
            s.selectBlockTick = (s.selectBlockTick || 0) + 1;
        }),
        hoverBlock: (id) => set({ hoveredBlockId: id }),
        focusSubItem: (blockId, index: number | string) => set((s) => {
            console.log("Focus Sub Item:", { blockId, index });
            s.subItemFocus = { blockId, index };
            if (index === "Wave Decoration") {
                s.waveEditorTrigger = (s.waveEditorTrigger || 0) + 1;
                if (!s.waveEditorPos) {
                    s.waveEditorPos = {
                        x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - 150,
                        y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - 300
                    };
                }
            }
            if (index === "Typography") {
                s.textEditorTrigger = (s.textEditorTrigger || 0) + 1;
                if (!s.textEditorPos) {
                    s.textEditorPos = {
                        x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - 150,
                        y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - 300
                    };
                }
            }
        }),
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

        _mergeBlockProps: (oldBlock: Block | null, newBlock: Block) => {
            if (!oldBlock) return newBlock.props;
            const op = oldBlock.props || {};
            const np = newBlock.props || {};

            // Map common properties that users likely want to keep
            const keysToPreserve = [
                "logo", "logoUrl", "title", "brandName", "projectName",
                "logoShape", "logoWidth", "logoHeight", "logoObjectFit",
                "bgImage", "bgOpacity", "bgPosition", "bgOverlayColor",
                "links", "menuItems", "navigation", "navLinks",
                "socials", "socialLinks", "copyright",
                "buttonText", "ctaText", "buttonLink", "ctaLink",
                "phone", "email", "address"
            ];

            const merged = { ...np };
            keysToPreserve.forEach(key => {
                if (op[key] !== undefined && op[key] !== null) {
                    merged[key] = op[key];
                }
            });
            return merged;
        },

        addBlockAtTarget: (block, target) => {
            const freshBlock = recursiveClone(block);
            set((s) => {
                if (!s.page) return;
                const activeRoute = s.page.routes?.find(r => r.id === s.activeRouteId);
                if (!activeRoute) return;

                if (target.id === "canvas-root") {
                    if (freshBlock.type === "header") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        if (s.page.globalBlocks.header) {
                            if (!window.confirm("A Header already exists. Replace it and keep your current logo/links?")) return;
                            freshBlock.props = s._mergeBlockProps(s.page.globalBlocks.header, freshBlock);
                        }
                        s.page.globalBlocks.header = freshBlock;
                    } else if (freshBlock.type === "footer") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        if (s.page.globalBlocks.footer) {
                            if (!window.confirm("A Footer already exists. Replace it and keep your current content?")) return;
                            freshBlock.props = s._mergeBlockProps(s.page.globalBlocks.footer, freshBlock);
                        }
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

                    const { newBlocks: afterInsert, inserted } = insertBlockInTree(
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
                    applyBlockUpdaterDeep(s.page, s.activeRouteId, (blocks) => updateBlockInTree(blocks, parentId, (b) => ({
                        ...b, children: [...(b.children ?? []), freshBlock]
                    })));
                } else {
                    if (freshBlock.type === "header") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        if (s.page.globalBlocks.header) {
                            if (!window.confirm("A Header already exists. Replace it and keep your current logo/links?")) return;
                            freshBlock.props = (get() as any)._mergeBlockProps(s.page.globalBlocks.header, freshBlock);
                        }
                        s.page.globalBlocks.header = freshBlock;
                    } else if (freshBlock.type === "footer") {
                        if (!s.page.globalBlocks) s.page.globalBlocks = { header: null, footer: null };
                        if (s.page.globalBlocks.footer) {
                            if (!window.confirm("A Footer already exists. Replace it and keep your current content?")) return;
                            freshBlock.props = (get() as any)._mergeBlockProps(s.page.globalBlocks.footer, freshBlock);
                        }
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
                applyBlockUpdaterDeep(s.page, s.activeRouteId, (blocks) => updateBlockInTree(blocks, id, (b) => ({
                    ...b, props: { ...b.props, ...props }
                })));
                s.isDirty = true;
            });
            if (commit) get().pushHistory();
        },

        updateBlockStyle: (id, style, commit) => {
            set((s) => {
                if (!s.page) return;
                applyBlockUpdaterDeep(s.page, s.activeRouteId, (blocks) => updateBlockInTree(blocks, id, (b) => ({
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

                if (activeRoute) {
                    if (s.page.globalBlocks?.header?.id === id || s.page.globalBlocks?.footer?.id === id) return;

                    const roots = [
                        ...(s.page.globalBlocks?.header ? [s.page.globalBlocks.header] : []),
                        ...activeRoute.content,
                        ...(s.page.globalBlocks?.footer ? [s.page.globalBlocks.footer] : []),
                    ];
                    const { newBlocks, clonedId } = duplicateBlockTree(roots, id);
                    if (clonedId) {
                        const newHeader = newBlocks.find(b => b.type === "header") || null;
                        const newFooter = newBlocks.find(b => b.type === "footer") || null;
                        const newContent = newBlocks.filter(b => b.type !== "header" && b.type !== "footer");

                        if (s.page.globalBlocks) {
                            s.page.globalBlocks.header = newHeader;
                            s.page.globalBlocks.footer = newFooter;
                        }
                        activeRoute.content = newContent;
                        s.selectedBlockId = clonedId; // Auto-select clone
                        s.isDirty = true;
                    }
                } else if (s.page.content) {
                    const { newBlocks, clonedId } = duplicateBlockTree(s.page.content, id);
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
                applyBlockUpdaterDeep(s.page, s.activeRouteId, (blocks) => deleteBlockFromTree(blocks, id));
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

                applyBlockUpdaterDeep(s.page, s.activeRouteId, swapWalk);
                s.isDirty = true;
            });
            get().pushHistory();
        },

        replaceBlock: (id, newBlock) => {
            set((s) => {
                if (!s.page) return;
                applyBlockUpdaterDeep(s.page, s.activeRouteId, (blocks) => {
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
            });
            get().pushHistory();
        },


        moveBlock: (activeId, overId, position = "after", childProp?) => {
            let moved = false;
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

                const { newBlocks: afterRemove, removed } = removeBlockFromTree(roots, activeId);
                if (!removed) return;

                if (removed.type === "header" || removed.type === "footer") {
                    // Header/Footer cannot be moved. Reject move.
                    return;
                }

                if (overId === "canvas-root") {
                    // Append to end of route content
                    const newHeader = afterRemove.find(b => b.type === "header") || null;
                    const newFooter = afterRemove.find(b => b.type === "footer") || null;
                    const newContent = afterRemove.filter(b => b.type !== "header" && b.type !== "footer");

                    if (s.page.globalBlocks) {
                        s.page.globalBlocks.header = newHeader;
                        s.page.globalBlocks.footer = newFooter;
                    }
                    activeRoute.content = [...newContent, removed];
                    moved = true;
                } else {
                    const { newBlocks: afterInsert, inserted } = insertBlockInTree(afterRemove, removed, overId, position, childProp);

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
                        moved = true;
                    }
                }

                if (moved) s.isDirty = true;
            });
            if (moved) get().pushHistory();
        },

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

                applyBlockUpdaterDeep(s.page, s.activeRouteId, migrateEditorBlockColors);
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
            applyBlockUpdaterDeep(s.page, s.activeRouteId, migrateEditorBlockColors);
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
                s.page = cloneEditorPage(s.history[s.historyIndex]);
                s.isDirty = true;
            }),

        redo: () =>
            set((s) => {
                if (s.historyIndex >= s.history.length - 1) return;
                s.historyIndex++;
                s.page = cloneEditorPage(s.history[s.historyIndex]);
                s.isDirty = true;
            }),

        markClean: () => set((s) => { s.isDirty = false; }),

        // ─ Internal Helper ──────────────────────────────────────────────────────
        pushHistory: () => set((s) => {
            if (!s.page) return;
            const next = pushHistorySnapshot(s.history, s.historyIndex, s.page);
            if (!next.changed) return;
            s.history = next.history;
            s.historyIndex = next.historyIndex;
            s.isDirty = true;
        }),

        migrateThemeColors: () => set((s) => {
            if (!s.page) return;

            // 1. Migrate Blocks
            applyBlockUpdaterDeep(s.page, s.activeRouteId, migrateEditorBlockColors);

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
