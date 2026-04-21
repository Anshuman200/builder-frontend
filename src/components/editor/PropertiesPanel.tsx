"use client";

import type { Block } from "@/types";
/**
 * PropertiesPanel.tsx — Thin dispatcher (kept for backward compat)
 *
 * All panel editor implementations are in:
 *   panels/shared.tsx          ← Field, TextInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, Section, PANEL_COLORS
 *   panels/BasicPanels.tsx     ← HeroPanel, TextPanel, ImagePanel, DividerPanel, ContainerPanel, IconPanel, VideoPanel, ColumnsPanel
 *   panels/LayoutPanels.tsx    ← ButtonPanel, HeaderPanel, FooterPanel
 *   panels/ContentPanels.tsx   ← FeaturesPanel, TeamPanel, PageSettingsPanel
 */

import React, { useRef, useEffect, useState } from "react";

import { useEditorStore } from "@/stores/editorStore";
import { Section, Field, TextInput, PANEL_COLORS } from "./panels/shared";
import { ConfigProvider, theme as antdTheme } from "antd";

// ─── Shared panel primitives re-export ───────────────────────────────────────
export { Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, PANEL_COLORS } from "./panels/shared";

// ─── Per-panel imports ────────────────────────────────────────────────────────
import { HeroPanel, TextPanel, ImagePanel, DividerPanel, ContainerPanel, IconPanel, VideoPanel, ColumnsPanel, WavePanel, CarouselPanel, GridPanel } from "./panels/BasicPanels";
import { ButtonPanel, HeaderPanel, FooterPanel } from "./panels/LayoutPanels";
import { FeaturesPanel, TeamPanel, PageSettingsPanel, ContactFormPanel, ContactInfoPanel, AccordionPanel, StatsPanel, ChartPanel, LegalPanel, DeleteAccountPanel } from "./panels/ContentPanels";
import { GalleryPanel } from "./panels/GalleryPanel";

// ─── Friendly label map ──────────────────────────────────────────────────────
const BLOCK_LABEL_MAP: Record<string, string> = {
    header: "Header Block",
    hero: "Hero / Section Block",
    container: "Container Block",
    text: "Text / Heading Block",
    image: "Image Block",
    video: "Video Block",
    icon: "Icon Block",
    button: "Button Block",
    divider: "Divider Block",
    features: "Features Block",
    team: "Team Block",
    footer: "Footer Block",
    contactForm: "Contact Form Block",
    contactInfo: "Contact Details Block",
    deleteAccount: "Delete Account Block",
    accordion: "FAQ / Accordion Block",
    columns: "Columns Block",
    carousel: "Carousel Block",
    wave: "Wave Divider Block",
    masonry: "Masonry Gallery Block",
    stats: "Stats & KPIs Block",
    chart: "Data Chart Block",
    "media-picker": "Media Picker Block",
    tos: "Terms of Service Block",
    privacy: "Privacy Policy Block",
};
function blockLabel(type: string): string {
    return BLOCK_LABEL_MAP[type] ?? `${type.charAt(0).toUpperCase()}${type.slice(1)} Block`;
}

// ─── Main PropertiesPanel ────────────────────────────────────────────────────

function findBlock(blocks: Block[] | undefined, id: string): Block | undefined {
    if (!blocks || !Array.isArray(blocks)) return undefined;
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) { const found = findBlock(b.children, id); if (found) return found; }

        // Search inside named column props
        const col0 = b.props.col0 as Block[] | undefined;
        const col1 = b.props.col1 as Block[] | undefined;
        const childBlocks = b.props.childBlocks as Block[] | undefined;
        if (col0) { const f = findBlock(col0, id); if (f) return f; }
        if (col1) { const f = findBlock(col1, id); if (f) return f; }
        if (childBlocks) { const f = findBlock(childBlocks, id); if (f) return f; }

        // Search inside generic items array (Grid units)
        const items = b.props.items as { id: string, blocks: Block[] }[] | undefined;
        if (items) {
            for (const item of items) {
                const found = findBlock(item.blocks, id);
                if (found) return found;
            }
        }
    }
    return undefined;
}

// ─── Main PropertiesPanel ────────────────────────────────────────────────────

export default function PropertiesPanel() {
    const { page, selectedBlockId, updateBlock, activeRouteId } = useEditorStore();

    // Ref for the scrollable aside container
    const scrollRef = useRef<HTMLElement>(null);

    // flashKey increments on every block click (even same block re-selected) to replay animation
    const [flashKey, setFlashKey] = useState(0);

    // Subscribe to selectBlockTick — fires whenever ANY click to selectBlock happens
    useEffect(() => {
        let prevTick = useEditorStore.getState().selectBlockTick;
        return useEditorStore.subscribe((state) => {
            if (state.selectBlockTick !== prevTick) {
                prevTick = state.selectBlockTick;
                // If it's just a block selection with no sub-focus, scroll to top
                if (!state.subItemFocus) {
                    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                }
                setFlashKey(k => k + 1);
            }
        });
    }, []);

    // Handle sub-item focal scrolling (e.g. clicking logo -> scroll to Brand section)
    const subItemFocus = useEditorStore(s => s.subItemFocus);
    useEffect(() => {
        if (subItemFocus && typeof subItemFocus.index === "string") {
            const sectionId = `section-${subItemFocus.index.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`;
            // Small delay to ensure the panel has rendered the new block's sections if we just switched blocks
            const timer = setTimeout(() => {
                const el = document.getElementById(sectionId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [subItemFocus]);

    let rootSearchBlocks: Block[] = [];
    if (page) {
        const activeRoute = page.routes?.find(r => r.id === activeRouteId);
        rootSearchBlocks = [
            ...(page.globalBlocks?.header ? [page.globalBlocks.header] : []),
            ...(activeRoute?.content || page.content || []),
            ...(page.globalBlocks?.footer ? [page.globalBlocks.footer] : [])
        ];
    }

    const selectedBlock = selectedBlockId && page
        ? findBlock(rootSearchBlocks, selectedBlockId)
        : null;

    if (!selectedBlock) {
        if (page) return <PageSettingsPanel page={page} />;
        return null;
    }

    return (
        <ConfigProvider
            theme={{
                algorithm: antdTheme.darkAlgorithm,
                token: {
                    colorPrimary: PANEL_COLORS.primary,
                    colorBgContainer: PANEL_COLORS.inputBg,
                    colorBorder: PANEL_COLORS.border,
                    colorText: PANEL_COLORS.text,
                    colorTextDescription: PANEL_COLORS.muted,
                    colorBgElevated: PANEL_COLORS.sectionBg,
                    borderRadius: 4,
                },
                components: {
                    Select: {
                        controlHeight: 26,
                        fontSize: 11,
                    },
                    Input: {
                        controlHeight: 26,
                        fontSize: 11,
                    }
                }
            }}
        >
            <aside
                ref={scrollRef}
                style={{
                    width: 380, flexShrink: 0,
                    background: PANEL_COLORS.bg,
                    borderLeft: `1px solid ${PANEL_COLORS.border}`,
                    overflowY: "auto",
                    display: "flex", flexDirection: "column",
                }}
            >
                {/* WhatsApp-style flash animation */}
                <style>{`
                    @keyframes props-flash {
                        0%   { background: rgba(99,102,241,0.9); box-shadow: inset 3px 0 0 rgba(99,102,241,0.8); }
                        40%  { background: rgba(99,102,241,0.5); box-shadow: inset 3px 0 0 rgba(99,102,241,0.5); }
                        60%  { background: rgba(99,102,241,0.2); box-shadow: inset 3px 0 0 rgba(99,102,241,0.2); }
                        100% { background: transparent; box-shadow: inset 3px 0 0 transparent; }
                    }
                    .props-header-flash {
                        animation: props-flash 10.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    }
                `}</style>

                {/* Panel Header — re-keyed so animation replays on each block switch */}
                <div
                    key={`flash-${flashKey}`}
                    className="props-header-flash"
                    style={{
                        padding: "12px 14px",
                        borderBottom: `1px solid ${PANEL_COLORS.border}`,
                    }}
                >
                    <p style={{
                        margin: 0, fontSize: 10, fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        color: PANEL_COLORS.muted,
                    }}>
                        Properties
                    </p>
                    <p style={{
                        margin: "2px 0 0", fontSize: 12,
                        color: PANEL_COLORS.text, fontWeight: 600, textTransform: "capitalize",
                    }}>
                        {blockLabel(selectedBlock.type)}
                    </p>
                </div>

                {/* Type-specific editors */}
                {selectedBlock.type === "header" && <HeaderPanel block={selectedBlock} />}
                {selectedBlock.type === "hero" && <HeroPanel block={selectedBlock} />}
                {selectedBlock.type === "container" && <ContainerPanel block={selectedBlock} />}
                {selectedBlock.type === "text" && <TextPanel block={selectedBlock} />}
                {selectedBlock.type === "image" && <ImagePanel block={selectedBlock} />}
                {selectedBlock.type === "video" && <VideoPanel block={selectedBlock} />}
                {selectedBlock.type === "icon" && <IconPanel block={selectedBlock} />}
                {selectedBlock.type === "button" && <ButtonPanel block={selectedBlock} />}
                {selectedBlock.type === "divider" && <DividerPanel block={selectedBlock} />}
                {selectedBlock.type === "features" && <FeaturesPanel block={selectedBlock} />}
                {selectedBlock.type === "team" && <TeamPanel block={selectedBlock} />}
                {selectedBlock.type === "columns" && <ColumnsPanel block={selectedBlock} />}
                {selectedBlock.type === "footer" && <FooterPanel block={selectedBlock} />}
                {selectedBlock.type === "contactForm" && <ContactFormPanel block={selectedBlock} />}
                {selectedBlock.type === "contactInfo" && <ContactInfoPanel block={selectedBlock} />}
                {selectedBlock.type === "accordion" && <AccordionPanel block={selectedBlock} />}
                {selectedBlock.type === "wave" && <WavePanel block={selectedBlock} />}
                {selectedBlock.type === "carousel" && <CarouselPanel block={selectedBlock} />}
                {selectedBlock.type === "grid" && <GridPanel block={selectedBlock} />}
                {selectedBlock.type === "masonry" && <GalleryPanel block={selectedBlock} />}
                {selectedBlock.type === "stats" && <StatsPanel block={selectedBlock} />}
                {selectedBlock.type === "chart" && <ChartPanel block={selectedBlock} />}
                {selectedBlock.type === "deleteAccount" && <DeleteAccountPanel block={selectedBlock} />}
                {(selectedBlock.type === "tos" || selectedBlock.type === "privacy" || selectedBlock.type === "about") && <LegalPanel block={selectedBlock} />}

                {/* Generic Section ID field for all blocks */}
                <Section title="Advanced">
                    <Field label="Section ID (Anchor)">
                        <TextInput
                            placeholder="e.g. pricing"
                            value={(selectedBlock.props.sectionId as string) || ""}
                            onChange={(v: string) => updateBlock(selectedBlock.id, { sectionId: v })}
                        />
                    </Field>
                    <div style={{ fontSize: 10, color: PANEL_COLORS.muted, marginTop: "4px" }}>
                        Assign an ID to link directly here via Header/Footer navigation (e.g. link URL as #pricing).
                    </div>
                </Section>
            </aside>
        </ConfigProvider>
    );
}
