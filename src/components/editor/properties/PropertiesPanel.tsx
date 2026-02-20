"use client";

import { useEditorStore } from "@/stores/editorStore";
import type { Block } from "@/stores/editorStore";
import { MousePointerClick } from "lucide-react";
import { HeroProperties } from "./panels/HeroProperties";
import { TextProperties } from "./panels/TextProperties";
import { ImageProperties } from "./panels/ImageProperties";
import { ButtonProperties } from "./panels/ButtonProperties";
import { DividerProperties } from "./panels/DividerProperties";
import { ColumnsProperties } from "./panels/ColumnsProperties";

function findBlock(blocks: Block[], id: string): Block | undefined {
    for (const b of blocks) {
        if (b.id === id) return b;
        if (b.children) {
            const found = findBlock(b.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

export function PropertiesPanel() {
    const { page, selectedBlockId } = useEditorStore();

    const selectedBlock = selectedBlockId && page
        ? findBlock(page.content, selectedBlockId)
        : null;

    return (
        <aside className="w-[280px] shrink-0 flex flex-col bg-[#111113] border-l border-white/6 overflow-y-auto">
            {/* Header */}
            <div className="px-4 pt-4 pb-2 border-b border-white/6 shrink-0">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                        Properties
                    </p>
                    {selectedBlock && (
                        <span className="text-[10px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                            {selectedBlock.type}
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            {!selectedBlock ? (
                <div className="flex flex-col items-center justify-center flex-1 gap-3 text-white/20 px-4">
                    <MousePointerClick size={24} />
                    <p className="text-xs text-center leading-relaxed">
                        Click a block on the canvas to edit its properties
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    {selectedBlock.type === "hero" && (
                        <HeroProperties blockId={selectedBlock.id} />
                    )}
                    {selectedBlock.type === "text" && (
                        <TextProperties blockId={selectedBlock.id} />
                    )}
                    {selectedBlock.type === "image" && (
                        <ImageProperties blockId={selectedBlock.id} />
                    )}
                    {selectedBlock.type === "button" && (
                        <ButtonProperties blockId={selectedBlock.id} />
                    )}
                    {selectedBlock.type === "divider" && (
                        <DividerProperties blockId={selectedBlock.id} />
                    )}
                    {selectedBlock.type === "columns" && (
                        <ColumnsProperties blockId={selectedBlock.id} />
                    )}
                </div>
            )}
        </aside>
    );
}
