interface ControlRowProps {
    label: string;
    children: React.ReactNode;
}

export function ControlRow({ label, children }: ControlRowProps) {
    return (
        <div className="flex items-center gap-3">
            <label className="text-[11px] text-white/35 w-[72px] shrink-0 leading-tight">
                {label}
            </label>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}
