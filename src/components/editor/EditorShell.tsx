"use client";

import type { Block } from "@/types";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { useEditorStore } from "@/stores/editorStore";
import { createBlock, injectProjectName } from "@/lib/config/blocks";
import { SECTION_TEMPLATES } from "@/lib/config/sections";
import EditorToolbar from "./EditorToolbar";
import BlockPalette from "./BlockPalette";
import EditorCanvas from "./EditorCanvas";
import PropertiesPanel from "./PropertiesPanel";
import { BlockRenderer } from "./blocks";
import { GlobalIconPicker } from "./GlobalIconPicker";
import { BlockPickerDrawer } from "./BlockPickerDrawer";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function EditorShell() {
  const {
    page, undo, redo, deleteBlock, duplicateBlock, selectedBlockId, historyIndex,
    history, addBlock, moveBlock, selectBlock, updateBlock,
    activeDrag, setActiveDrag, activeRouteId
  } = useEditorStore();
  
  const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
  const routeBlocks = activeRoute?.content || page?.content || [];
  
  const blocks = [
    ...(page?.globalBlocks?.header ? [page?.globalBlocks?.header] : []),
    ...routeBlocks,
    ...(page?.globalBlocks?.footer ? [page?.globalBlocks?.footer] : [])
  ];

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

    let targetId = overId;
    let position: "before" | "after" | "inside" = "after";
    let childProp: string | undefined = undefined;

    const isRootOnly = data.blockType === "header" || data.blockType === "footer";

    // 1. Map nested zones to parent block but track if it was an internal zone
    const colMatch = overId.match(/^col-([01])-(.+)$/);
    const gridMatch = overId.match(/^grid-([^-]+)-(.+)$/); // grid-{slotId}-{blockId}
    const childZoneMatch = overId.match(/^(?:hero|container|wave)-(.+)$/);

    let effectiveTargetId = overId;
    if (colMatch) effectiveTargetId = colMatch[2];
    else if (gridMatch) effectiveTargetId = gridMatch[2];
    else if (childZoneMatch) effectiveTargetId = childZoneMatch[1];

    // 2. Calculate position using the target block's rect (or the strip's rect)
    const overRect = over.rect;
    const activeRect = active.rect.current?.translated;

    if (overRect && activeRect) {
      const activeCenterY = activeRect.top + activeRect.height / 2;
      const relativeY = (activeCenterY - overRect.top) / overRect.height;

      const isContainer = ["wave", "hero", "container", "features"].includes(over.data.current?.blockType as string || "");

      if (colMatch || childZoneMatch) {
        // Use a 15/70/15 split on the strip itself to allow "breaking out" of nesting
        if (relativeY < 0.15) {
          position = "before";
          targetId = effectiveTargetId;
          childProp = undefined;
        } else if (relativeY > 0.85) {
          position = "after";
          targetId = effectiveTargetId;
          childProp = undefined;
        } else {
          position = "inside";
          if (colMatch) {
            targetId = colMatch[2];
            childProp = `col${colMatch[1]}`;
          } else if (gridMatch) {
            targetId = gridMatch[2];
            childProp = gridMatch[1]; // slot-0, slot-1, etc.
          } else if (childZoneMatch) {
            targetId = childZoneMatch[1];
            childProp = "childBlocks";
          }
        }
      } else if (relativeY < 0.20) {
        position = "before";
      } else if (relativeY > 0.80) {
        position = "after";
      } else {
        // Middle 60% of a standard block
        if (isContainer && !isRootOnly) {
          position = "inside";
          childProp = "childBlocks";
        } else {
          position = relativeY < 0.5 ? "before" : "after";
        }
      }
    }

    if (data?.type === "palette" && data.blockType) {
      const projectName = useEditorStore.getState().page?.title || "PageCraft";
      const rawBlock = createBlock(data.blockType);
      const newBlock = injectProjectName(rawBlock, projectName);
      addBlock(newBlock); // Adds to root

      // If it's not being dropped at the very end of the root canvas, move it to the precise target
      if (overId !== "canvas-root") {
        moveBlock(newBlock.id, targetId, position, childProp);
      }
      selectBlock(newBlock.id);
    } else if (data?.type === "section" && data.templateId) {
      const template = SECTION_TEMPLATES.find((t) => t.id === data.templateId);
      if (template) {
        const projectName = useEditorStore.getState().page?.title || "PageCraft";
        const rawSection = template.create();
        const newSectionRoot = injectProjectName(rawSection, projectName);
        addBlock(newSectionRoot);

        if (overId !== "canvas-root") {
          moveBlock(newSectionRoot.id, targetId, position, childProp);
        }
        selectBlock(newSectionRoot.id);
      }
    } else if (data?.type === "canvas") {
      if (active.id !== over.id) {
        // For root-level reordering, use arrayMove for correct positioning
        const { page, activeRouteId } = useEditorStore.getState();
        const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
        const contentArray = activeRoute?.content || page?.content || [];

        const oldIndex = contentArray.findIndex(b => b.id === active.id);
        const newIndex = contentArray.findIndex(b => b.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1 && !colMatch && !childZoneMatch) {
          // Both blocks are at root level (in the route content) — use arrayMove for correct sort
          if (page) {
            const newContent = arrayMove([...contentArray], oldIndex, newIndex);
            useEditorStore.setState((s) => {
              if (s.page) {
                const sActiveRoute = s.page.routes?.find(r => r.id === s.activeRouteId);
                if (sActiveRoute) {
                  sActiveRoute.content = newContent;
                } else {
                  s.page.content = newContent;
                }
                s.isDirty = true;
              }
            });
          }
        } else {
          // Nested reorder or header/footer movement attempted — use moveBlock
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
      if (meta && e.key === "d") {
        e.preventDefault();
        if (selectedBlockId) duplicateBlock(selectedBlockId);
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
          <PropertiesPanel />
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
      <BlockPickerDrawer />
    </DndContext>
  );
}
