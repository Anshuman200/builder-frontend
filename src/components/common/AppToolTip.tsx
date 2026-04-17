"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface TooltipProps {
    children: React.ReactNode;
    title: React.ReactNode;
    placement?: "top" | "bottom" | "left" | "right";
    delay?: number;
    className?: string;
}

const AppToolTip = ({
    children,
    title,
    placement = "top",
    delay = 100,
    className,
}: TooltipProps) => {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const triggerRef = useRef<HTMLSpanElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 📍 Position calculation
    const updatePosition = () => {
        const trigger = triggerRef.current;
        const tooltip = tooltipRef.current;
        if (!trigger || !tooltip) return;

        const rect = trigger.getBoundingClientRect();
        const ttRect = tooltip.getBoundingClientRect();

        let top = 0;
        let left = 0;

        switch (placement) {
            case "top":
                top = rect.top - ttRect.height - 8;
                left = rect.left + rect.width / 2 - ttRect.width / 2;
                break;
            case "bottom":
                top = rect.bottom + 8;
                left = rect.left + rect.width / 2 - ttRect.width / 2;
                break;
            case "left":
                top = rect.top + rect.height / 2 - ttRect.height / 2;
                left = rect.left - ttRect.width - 8;
                break;
            case "right":
                top = rect.top + rect.height / 2 - ttRect.height / 2;
                left = rect.right + 8;
                break;
        }

        setCoords({
            top: Math.max(8, top),
            left: Math.max(8, left),
        });
    };

    // 📡 Update on open
    useEffect(() => {
        if (!open) return;

        updatePosition();

        const handleScroll = () => updatePosition();
        const handleResize = () => updatePosition();

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [open, placement]);

    // ⏱ Delay handling
    const show = () => {
        timeoutRef.current = setTimeout(() => setOpen(true), delay);
    };

    const hide = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setOpen(false);
    };

    return (
        <>
            <span
                ref={triggerRef}
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                className="inline-flex"
            >
                {children}
            </span>

            {open &&
                createPortal(
                    <div
                        ref={tooltipRef}
                        style={{
                            position: "fixed",
                            top: coords.top,
                            left: coords.left,
                            zIndex: 9999,
                        }}
                        className={cn(
                            "px-3 py-1.5 text-sm rounded-sm shadow-lg",
                            "bg-[var(--surface)] text-[var(--text)]",
                            "backdrop-blur-md",
                            "pointer-events-none",
                            "transition-opacity duration-150",
                            className
                        )}
                    >
                        {title}
                    </div>,
                    document.body
                )}
        </>
    );
};
export default AppToolTip;