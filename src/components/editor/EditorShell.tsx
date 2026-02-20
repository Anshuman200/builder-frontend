"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import EditorToolbar from "./EditorToolbar";
import BlockPalette from "./BlockPalette";
import EditorCanvas from "./EditorCanvas";

export default function EditorShell() {
  const { undo, redo, deleteBlock, selectedBlockId, historyIndex, history } = useEditorStore();

  // Global keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if (meta && e.shiftKey && e.key === "z") {
        e.preventDefault();
        redo();
        return;
      }
      if (!isInput && selectedBlockId && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, deleteBlock, selectedBlockId, historyIndex, history]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <EditorToolbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <BlockPalette />
        <EditorCanvas />
      </div>
    </div>
  );
}
