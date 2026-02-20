"use client";

import { Monitor, Tablet, Smartphone } from "lucide-react";
import { useEditorStore } from "@/stores/editorStore";
import { cn } from "@/lib/utils";

const MODES = [
    { key: "desktop" as const, icon: Monitor, label: "Desktop" },
    { key: "tablet" as const, icon: Tablet, label: "Tablet" },
    { key: "mobile" as const, icon: Smartphone, label: "Mobile" },
];

export function ViewportSwitcher() {
    const { viewMode, setViewMode } = useEditorStore();

    return (
        <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            {MODES.map(({ key, icon: Icon, label }) => (
                <button
                    key={key}
                    title={label}
                    onClick={() => setViewMode(key)}
                    className={cn(
                        "h-7 w-7 flex items-center justify-center rounded-md transition-all",
                        viewMode === key
                            ? "bg-indigo-500/20 text-indigo-400"
                            : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    )}
                >
                    <Icon size={14} />
                </button>
            ))}
        </div>
    );
}
