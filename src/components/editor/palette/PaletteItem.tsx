"use client";

import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import type { PaletteBlockConfig } from "./paletteConfig";

interface PaletteItemProps {
    config: PaletteBlockConfig;
}

export function PaletteItem({ config }: PaletteItemProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `palette-${config.type}`,
        data: { type: config.type, fromPalette: true },
    });

    const Icon = config.icon;

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-grab active:cursor-grabbing transition-all select-none",
                isDragging
                    ? "opacity-40 scale-95 bg-white/8 border-indigo-500/40"
                    : "bg-white/3 border-white/6 hover:bg-white/7 hover:border-indigo-500/30"
            )}
        >
            <div className="w-7 h-7 rounded-md bg-indigo-500/15 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
                <div className="text-[13px] font-medium text-white/80 leading-none mb-0.5">
                    {config.label}
                </div>
                <div className="text-[10px] text-white/30 leading-none truncate">
                    {config.description}
                </div>
            </div>
        </div>
    );
}
