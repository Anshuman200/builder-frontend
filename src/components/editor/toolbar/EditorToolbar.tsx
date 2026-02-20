"use client";

import { Zap } from "lucide-react";
import Link from "next/link";
import { ViewportSwitcher } from "./ViewportSwitcher";
import { UndoRedo } from "./UndoRedo";
import { SaveButton } from "./SaveButton";
import { PublishButton } from "./PublishButton";
import { PageSettingsModal } from "./PageSettingsModal";
import { useEditorStore } from "@/stores/editorStore";

interface EditorToolbarProps {
    pageId: string;
    onSave: () => void;
}

export function EditorToolbar({ pageId, onSave }: EditorToolbarProps) {
    const { page } = useEditorStore();

    return (
        <header className="h-[52px] shrink-0 flex items-center justify-between px-4 gap-4 bg-black/90 backdrop-blur-xl border-b border-white/8 z-50">
            {/* Left: logo + page title */}
            <div className="flex items-center gap-3 min-w-0">
                <Link href="/" className="flex items-center gap-1.5 shrink-0 no-underline">
                    <div
                        className="w-6 h-6 rounded-md flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                    >
                        <Zap size={12} color="white" fill="white" />
                    </div>
                </Link>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-sm font-medium text-white/60 truncate max-w-[180px]">
                    {page?.title || "Untitled Page"}
                </span>
            </div>

            {/* Center: viewport switcher */}
            <div className="flex items-center">
                <ViewportSwitcher />
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
                <UndoRedo />
                <div className="h-4 w-px bg-white/10" />
                <PageSettingsModal />
                <SaveButton onSave={onSave} />
                <PublishButton pageId={pageId} />
            </div>
        </header>
    );
}
