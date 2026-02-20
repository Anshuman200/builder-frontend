"use client";

import { useEditorStore } from "@/stores/editorStore";

const VIEWPORT_CONFIG = {
    desktop: { width: "100%", maxWidth: "none", label: "" },
    tablet: { width: "768px", maxWidth: "768px", label: "iPad · 768px" },
    mobile: { width: "390px", maxWidth: "390px", label: "iPhone · 390px" },
} as const;

export function ViewportFrame({ children }: { children: React.ReactNode }) {
    const { viewMode } = useEditorStore();
    const config = VIEWPORT_CONFIG[viewMode];
    const isConstrained = viewMode !== "desktop";

    return (
        <div className="flex-1 overflow-auto bg-[#09090b] flex flex-col items-center py-6 px-4">
            {isConstrained && (
                <div className="mb-3 text-[10px] font-mono text-white/25 tracking-widest uppercase">
                    {config.label}
                </div>
            )}
            <div
                style={{ width: config.width, maxWidth: config.maxWidth }}
                className="bg-white min-h-[600px] transition-all duration-300 rounded-lg overflow-hidden shadow-2xl"
            >
                {children}
            </div>
        </div>
    );
}
