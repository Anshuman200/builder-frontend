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
import { ActivePathContext, PreviewContext } from "./blocks/shared";
import { applyThemeToElement, DEFAULT_THEME } from "@/lib/utils/theme";
import { GlobalIconPicker } from "./GlobalIconPicker";
import { GlobalMediaPicker } from "./GlobalMediaPicker";
import { BlockPickerDrawer } from "./BlockPickerDrawer";
import { TemplatePickerDrawer } from "./TemplatePickerDrawer";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function EditorShell() {
  const {
    page, undo, redo, deleteBlock, duplicateBlock, selectedBlockId, historyIndex,
    history, addBlock, moveBlock, selectBlock, updateBlock,
    activeDrag, setActiveDrag, activeRouteId
  } = useEditorStore();
  
  const [draggedWidth, setDraggedWidth] = useState<number | string>("auto");
  const [draggedHeight, setDraggedHeight] = useState<number | string>("auto");

  const activeRoute = page?.routes?.find(r => r.id === activeRouteId);
  const routeBlocks = useMemo(() => activeRoute?.content || page?.content || [], [activeRoute, page]);
  const activeRoutePath = activeRoute?.path || "/";

  const blocks = useMemo(() => [
    ...(page?.globalBlocks?.header ? [page?.globalBlocks?.header] : []),
    ...routeBlocks,
    ...(page?.globalBlocks?.footer ? [page?.globalBlocks?.footer] : [])
  ], [page?.globalBlocks, routeBlocks]);

  // ── Sensors ────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function findBlockById(bs: Block[], id: string): Block | undefined {
    const stack = [...bs];
    while (stack.length > 0) {
      const b = stack.pop();
      if (!b) continue;
      if (b.id === id) return b;

      if (b.children?.length) stack.push(...b.children);

      const p = b.props || {};
      for (const key in p) {
        const val = p[key];
        if (Array.isArray(val) && val.length > 0) {
          for (const item of val) {
            if (!item || typeof item !== "object") continue;
            if ("id" in item && "type" in item) {
              stack.push(item as Block);
            } else if ("blocks" in item && Array.isArray(item.blocks)) {
              stack.push(...(item.blocks as Block[]));
            }
          }
        }
      }
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as { type: "palette" | "canvas" | "section"; blockType?: string; templateId?: string };
    if (data?.type === "palette") {
      setActiveDrag({ type: "palette", blockType: data.blockType });
    } else if (data?.type === "section") {
      setActiveDrag({ type: "section", templateId: data.templateId });
    } else {
      const rect = event.active.rect.current.initial;
      if (rect) {
        setDraggedWidth(rect.width);
        setDraggedHeight(rect.height);
      }
      setActiveDrag({ type: "canvas", blockId: event.active.id as string });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDrag(null);
    setDraggedWidth("auto");
    setDraggedHeight("auto");
    const { active, over } = event;
    if (!over) return;

    const data = active.data.current as { type: "palette" | "canvas" | "section"; blockType?: string; templateId?: string };
    const overId = over.id as string;

    let targetId = overId;
    let position: "before" | "after" | "inside" | "replace" = "after";
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
        } else if (relativeY > 0.3 && relativeY < 0.7 && !colMatch) {
          position = "replace";
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
          // Provide a 40% center zone for swapping blocks
          if (relativeY >= 0.3 && relativeY <= 0.7) {
            position = "replace";
          } else {
            position = relativeY < 0.5 ? "before" : "after";
          }
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
        const movePos = position === "replace" ? "after" : position;
        moveBlock(newBlock.id, targetId, movePos, childProp);
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
          const movePos = position === "replace" ? "after" : position;
          moveBlock(newSectionRoot.id, targetId, movePos, childProp);
        }
        selectBlock(newSectionRoot.id);
      }
    } else if (data?.type === "canvas") {
      if (active.id !== over.id) {
        if (position === "replace") {
          useEditorStore.getState().swapBlocks(active.id as string, over.id as string);
          return;
        }

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
        {activeDrag?.type === "canvas" && activeDrag.blockId && (
          <div
            ref={(el) => {
              if (el) applyThemeToElement(el, page?.theme || DEFAULT_THEME);
            }}
            className={page?.theme?.mode === "dark" ? "dark" : ""}
            style={{
              background: "var(--background, #fff)",
              color: "var(--text, #1e293b)",
              border: "2px solid var(--primary, #6366f1)",
              borderRadius: 12,
              opacity: 0.95,
              pointerEvents: "none",
              width: draggedWidth,
              height: draggedHeight,
              overflow: "hidden",
              boxShadow: "0 12px 48px rgba(0,0,0,0.25)",
              transform: "none",
              transformOrigin: "center top",
            }}
          >
            <ActivePathContext.Provider value={activeRoutePath}>
              <PreviewContext.Provider value={true}>
                {(() => {
                  const draggedBlock = findBlockById(blocks, activeDrag.blockId!);
                  return draggedBlock ? <BlockRenderer block={draggedBlock} /> : null;
                })()}
              </PreviewContext.Provider>
            </ActivePathContext.Provider>
          </div>
        )}
      </DragOverlay>
      <GlobalIconPicker />
      <GlobalMediaPicker />
      <BlockPickerDrawer />
      <TemplatePickerDrawer />
    </DndContext>
  );
}
