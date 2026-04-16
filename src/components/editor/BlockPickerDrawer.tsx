"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { SectionsPanel, ElementsPanel, scrollToBlock } from "./PalettePanels";
import { XMarkIcon } from "@heroicons/react/24/outline";

export function BlockPickerDrawer() {
  const { blockPicker, closeBlockPicker, addBlockAtTarget, selectBlock } = useEditorStore();
  const [activeTab, setActiveTab] = React.useState<"sections" | "elements">("sections");

  // Sync active tab with preferred tab whenever the picker opens
  React.useEffect(() => {
    if (blockPicker.open && blockPicker.preferredTab) {
      setActiveTab(blockPicker.preferredTab);
    }
  }, [blockPicker.open, blockPicker.preferredTab]);

  if (!blockPicker.open) return null;

  const handleSelect = (block: any) => {
    if (blockPicker.target) {
      addBlockAtTarget(block, blockPicker.target);
      selectBlock(block.id);
      scrollToBlock(block.id);
      closeBlockPicker();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "80vh",
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border)",
        boxShadow: "0 -20px 80px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.15) inset",
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        animation: "slideUp 0.4s cubic-bezier(0.1, 0.9, 0.2, 1)",
        backdropFilter: "blur(60px) saturate(200%)",
        WebkitBackdropFilter: "blur(60px) saturate(200%)",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Centered Header */}
      <div style={{
        padding: "0 32px",
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center", // Centered content
        borderBottom: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        position: "relative"
      }}>
        <div style={{ display: "flex", gap: 32, height: "100%" }}>
          <button
            onClick={() => setActiveTab("sections")}
            style={{
              padding: "10px 0",
              fontSize: 15,
              fontWeight: 800,
              color: activeTab === "sections" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: `3px solid ${activeTab === "sections" ? "var(--primary)" : "transparent"}`,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
              letterSpacing: "0.02em"
            }}
          >
            SECTIONS
          </button>
          <button
            onClick={() => setActiveTab("elements")}
            style={{
              padding: "10px 0",
              fontSize: 15,
              fontWeight: 800,
              color: activeTab === "elements" ? "var(--primary)" : "var(--text-muted)",
              borderBottom: `3px solid ${activeTab === "elements" ? "var(--primary)" : "transparent"}`,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
              letterSpacing: "0.02em"
            }}
          >
            ELEMENTS
          </button>
        </div>

        <button
          onClick={closeBlockPicker}
          style={{
            position: "absolute",
            right: 24, top: "50%",
            transform: "translateY(-50%)",
            width: 36, height: 36,
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-muted)",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface-hover)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "var(--surface)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
        >
          <XMarkIcon style={{ width: 22, height: 22 }} />
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", justifyContent: "center", padding: "16px 24px" }}>
        <div style={{ width: "100%", maxWidth: 1600, height: "100%", display: "flex" }}>
          {activeTab === "sections" ? (
            <SectionsPanel onAdd={handleSelect} isGrid />
          ) : (
            <ElementsPanel onAdd={handleSelect} isGrid />
          )}
        </div>
      </div>

      {/* Overlay to close on click outside */}
      {blockPicker.open && (
        <div
          onClick={closeBlockPicker}
          style={{
            position: "fixed",
            inset: 0,
            bottom: "60vh",
            background: "rgba(0,0,0,0.3)",
            backdropFilter: "blur(8px)",
            zIndex: -1
          }}
        />
      )}
    </div>
  );
}
