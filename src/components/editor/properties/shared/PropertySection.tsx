"use client";

import { ChevronDown } from "lucide-react";

interface PropertySectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function PropertySection({ title, children, defaultOpen = true }: PropertySectionProps) {
    return (
        <details open={defaultOpen} className="group">
            <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none list-none border-b border-white/6 hover:bg-white/3 transition-colors">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    {title}
                </span>
                <ChevronDown
                    size={11}
                    className="text-white/25 group-open:rotate-180 transition-transform duration-200"
                />
            </summary>
            <div className="p-4 space-y-3">{children}</div>
        </details>
    );
}
