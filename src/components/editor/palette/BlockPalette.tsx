"use client";

import { PALETTE_BLOCKS } from "./paletteConfig";
import { PaletteItem } from "./PaletteItem";

export function BlockPalette() {
    return (
        <aside className="w-[240px] shrink-0 flex flex-col bg-[#111113] border-r border-white/6 overflow-y-auto">
            <div className="px-4 pt-4 pb-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                    Blocks
                </p>
            </div>
            <div className="flex flex-col gap-1.5 px-3 pb-4">
                {PALETTE_BLOCKS.map((config) => (
                    <PaletteItem key={config.type} config={config} />
                ))}
            </div>
        </aside>
    );
}
