"use client";

import * as React from "react";
import { Popover } from "antd";
import { useEditorStore } from "@/stores/editorStore";
import { SectionsPanel, ElementsPanel, scrollToBlock } from "./PalettePanels";

export default function BlockPalette() {
  const [openPopover, setOpenPopover] = React.useState<"sections" | "elements" | null>(null);
  const activeDrag = useEditorStore(s => s.activeDrag);
  const addBlock = useEditorStore(s => s.addBlock);
  const selectBlock = useEditorStore(s => s.selectBlock);

  // Auto-close popover if any drag interaction starts
  React.useEffect(() => {
    if (activeDrag) setOpenPopover(null);
  }, [activeDrag]);

  const handleAdd = (block: any) => {
    const newBlock = addBlock(block) as any;
    if (newBlock) {
      selectBlock(newBlock.id);
      scrollToBlock(newBlock.id);
    }
    setOpenPopover(null);
  };

  return (
    <>
      <Popover
        open={openPopover === "sections"}
        onOpenChange={(open) => setOpenPopover(open ? "sections" : null)}
        trigger={"hover"}
        placement="bottomLeft"
        arrow={false}
        styles={{ content: { padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" } }}
        content={<div style={{ width: 480, height: 480 }}><SectionsPanel onAdd={handleAdd} /></div>}
      >
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, border: "none",
            background: openPopover === "sections" ? "var(--primary)" : "var(--surface)",
            color: openPopover === "sections" ? "#fff" : "var(--text)",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <span style={{ fontSize: 13 }}>🧩</span>
          Sections
        </button>
      </Popover>

      <Popover
        open={openPopover === "elements"}
        onOpenChange={(open) => setOpenPopover(open ? "elements" : null)}
        trigger="hover"
        placement="bottomLeft"
        arrow={false}
        styles={{ content: { padding: 0, borderRadius: 14, overflow: "hidden", background: "var(--bg-secondary)", border: "1px solid var(--border)", boxShadow: "0 16px 48px rgba(0,0,0,0.3)" } }}
        content={<div style={{ width: 280 }}><ElementsPanel onAdd={handleAdd} /></div>}
      >
        <button
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, border: "none",
            background: openPopover === "elements" ? "var(--primary)" : "var(--surface)",
            color: openPopover === "elements" ? "#fff" : "var(--text)",
            cursor: "pointer", fontSize: 12, fontWeight: 600,
            transition: "background 0.15s, color 0.15s",
          }}
        >
          <span style={{ fontSize: 13 }}>⚡</span>
          Elements
        </button>
      </Popover>
    </>
  );
}