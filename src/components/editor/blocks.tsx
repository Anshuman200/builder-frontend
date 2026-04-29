"use client";

import type { Block } from "@/types";
/**
 * blocks.tsx — Thin re-export dispatcher (kept for backward compat)
 *
 * All block implementations are in:
 *   blocks/shared.tsx           ← types, PreviewContext, ChildBlockWrapper, DropZoneStrip
 *   blocks/HeroBlock.tsx        ← HeroBlock
 *   blocks/ContainerBlock.tsx   ← ContainerBlock
 *   blocks/TextBlock.tsx        ← TextBlock
 *   blocks/ImageBlock.tsx       ← ImageBlock
 *   blocks/ButtonBlock.tsx      ← ButtonBlock
 *   blocks/DividerBlock.tsx     ← DividerBlock
 *   blocks/ColumnsBlock.tsx     ← ColumnsBlock
 *   blocks/HeaderBlock.tsx      ← HeaderBlock
 *   blocks/FooterBlock.tsx      ← FooterBlock
 *   blocks/IconBlock.tsx        ← IconBlock
 *   blocks/VideoBlock.tsx       ← VideoBlock
 *   blocks/FeaturesBlock.tsx    ← FeaturesBlock
 *   blocks/TeamBlock.tsx        ← TeamBlock
 */

import React from "react";


// ─── Shared imports ───────────────────────────────────────────────────────────
import { setBlockRenderer } from "./blocks/shared";

// ─── Shared re-exports (backward compat) ─────────────────────────────────────
export { PreviewContext, PreviewProvider, ChildBlockWrapper, DropZoneStrip } from "./blocks/shared";
export type { BlockProps } from "./blocks/shared";

// ─── Per-block imports ────────────────────────────────────────────────────────
import { HeroBlock } from "./blocks/HeroBlock";
import { ContainerBlock } from "./blocks/ContainerBlock";
import { TextBlock } from "./blocks/TextBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { ButtonBlock } from "./blocks/ButtonBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { ColumnsBlock } from "./blocks/ColumnsBlock";
import { HeaderBlock } from "./blocks/HeaderBlock";
import { FooterBlock } from "./blocks/FooterBlock";
import { IconBlock } from "./blocks/IconBlock";
import { VideoBlock } from "./blocks/VideoBlock";
import { FeaturesBlock } from "./blocks/FeaturesBlock";
import { TeamBlock } from "./blocks/TeamBlock";
import { ContactFormBlock } from "./blocks/ContactFormBlock";
import { ContactInfoBlock } from "./blocks/ContactInfoBlock";
import AccordionBlock from "./blocks/AccordionBlock";
import { WaveBlock } from "./blocks/WaveBlock";
import { MasonryBlock } from "./blocks/MasonryBlock";
import { MediaPickerBlock } from "./blocks/MediaPickerBlock";
import { StatsBlock } from "./blocks/StatsBlock";
import { ChartBlock } from "./blocks/ChartBlock";
import { LegalBlock } from "./blocks/LegalBlock";
import { DeleteAccountBlock } from "./blocks/DeleteAccountBlock";
import { GridBlock } from "./blocks/GridBlock";
import { QRCodeBlock } from "./blocks/QRCodeBlock";
 
// ─── Block Renderer dispatch ──────────────────────────────────────────────────
 
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "header":
    case "header-2": return <HeaderBlock block={block} />;
    case "hero": return <HeroBlock block={block} />;
    case "container": return <ContainerBlock block={block} />;
    case "text": return <TextBlock block={block} />;
    case "image": return <ImageBlock block={block} />;
    case "video": return <VideoBlock block={block} />;
    case "icon": return <IconBlock block={block} />;
    case "button": return <ButtonBlock block={block} />;
    case "divider": return <DividerBlock block={block} />;
    case "features": return <FeaturesBlock block={block} />;
    case "team": return <TeamBlock block={block} />;
    case "columns": return <ColumnsBlock block={block} />;
    case "contactForm": return <ContactFormBlock block={block} />;
    case "contactInfo": return <ContactInfoBlock block={block} />;
    case "accordion": return <AccordionBlock block={block} />;
    case "wave": return <WaveBlock block={block} />;
    case "masonry": return <MasonryBlock block={block} />;
    case "media-picker": return <MediaPickerBlock block={block} />;
    case "stats": return <StatsBlock block={block} />;
    case "chart": return <ChartBlock block={block} />;
    case "grid": return <GridBlock block={block} />;
    case "qrcode": return <QRCodeBlock block={block} />;
    case "deleteAccount": return <DeleteAccountBlock block={block} />;
    case "tos":
    case "privacy":
    case "about": return <LegalBlock block={block} />;
    case "footer":
    case "footer-2": return <FooterBlock block={block} />;
    default: return (
      <div style={{ padding: 16, color: "var(--text-subtle)", fontSize: 13 }}>
        Unknown block: {block.type}
      </div>
    );
  }
}

// ─── Register the BlockRenderer so ChildBlockWrapper can recursively render ───
// This MUST happen after BlockRenderer is defined. Solves the circular dep issue
// where blocks/shared.tsx cannot directly import from blocks.tsx.
setBlockRenderer(BlockRenderer);
