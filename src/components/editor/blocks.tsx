"use client";

import type { Block } from "@/types";
import React from "react";

// ─── Shared imports ───────────────────────────────────────────────────────────
import { setBlockRenderer, BlockContext } from "./blocks/shared";

// ─── Shared re-exports (backward compat) ─────────────────────────────────────
export { PreviewContext, PreviewProvider, ChildBlockWrapper, DropZoneStrip, BlockContext, WaveQuickEditor, TextQuickEditor } from "./blocks/shared";
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

type BlockComponent = React.ComponentType<{ block: Block }>;

const blockRegistry: Record<string, BlockComponent> = {
  header: HeaderBlock,
  "header-2": HeaderBlock,
  hero: HeroBlock,
  container: ContainerBlock,
  text: TextBlock,
  image: ImageBlock,
  video: VideoBlock,
  icon: IconBlock,
  button: ButtonBlock,
  divider: DividerBlock,
  features: FeaturesBlock,
  team: TeamBlock,
  columns: ColumnsBlock,
  contactForm: ContactFormBlock,
  contactInfo: ContactInfoBlock,
  accordion: AccordionBlock,
  wave: WaveBlock,
  masonry: MasonryBlock,
  "media-picker": MediaPickerBlock,
  stats: StatsBlock,
  chart: ChartBlock,
  grid: GridBlock,
  qrcode: QRCodeBlock,
  deleteAccount: DeleteAccountBlock,
  tos: LegalBlock,
  privacy: LegalBlock,
  about: LegalBlock,
  footer: FooterBlock,
  "footer-2": FooterBlock,
};
 
export function BlockRenderer({ block }: { block: Block }) {
  const Component = blockRegistry[block.type];

  return (
    <BlockContext.Provider value={block.id}>
      {Component ? (
        <Component block={block} />
      ) : (
        <div style={{ padding: 16, color: "var(--text-subtle)", fontSize: 13 }}>
          Unknown block: {block.type}
        </div>
      )}
    </BlockContext.Provider>
  );
}

setBlockRenderer(BlockRenderer);
