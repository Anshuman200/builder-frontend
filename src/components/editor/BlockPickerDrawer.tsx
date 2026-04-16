"use client";

import * as React from "react";
import { useEditorStore } from "@/stores/editorStore";
import { SectionsPanel, ElementsPanel, scrollToBlock } from "./PalettePanels";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { IconButton } from "@/components/ui/IconButton";

export function BlockPickerDrawer() {
  const { blockPicker, closeBlockPicker, addBlockAtTarget, selectBlock } = useEditorStore();
  const [activeTab, setActiveTab] = React.useState<"sections" | "elements">("sections");
  const [shouldRender, setShouldRender] = React.useState(blockPicker.open);

  // Sync active tab with preferred tab whenever the picker opens
  React.useEffect(() => {
    if (blockPicker.open && blockPicker.preferredTab) {
      setActiveTab(blockPicker.preferredTab);
    }
  }, [blockPicker.open, blockPicker.preferredTab]);

  // Handle mounting/unmounting with animation delay
  React.useEffect(() => {
    if (blockPicker.open) {
      setShouldRender(true);
    } else if (shouldRender) {
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [blockPicker.open, shouldRender]);

  if (!shouldRender) return null;

  const handleSelect = (block: any) => {
    if (blockPicker.target) {
      const newBlock = addBlockAtTarget(block, blockPicker.target) as any;
      if (newBlock) {
        selectBlock(newBlock.id);
        scrollToBlock(newBlock.id);
      }
      closeBlockPicker();
    }
  };

  const isOpening = blockPicker.open;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        pointerEvents: "none" // Allow clicks to pass through to backdrop unless on drawer
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slideDown {
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>

      {/* Backdrop Overlay */}
      <div
        onClick={closeBlockPicker}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(12px)",
          animation: `${isOpening ? "fadeIn" : "fadeOut"} 0.4s forwards`,
          pointerEvents: "auto",
          cursor: "default"
        }}
      />

      {/* Actual Drawer */}
      <div
        style={{
          position: "relative",
          height: "80vh",
          background: "var(--bg-secondary)",
          borderTop: "1px solid var(--border)",
          boxShadow: "0 -20px 80px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.15) inset",
          display: "flex",
          flexDirection: "column",
          animation: `${isOpening ? "slideUp" : "slideDown"} 0.4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards`,
          backdropFilter: "blur(60px) saturate(200%)",
          WebkitBackdropFilter: "blur(60px) saturate(200%)",
          pointerEvents: "auto"
        }}
      >
        {/* Centered Header */}
        <div style={{
          padding: "0 32px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

          <IconButton
            icon={<XMarkIcon />}
            onClick={closeBlockPicker}
            style={{
              position: "absolute",
              right: 24, top: "50%",
              transform: "translateY(-50%)"
            }}
            title="Close"
          />
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
      </div>
    </div>
  );
}
