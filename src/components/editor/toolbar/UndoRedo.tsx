"use client";

import { Undo2, Redo2 } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

export function UndoRedo() {
    const { undo, redo, historyIndex, history } = useEditorStore();
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <div className="flex items-center gap-1">
            <button
                title="Undo (⌘Z)"
                onClick={undo}
                disabled={!canUndo}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    canUndo
                        ? "text-white/60 hover:text-white hover:bg-white/8"
                        : "text-white/20 cursor-not-allowed"
                )}
            >
                <Undo2 size={14} />
            </button>
            <button
                title="Redo (⌘⇧Z)"
                onClick={redo}
                disabled={!canRedo}
                className={cn(
                    "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                    canRedo
                        ? "text-white/60 hover:text-white hover:bg-white/8"
                        : "text-white/20 cursor-not-allowed"
                )}
            >
                <Redo2 size={14} />
            </button>
        </div>
    );
}
