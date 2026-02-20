"use client";

import { useState } from "react";
import {
  LayoutTemplate, Type, AlignLeft, Image, MousePointer,
  Minus, Space, Columns2, ChevronDown, ChevronRight,
} from "lucide-react";
import { useEditorStore, Block } from "@/stores/editorStore";

interface BlockDef {
  type: string;
  label: string;
  icon: React.ReactNode;
  defaultProps: Record<string, unknown>;
  category: string;
}

const BLOCK_DEFS: BlockDef[] = [
  {
    type: "hero",
    label: "Hero Section",
    icon: <LayoutTemplate size={16} />,
    category: "Layout",
    defaultProps: {
      heading: "Your Headline Here",
      subheading: "A compelling description of your product or service.",
      ctaText: "Get Started",
      ctaHref: "#",
      align: "center",
      bgColor: "linear-gradient(135deg, #0f0f23, #1a0533)",
      textColor: "#ffffff",
      ctaColor: "#6366f1",
    },
  },
  {
    type: "columns",
    label: "Columns",
    icon: <Columns2 size={16} />,
    category: "Layout",
    defaultProps: { columns: 2, gap: 24, columnBlocks: [[], []] },
  },
  {
    type: "heading",
    label: "Heading",
    icon: <Type size={16} />,
    category: "Content",
    defaultProps: { text: "Section Heading", level: "h2", align: "left" },
  },
  {
    type: "text",
    label: "Text",
    icon: <AlignLeft size={16} />,
    category: "Content",
    defaultProps: { text: "Add your body text here. This is a paragraph block.", align: "left", size: "md" },
  },
  {
    type: "image",
    label: "Image",
    icon: <Image size={16} />,
    category: "Media",
    defaultProps: { src: "", alt: "", fit: "cover", height: 300, align: "center" },
  },
  {
    type: "button",
    label: "Button",
    icon: <MousePointer size={16} />,
    category: "Content",
    defaultProps: { label: "Click me", href: "#", variant: "primary", size: "md", align: "center", color: "#6366f1" },
  },
  {
    type: "divider",
    label: "Divider",
    icon: <Minus size={16} />,
    category: "Layout",
    defaultProps: { style: "solid", color: "var(--border)", thickness: 1, width: 100, align: "center" },
  },
  {
    type: "spacer",
    label: "Spacer",
    icon: <Space size={16} />,
    category: "Layout",
    defaultProps: { height: 48 },
  },
];

const CATEGORIES = ["Layout", "Content", "Media"];

export function BlockPanel() {
  const addBlock = useEditorStore(s => s.addBlock);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAdd = (def: BlockDef) => {
    const block: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: def.type,
      props: { ...def.defaultProps },
    };
    addBlock(block);
  };

  return (
    <aside style={{
      position: "fixed",
      top: 52, left: 0, bottom: 0,
      width: 220,
      background: "var(--bg)",
      borderRight: "1px solid var(--border)",
      display: "flex", flexDirection: "column",
      zIndex: 100,
      overflowY: "auto",
    }}>
      <div style={{
        padding: "0.75rem 0.875rem 0.5rem",
        borderBottom: "1px solid var(--border)",
      }}>
        <h2 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Blocks
        </h2>
      </div>

      <div style={{ flex: 1, padding: "0.5rem 0.5rem" }}>
        {CATEGORIES.map(cat => {
          const defs = BLOCK_DEFS.filter(d => d.category === cat);
          const isCollapsed = collapsed[cat];
          return (
            <div key={cat} style={{ marginBottom: "0.25rem" }}>
              <button
                onClick={() => toggleCategory(cat)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.375rem 0.5rem",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)",
                  fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {cat}
                {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>

              {!isCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "0.25rem" }}>
                  {defs.map(def => (
                    <BlockItem key={def.type} def={def} onAdd={handleAdd} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: "0.75rem",
        borderTop: "1px solid var(--border)",
        fontSize: "0.7rem",
        color: "var(--text-subtle)",
        textAlign: "center",
      }}>
        Click a block to add it to the canvas
      </div>
    </aside>
  );
}

function BlockItem({ def, onAdd }: { def: BlockDef; onAdd: (d: BlockDef) => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => onAdd(def)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.5rem 0.625rem",
        background: hovered ? "var(--surface)" : "transparent",
        border: "1px solid",
        borderColor: hovered ? "var(--border)" : "transparent",
        borderRadius: "var(--radius)",
        cursor: "pointer",
        color: hovered ? "var(--text)" : "var(--text-muted)",
        fontSize: "0.82rem", fontWeight: 500,
        textAlign: "left",
        transition: "all var(--transition)",
      }}
    >
      <span style={{
        width: 28, height: 28, borderRadius: "var(--radius-sm)",
        background: hovered ? "var(--primary-light)" : "var(--surface)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        color: hovered ? "var(--primary)" : "var(--text-muted)",
        transition: "all var(--transition)",
      }}>
        {def.icon}
      </span>
      {def.label}
    </button>
  );
}
