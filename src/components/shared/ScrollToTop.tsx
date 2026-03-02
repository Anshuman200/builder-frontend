"use client";

import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { useEditorStore } from "@/stores/editorStore";

export default function ScrollToTop({ scrollContainerId }: { scrollContainerId?: string }) {
    const { page } = useEditorStore();
    const features = page?.theme?.features;
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!features?.scrollToTop) {
            setVisible(false);
            return;
        }

        // We listen to window scroll by default, but if scrollContainerId is provided, we listen to that instead (for EditorCanvas)
        const target = scrollContainerId ? document.getElementById(scrollContainerId) : window;
        if (!target) return;

        const handleScroll = (e: Event) => {
            const scrollY = (e.target as HTMLElement).scrollTop ?? window.scrollY;
            setVisible(scrollY > 200);
        };

        target.addEventListener("scroll", handleScroll);
        return () => target.removeEventListener("scroll", handleScroll);
    }, [features?.scrollToTop, scrollContainerId]);

    if (!features?.scrollToTop) return null;

    const position = features.scrollToTopPosition || "bottom-right";
    const color = features.scrollToTopColor || "#6366f1";
    const isLeft = position === "bottom-left";

    const scrollToTop = () => {
        const target = scrollContainerId ? document.getElementById(scrollContainerId) : window;
        if (target) {
            target.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    return (
        <button
            onClick={scrollToTop}
            style={{
                position: "fixed",
                bottom: "2rem",
                [isLeft ? "left" : "right"]: "2rem",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: color,
                color: "#ffffff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
                transform: visible ? "scale(1)" : "scale(0.8)",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                zIndex: 1000,
            }}
            title="Scroll to Top"
        >
            <ArrowUpIcon style={{ width: 24, height: 24 }} />
        </button>
    );
}
