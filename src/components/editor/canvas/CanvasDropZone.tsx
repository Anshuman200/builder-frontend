"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasBlock } from "./CanvasBlock";
import type { Block } from "@/stores/editorStore";

interface CanvasDropZoneProps {
    blocks: Block[];
}

export function CanvasDropZone({ blocks }: CanvasDropZoneProps) {
    const { setNodeRef, isOver } = useDroppable({ id: "canvas-root" });
    const blockIds = blocks.map((b) => b.id);

    return (
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div
                ref={setNodeRef}
                className={cn(
                    "min-h-[600px] transition-all",
                    isOver && blocks.length > 0 && "bg-indigo-500/3"
                )}
            >
                {blocks.length === 0 ? (
                    <div
                        className={cn(
                            "flex flex-col items-center justify-center h-[400px] gap-4 transition-all",
                            isOver
                                ? "bg-indigo-50 border-2 border-dashed border-indigo-400"
                                : "border-2 border-dashed border-gray-200"
                        )}
                    >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <LayoutTemplate size={22} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500">
                                {isOver ? "Drop to add block" : "Your canvas is empty"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                Drag blocks from the left panel
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {blocks.map((block) => (
                            <CanvasBlock key={block.id} block={block} />
                        ))}
                        {/* Drop target at end of list */}
                        {isOver && (
                            <div className="h-1 bg-indigo-500 rounded-full mx-4 my-1" />
                        )}
                    </>
                )}
            </div>
        </SortableContext>
    );
}
