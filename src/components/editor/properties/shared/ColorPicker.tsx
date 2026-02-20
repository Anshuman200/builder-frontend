"use client";

interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value.startsWith("#") ? value : "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-7 h-7 rounded-md cursor-pointer border border-white/10 bg-transparent shrink-0"
                title={label}
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-md px-2 py-1 text-xs text-white/70 font-mono outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-colors min-w-0"
                placeholder="#000000"
            />
        </div>
    );
}
