"use client";

interface GlassLabelProps {
    htmlFor?: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
}

export function GlassLabel({ htmlFor, children, style }: GlassLabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                ...style,
            }}
        >
            {children}
        </label>
    );
}

interface GlassErrorProps {
    message: string;
}

export function GlassError({ message }: GlassErrorProps) {
    return (
        <p style={{
            margin: 0, fontSize: "0.8rem", color: "#fca5a5",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.18)",
            borderRadius: 8, padding: "8px 12px",
            lineHeight: 1.4,
        }}>
            {message}
        </p>
    );
}

interface GlassFieldProps {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}

/** Convenience wrapper: label + input stacked */
export function GlassField({ label, htmlFor, children }: GlassFieldProps) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <GlassLabel htmlFor={htmlFor}>{label}</GlassLabel>
            {children}
        </div>
    );
}
