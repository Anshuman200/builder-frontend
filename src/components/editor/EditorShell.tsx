"use client";

import { EditorToolbar } from "./toolbar/EditorToolbar";
import { BlockPalette } from "./palette/BlockPalette";
import { EditorCanvas } from "./canvas/EditorCanvas";
import { PropertiesPanel } from "./properties/PropertiesPanel";
import { useSaveManager } from "./hooks/useSaveManager";
import { useEditorKeyboard } from "./hooks/useEditorKeyboard";

interface EditorShellProps {
    pageId: string;
}

export function EditorShell({ pageId }: EditorShellProps) {
    const { save } = useSaveManager(pageId);
    useEditorKeyboard();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <EditorToolbar pageId={pageId} onSave={save} />
            <div className="flex flex-1 overflow-hidden">
                <BlockPalette />
                <EditorCanvas />
                <PropertiesPanel />
            </div>
        </div>
    );
}
