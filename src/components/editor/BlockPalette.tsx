"use client";

import { useDraggable } from "@dnd-kit/core";
import * as icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BLOCK_TYPES, type BlockConfig } from "@/lib/blockConfig";

export default function BlockPalette() {
  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 14px 8px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Blocks
        </p>
      </div>

      {/* Block List */}
      <div
        style={{
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {BLOCK_TYPES.map((config) => (
          <PaletteCard key={config.type} config={config} />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "12px 14px",
          marginTop: "auto",
          borderTop: "1px solid var(--border)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            color: "var(--text-subtle)",
            lineHeight: 1.5,
          }}
        >
          Drag blocks onto the canvas to build your page.
        </p>
      </div>
    </aside>
  );
}

function PaletteCard({ config }: { config: BlockConfig }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${config.type}`,
    data: { type: "palette", blockType: config.type },
  });

  // ✅ Fully type-safe icon resolution
  const Icon: any = icons[config.icon as keyof typeof icons] ?? icons.Square;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 10px",
        borderRadius: 8,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        cursor: "grab",
        opacity: isDragging ? 0.4 : 1,
        userSelect: "none",
        transition: "background 0.12s, border-color 0.12s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-hover)";
        e.currentTarget.style.borderColor = "var(--primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 6,
          background: "var(--primary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "var(--primary)",
        }}
      >
        <Icon size={14} />
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "var(--text)",
        }}
      >
        {config.label}
      </span>
    </div>
  );
}