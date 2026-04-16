"use client";

import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange?: (value: string) => void;
  onClear?: () => void;
  containerStyle?: React.CSSProperties;
  width?: string | number;
}

/**
 * Premium SearchInput Component
 * Standardizes search UI across the entire platform.
 * 
 * Note: onChange returns the string value directly for convenience.
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(({
  onChange,
  onClear,
  containerStyle,
  width = "clamp(160px, 20vw, 300px)",
  style,
  className = "",
  placeholder = "Search...",
  ...props
}, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div 
      className={className} 
      style={{ 
        position: "relative", 
        width: className?.includes("w-full") ? "100%" : width, 
        ...containerStyle 
      }}
    >
      <MagnifyingGlassIcon 
        className="absolute left-[12px] top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
        style={{ color: "var(--text-muted)", opacity: 0.6 }} 
      />
      <input
        ref={ref}
        placeholder={placeholder}
        onChange={handleChange}
        style={{ 
          width: "100%", 
          boxSizing: "border-box", 
          background: "var(--surface)", 
          border: "1px solid var(--border)", 
          borderRadius: 12, 
          padding: `8px ${onClear && props.value ? '40px' : '12px'} 8px 38px`, 
          fontSize: 14, 
          color: "var(--text)", 
          outline: "none", 
          transition: "all 0.2s",
          ...style
        }}
        {...props}
      />
      {onClear && props.value && (
        <button
          type="button"
          onClick={onClear}
          style={{ 
            position: "absolute", 
            right: 12, 
            top: "50%", 
            transform: "translateY(-50%)", 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            color: "var(--text-muted)", 
            display: "flex", 
            alignItems: "center", 
            padding: 0,
            opacity: 0.8
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.8")}
        >
          <XMarkIcon style={{ width: 16, height: 16 }} />
        </button>
      )}
    </div>
  );
});

SearchInput.displayName = "SearchInput";
