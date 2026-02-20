"use client";

import { Block } from "@/stores/editorStore";
import { HeroBlock } from "./HeroBlock";
import { HeadingBlock } from "./HeadingBlock";
import { TextBlock } from "./TextBlock";
import { ImageBlock } from "./ImageBlock";
import { ButtonBlock } from "./ButtonBlock";
import { DividerBlock } from "./DividerBlock";
import { SpacerBlock } from "./SpacerBlock";
import { ColumnsBlock } from "./ColumnsBlock";

interface BlockRendererProps {
  block: Block;
  selected?: boolean;
  hovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
  preview?: boolean;
}

export function BlockRenderer({
  block, selected, hovered, onSelect, onHover, preview,
}: BlockRendererProps) {
  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    outline: selected
      ? "2px solid #6366f1"
      : hovered
      ? "1px dashed rgba(99,102,241,0.5)"
      : "1px solid transparent",
    outlineOffset: selected ? -2 : 0,
    transition: "outline 0.15s",
    cursor: preview ? "default" : "pointer",
    ...(block.style?.margin ? { margin: block.style.margin } : {}),
    ...(block.style?.padding ? { padding: block.style.padding } : {}),
    ...(block.style?.background ? { background: block.style.background } : {}),
  };

  const handleClick = (e: React.MouseEvent) => {
    if (preview) return;
    e.stopPropagation();
    onSelect?.(block.id);
  };

  const handleMouseEnter = () => { if (!preview) onHover?.(block.id); };
  const handleMouseLeave = () => { if (!preview) onHover?.(null); };

  const content = (() => {
    switch (block.type) {
      case "hero": return <HeroBlock block={block} />;
      case "heading": return <HeadingBlock block={block} />;
      case "text": return <TextBlock block={block} />;
      case "image": return <ImageBlock block={block} />;
      case "button": return <ButtonBlock block={block} />;
      case "divider": return <DividerBlock block={block} />;
      case "spacer": return <SpacerBlock block={block} />;
      case "columns": return <ColumnsBlock block={block} preview={preview} />;
      default:
        return (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Unknown block type: {block.type}
          </div>
        );
    }
  })();

  return (
    <div
      style={wrapperStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-block-id={block.id}
    >
      {content}
      {!preview && (selected || hovered) && (
        <div style={{
          position: "absolute", top: 4, right: 6,
          background: selected ? "#6366f1" : "rgba(99,102,241,0.7)",
          color: "white", fontSize: "0.65rem", fontWeight: 700,
          padding: "1px 6px", borderRadius: "var(--radius-sm)",
          textTransform: "uppercase", letterSpacing: "0.05em",
          pointerEvents: "none",
        }}>
          {block.type}
        </div>
      )}
    </div>
  );
}
