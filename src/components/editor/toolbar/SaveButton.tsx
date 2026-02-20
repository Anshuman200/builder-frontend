"use client";

import { Check, Loader2, Circle } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

interface SaveButtonProps {
    onSave: () => void;
}

export function SaveButton({ onSave }: SaveButtonProps) {
    const { isDirty, isSaving } = useEditorStore();

    return (
        <button
            onClick={onSave}
            disabled={isSaving || !isDirty}
            className={cn(
                "flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium transition-all border",
                isDirty && !isSaving
                    ? "text-white/80 bg-white/8 border-white/12 hover:bg-white/12"
                    : "text-white/30 bg-transparent border-white/6 cursor-default"
            )}
        >
            {isSaving ? (
                <>
                    <Loader2 size={12} className="animate-spin" />
                    Saving…
                </>
            ) : isDirty ? (
                <>
                    <Circle size={6} className="fill-amber-400 text-amber-400" />
                    Save
                </>
            ) : (
                <>
                    <Check size={12} />
                    Saved
                </>
            )}
        </button>
    );
}
