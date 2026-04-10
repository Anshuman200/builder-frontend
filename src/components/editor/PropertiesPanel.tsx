"use client";

import type { Block, EditorPage } from "@/types";
/**
 * PropertiesPanel.tsx — Thin dispatcher (kept for backward compat)
 *
 * All panel editor implementations are in:
 *   panels/shared.tsx          ← Field, TextInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, Section, PANEL_COLORS
 *   panels/BasicPanels.tsx     ← HeroPanel, TextPanel, ImagePanel, DividerPanel, ContainerPanel, IconPanel, VideoPanel, ColumnsPanel
 *   panels/LayoutPanels.tsx    ← ButtonPanel, HeaderPanel, FooterPanel
 *   panels/ContentPanels.tsx   ← FeaturesPanel, TeamPanel, PageSettingsPanel
 */

import React from "react";

import { useEditorStore } from "@/stores/editorStore";
import { Section, Field, TextInput } from "./panels/shared";

// ─── Shared panel primitives re-export ───────────────────────────────────────
export { Section, Field, TextInput, TextareaInput, SelectInput, ColorInput, BorderRadiusInput, ToggleInput, MediaInput, PANEL_COLORS } from "./panels/shared";

// ─── Per-panel imports ────────────────────────────────────────────────────────
import { HeroPanel, TextPanel, ImagePanel, DividerPanel, ContainerPanel, IconPanel, VideoPanel, ColumnsPanel, WavePanel, CarouselPanel } from "./panels/BasicPanels";
import { ButtonPanel, HeaderPanel, FooterPanel } from "./panels/LayoutPanels";
import { FeaturesPanel, TeamPanel, PageSettingsPanel, ContactFormPanel, AccordionPanel, StatsPanel, ChartPanel } from "./panels/ContentPanels";

// ─── Block finder utility ─────────────────────────────────────────────────────

function findBlock(blocks: Block[] | undefined, id: string): Block | undefined {
    if (!blocks || !Array.isArray(blocks)) return undefined;
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) { const found = findBlock(b.children, id); if (found) return found; }
        const col0 = b.props.col0 as Block[] | undefined;
        const col1 = b.props.col1 as Block[] | undefined;
        const childBlocks = b.props.childBlocks as Block[] | undefined;
        if (col0) { const f = findBlock(col0, id); if (f) return f; }
        if (col1) { const f = findBlock(col1, id); if (f) return f; }
        if (childBlocks) { const f = findBlock(childBlocks, id); if (f) return f; }
    }
    return undefined;
}

// ─── Main PropertiesPanel ────────────────────────────────────────────────────

export default function PropertiesPanel() {
    const { page, selectedBlockId, updateBlock } = useEditorStore();

    const selectedBlock = selectedBlockId && page
        ? findBlock(page.content, selectedBlockId)
        : null;

    if (!selectedBlock) {
        if (page) return <PageSettingsPanel page={page} />;
        return null;
    }

    return (
        <aside style={{ width: 380, flexShrink: 0, background: "var(--bg-secondary)", borderLeft: "1px solid var(--border)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {/* Panel Header */}
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ margin: 0, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>Properties</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text)", fontWeight: 600, textTransform: "capitalize" }}>{selectedBlock.type} Block</p>
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
            {selectedBlock.type === "accordion" && <AccordionPanel block={selectedBlock} />}
            {selectedBlock.type === "wave" && <WavePanel block={selectedBlock} />}
            {selectedBlock.type === "carousel" && <CarouselPanel block={selectedBlock} />}
            {selectedBlock.type === "stats" && <StatsPanel block={selectedBlock} />}
            {selectedBlock.type === "chart" && <ChartPanel block={selectedBlock} />}

            {/* Generic Section ID field for all blocks */}
            <Section title="Advanced">
                <Field label="Section ID (Anchor)">
                    <TextInput
                        placeholder="e.g. pricing"
                        value={(selectedBlock.props.sectionId as string) || ""}
                        onChange={(v: string) => updateBlock(selectedBlock.id, { sectionId: v })}
                    />
                </Field>
                <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: "4px" }}>
                    Assign an ID to link directly here via Header/Footer navigation (e.g. link URL as #pricing).
                </div>
            </Section>
        </aside>
    );
}
