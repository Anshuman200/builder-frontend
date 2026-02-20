"use client";

import { Block } from "@/stores/editorStore";

interface SpacerProps {
  height?: number;
}

export function SpacerBlock({ block }: { block: Block }) {
  const p = block.props as SpacerProps;
  const height = p.height ?? 48;

  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0,
        transition: "opacity 0.15s",
      }}
        className="spacer-label"
      >
        <span style={{
          fontSize: "0.7rem", color: "var(--text-subtle)", fontWeight: 500,
          padding: "2px 6px", background: "var(--surface)",
          borderRadius: "var(--radius-sm)", border: "1px dashed var(--border)",
        }}>
          Spacer — {height}px
        </span>
      </div>
    </div>
  );
}
