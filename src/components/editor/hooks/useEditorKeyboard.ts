"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";

export function useEditorKeyboard() {
    const { undo, redo, deleteBlock, selectedBlockId } = useEditorStore();

    useEffect(() => {
        function handler(e: KeyboardEvent) {
            // Ignore when typing in form fields
            const target = e.target as HTMLElement;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target.isContentEditable
            ) {
                return;
            }

            const isMac = navigator.platform.toUpperCase().includes("MAC");
            const ctrl = isMac ? e.metaKey : e.ctrlKey;

            if (ctrl && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
                return;
            }
            if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
                e.preventDefault();
                redo();
                return;
            }
            if ((e.key === "Delete" || e.key === "Backspace") && selectedBlockId) {
                e.preventDefault();
                deleteBlock(selectedBlockId);
            }
        }

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [undo, redo, deleteBlock, selectedBlockId]);
}
