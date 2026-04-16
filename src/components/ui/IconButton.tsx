"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactElement;
  variant?: 'surface' | 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Premium IconButton Component
 * Encapsulates the logic for circular/rounded-square icon buttons.
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  variant = 'surface',
  size = 'md',
  className = "",
  style,
  ...props
}, ref) => {
  
  // Define sizes
  const sizeMap = {
    sm: { box: 28, icon: 16, radius: 8 },
    md: { box: 36, icon: 20, radius: 12 },
    lg: { box: 44, icon: 24, radius: 14 }
  };

  const { box, icon: iconSize, radius } = sizeMap[size];

  // Define variants logic with explicit typing to avoid DOM assignment errors
  const variantStyles: Record<string, React.CSSProperties> = {
    surface: {
      background: "var(--surface)",
      border: "1px solid var(--border)",
      color: "var(--text-muted)"
    },
    ghost: {
      background: "transparent",
      border: "1px solid transparent",
      color: "var(--text-muted)"
    },
    primary: {
      background: "var(--primary)",
      border: "none",
      color: "#ffffff" // Using hex to be safe
    },
    danger: {
      background: "rgba(239, 68, 68, 0.1)",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      color: "#ef4444"
    }
  };

  // Base style
  const baseStyle: React.CSSProperties = {
    width: box,
    height: box,
    borderRadius: radius,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: props.disabled ? "not-allowed" : "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    padding: 0,
    outline: "none",
    ...variantStyles[variant],
    ...style
  };

  // Handle icon cloning with safe property access
  const iconElement = icon as React.ReactElement<any>;
  const resizedIcon = React.cloneElement(iconElement, {
    style: { 
      width: iconSize, 
      height: iconSize, 
      ...(iconElement.props?.style || {}) 
    },
    className: cn("transition-colors", iconElement.props?.className || "")
  });

  return (
    <button
      ref={ref}
      style={baseStyle}
      className={cn("group hover-trigger", className)}
      onMouseEnter={e => {
        if (props.disabled) return;
        const target = e.currentTarget as HTMLElement;
        if (variant === 'surface' || variant === 'ghost') {
          target.style.background = "var(--surface-hover)";
          target.style.color = "var(--text)";
          target.style.borderColor = "var(--border-hover)";
        } else if (variant === 'primary') {
          target.style.background = "var(--primary-hover)";
        } else if (variant === 'danger') {
          target.style.background = "rgba(239, 68, 68, 0.2)";
        }
      }}
      onMouseLeave={e => {
        if (props.disabled) return;
        const target = e.currentTarget as HTMLElement;
        const vStyle = variantStyles[variant] as any; // Cast to any for safe DOM style assignment
        
        target.style.background = vStyle.background || "";
        target.style.color = vStyle.color || "";
        
        const borderStr = (vStyle.border as string) || "";
        if (borderStr.includes("transparent")) {
          target.style.borderColor = "transparent";
        } else if (borderStr === "none") {
          target.style.border = "none";
        } else {
          target.style.borderColor = "var(--border)";
        }
      }}
      {...props}
    >
      {resizedIcon}
    </button>
  );
});

IconButton.displayName = "IconButton";
