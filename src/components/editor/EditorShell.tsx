"use client";

import type { Block } from "@/@Types";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/editorStore";
import { createBlock } from "@/lib/config/blocks";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import EditorToolbar from "./EditorToolbar";
import BlockPalette from "./BlockPalette";
import EditorCanvas from "./EditorCanvas";
import PropertiesPanel from "./PropertiesPanel";
import { BlockRenderer } from "./blocks";
import { GlobalIconPicker } from "./GlobalIconPicker";

export default function EditorShell() {
  const { page, undo, redo, deleteBlock, selectedBlockId, historyIndex, history, addBlock, moveBlock, selectBlock, updateBlock } =
    useEditorStore();
  const blocks = page?.content ?? [];

  // ── Active drag state (for DragOverlay ghost) ──────────────────────────────
  const [activeDrag, setActiveDrag] = useState<{
    type: "palette" | "canvas" | "section";
    blockType?: string;
    templateId?: string;
    block?: Block;
  } | null>(null);

  // ── Sensors ────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Recursive block finder (searches col0/col1/childBlocks) ───────────────
  function findBlockById(bs: Block[], id: string): Block | undefined {
    for (const b of bs) {
      if (b.id === id) return b;
      const col0 = b.props.col0 as Block[] | undefined;
      const col1 = b.props.col1 as Block[] | undefined;
      const child = b.props.childBlocks as Block[] | undefined;
      const found =
        (col0 && findBlockById(col0, id)) ||
        (col1 && findBlockById(col1, id)) ||
        (child && findBlockById(child, id));
      if (found) return found;
    }
  }

  // ── Drag handlers ──────────────────────────────────────────────────────────
  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type: "palette" | "canvas" | "section"; blockType?: string; templateId?: string };
    if (data?.type === "palette") {
      setActiveDrag({ type: "palette", blockType: data.blockType });
    } else if (data?.type === "section") {
      setActiveDrag({ type: "section", templateId: data.templateId });
    } else {
      const block = findBlockById(blocks, event.active.id as string);
      setActiveDrag({ type: "canvas", block });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as { type: "palette" | "canvas" | "section"; blockType?: string; templateId?: string };
    const overId = over.id as string;

    // Determine target location params based on dropzone IDs
    const colMatch = overId.match(/^col-([01])-(.+)$/);
    const childZoneMatch = overId.match(/^(?:hero|container|wave)-(.+)$/);

    const isRootOnly = data.type === "section" || data.blockType === "header" || data.blockType === "footer" || data.blockType === "hero" || data.blockType === "features";

    let targetId = overId;
    let position: "before" | "after" | "inside" = "after";
    let childProp: string | undefined = undefined;

    // Determine before/after based on the dragged item's center point vs the target's center
    // We always compute this because root-only elements need it even when hovered over a container/hero
    const overRect = over.rect;
    const activeRect = active.rect.current?.translated;
    if (overRect && activeRect) {
      const overCenterY = overRect.top + overRect.height / 2;
      const activeCenterY = activeRect.top + activeRect.height / 2;
      position = activeCenterY < overCenterY ? "before" : "after";
    }

    if (colMatch) {
      targetId = colMatch[2];
      if (!isRootOnly) {
        position = "inside";
        childProp = `col${colMatch[1]}`;
      }
    } else if (childZoneMatch) {
      targetId = childZoneMatch[1];
      if (!isRootOnly) {
        position = "inside";
        childProp = "childBlocks";
      }
    }

    if (data?.type === "palette" && data.blockType) {
      const newBlock = createBlock(data.blockType);
      addBlock(newBlock); // Adds to root

      // If it's not being dropped at the very end of the root canvas, move it to the precise target
      if (overId !== "canvas-root") {
        moveBlock(newBlock.id, targetId, position, childProp);
      }
      selectBlock(newBlock.id);
    } else if (data?.type === "section" && data.templateId) {
      const template = SECTION_TEMPLATES.find((t) => t.id === data.templateId);
      if (template) {
        const newSectionRoot = template.create();
        addBlock(newSectionRoot);

        if (overId !== "canvas-root") {
          moveBlock(newSectionRoot.id, targetId, position, childProp);
        }
        selectBlock(newSectionRoot.id);
      }
    } else if (data?.type === "canvas") {
      if (active.id !== over.id) {
        // For root-level reordering, use arrayMove for correct positioning
        const blockIds = blocks.map(b => b.id);
        const oldIndex = blockIds.indexOf(active.id as string);
        const newIndex = blockIds.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1 && !colMatch && !childZoneMatch) {
          // Both blocks are at root level — use arrayMove for correct sort
          const { page } = useEditorStore.getState();
          if (page) {
            const newContent = arrayMove([...page.content], oldIndex, newIndex);
            useEditorStore.setState((s) => {
              if (s.page) {
                s.page.content = newContent;
                s.isDirty = true;
              }
            });
          }
        } else {
          // Nested reorder — use moveBlock
          moveBlock(active.id as string, targetId, position, childProp);
        }
      }
    }
  }

  // ── Global keyboard shortcuts ──────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && !e.shiftKey && e.key === "z") { e.preventDefault(); undo(); return; }
      if (meta && e.shiftKey && e.key === "z") { e.preventDefault(); redo(); return; }
      if (!isInput && selectedBlockId && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        deleteBlock(selectedBlockId);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, deleteBlock, selectedBlockId, historyIndex, history]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      autoScroll={{
        enabled: true,
        acceleration: 15,
        threshold: { x: 0.15, y: 0.15 },
        canScroll(element) {
          return element.id === "editor-scroll-container";
        },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <EditorToolbar />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <BlockPalette />
          <div
            className="flex-1 flex flex-col overflow-hidden bg-gray-100 p-2 border-2 border-dashed"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                selectBlock(null);
              }
            }}
          >
            <EditorCanvas />
          </div>
          <PropertiesPanel />
        </div>
      </div>

      {/* Drag Overlay — ghost preview while dragging */}
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeDrag?.type === "palette" && activeDrag.blockType && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px", background: "#6366f1", color: "#fff",
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
            pointerEvents: "none",
            textTransform: "capitalize",
          }}>
            {activeDrag.blockType}
          </div>
        )}
        {activeDrag?.type === "section" && activeDrag.templateId && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 16px", background: "#f8fafc", border: "2px solid #6366f1", color: "#1e293b",
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(99,102,241,0.2)",
            pointerEvents: "none",
          }}>
            {SECTION_TEMPLATES.find(t => t.id === activeDrag.templateId)?.name || "Section"}
          </div>
        )}
        {activeDrag?.type === "canvas" && activeDrag.block && (
          <div style={{
            background: "#fff", border: "2px solid #6366f1",
            borderRadius: 6, opacity: 0.9, pointerEvents: "none", minWidth: 200,
          }}>
            <BlockRenderer block={activeDrag.block} />
          </div>
        )}
      </DragOverlay>
      <GlobalIconPicker />
    </DndContext>
  );
}
