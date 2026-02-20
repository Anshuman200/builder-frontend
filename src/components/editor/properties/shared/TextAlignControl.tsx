"use client";

import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextAlignControlProps {
    value: string;
    onChange: (value: string) => void;
}

const OPTIONS = [
    { value: "left", icon: AlignLeft },
    { value: "center", icon: AlignCenter },
    { value: "right", icon: AlignRight },
];

export function TextAlignControl({ value, onChange }: TextAlignControlProps) {
    return (
        <div className="flex gap-0.5 bg-white/4 rounded-md p-0.5">
            {OPTIONS.map(({ value: v, icon: Icon }) => (
                <button
                    key={v}
                    onClick={() => onChange(v)}
                    className={cn(
                        "flex-1 h-6 flex items-center justify-center rounded transition-all",
                        value === v
                            ? "bg-indigo-500/25 text-indigo-400"
                            : "text-white/30 hover:text-white/60"
                    )}
                >
                    <Icon size={12} />
                </button>
            ))}
        </div>
    );
}
