import { type ReactNode, type CSSProperties, type ElementType } from "react";

interface ContainerProps {
    children: ReactNode;
    /** Max-width preset. Defaults to "lg" (1280px). */
    size?: "sm" | "md" | "lg" | "xl" | "full";
    /** Extra className */
    className?: string;
    /** Inline style overrides */
    style?: CSSProperties;
    /** Rendered HTML element. Defaults to "div". */
    as?: ElementType;
}

const MAX_WIDTHS: Record<NonNullable<ContainerProps["size"]>, string> = {
    sm: "640px",
    md: "768px",
    lg: "1280px",
    xl: "1440px",
    full: "100%",
};

/**
 * Reusable layout container.
 * Provides consistent max-width, horizontal centering, and horizontal padding.
 *
 * @example
 * <Container>…</Container>
 * <Container size="md" as="section">…</Container>
 */
export function Container({
    children,
    size = "lg",
    className,
    style,
    as: Tag = "div",
}: ContainerProps) {
    return (
        <Tag
            className={className}
            style={{
                maxWidth: MAX_WIDTHS[size],
                width: "100%",
                marginLeft: "auto",
                marginRight: "auto",
                paddingLeft: "1.25rem",
                paddingRight: "1.25rem",
                ...style,
            }}
        >
            {children}
        </Tag>
    );
}
