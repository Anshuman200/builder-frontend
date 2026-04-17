"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactElement<IconProps>;
  variant?: "surface" | "ghost" | "primary" | "danger";
  size?: "sm" | "md" | "lg";
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = "surface", size = "md", className, ...props }, ref) => {

    // Size mapping → Tailwind classes
    const sizeMap = {
      sm: "w-7 h-7 rounded-lg",
      md: "w-9 h-9 rounded-xl",
      lg: "w-11 h-11 rounded-2xl",
    };

    const iconSizeMap = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    // Variant styles (Tailwind + CSS vars)
    const variantMap = {
      surface: `
        bg-[var(--surface)] 
        border border-[var(--border)] 
        text-[var(--text-muted)]
        hover:bg-gray-500/10
        hover:text-[var(--text)]
        hover:border-[var(--border)]
      `,
      ghost: `
        bg-transparent 
        border border-transparent 
        text-[var(--text-muted)]
        hover:bg-[var(--surface-hover)]
        hover:text-[var(--text)]
        hover:border-[var(--border)]
      `,
      primary: `
        bg-[var(--primary)] 
        text-white 
        border-none
        hover:bg-[var(--primary-hover)]
      `,
      danger: `
        bg-red-500/10 
        text-red-500 
        border border-red-500/20
        hover:bg-red-500/20
      `,
    };

    const iconElement = icon as React.ReactElement<any>;
    const resizedIcon = React.cloneElement(iconElement, {
      className: cn(
        "transition-colors",
        iconSizeMap[size],
        iconElement.props?.className
      ),
    });

    return (
      <button
        ref={ref}
        className={cn(
          "flex items-center justify-center transition-all duration-200 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
          sizeMap[size],
          variantMap[variant],
          className
        )}
        {...props}
      >
        {resizedIcon}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";