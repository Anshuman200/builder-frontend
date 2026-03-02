"use client";

import { useEditorStore } from "@/stores/editorStore";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useContext } from "react";
import { PreviewContext } from "@/components/editor/blocks";

export default function ThemeSwitcher() {
    const { page, updateTheme } = useEditorStore();
    const [mounted, setMounted] = useState(false);
    const isPreview = useContext(PreviewContext);

    // The theme mode is stored globally in the editor store
    const themeMode = page?.theme?.mode || "light";
    const features = page?.theme?.features;
    const showSwitcher = features?.themeSwitcher ?? true;
    const pos = features?.themeSwitcherPosition || "bottom-left";

    // Prevent hydration errors by only rendering the correct icon after mount
    useEffect(() => {
        setMounted(true);
        // On mount, check if user has a persisted theme override
        try {
            const savedTheme = localStorage.getItem("pagecraft_theme");
            if (savedTheme && (savedTheme === "light" || savedTheme === "dark") && savedTheme !== themeMode) {
                updateTheme({ mode: savedTheme });
            }
        } catch (e) { }
    }, []);

    // Sync the `dark` class to the HTML element for preview pages only
    // In the editor, dark class is scoped to the canvas wrapper instead
    useEffect(() => {
        if (!isPreview) return;
        if (themeMode === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        return () => {
            document.documentElement.classList.remove("dark");
        };
    }, [themeMode, isPreview]);

    const toggleTheme = () => {
        const newMode = themeMode === "light" ? "dark" : "light";
        try {
            localStorage.setItem("pagecraft_theme", newMode);
        } catch (e) { }
        updateTheme({ mode: newMode });
    };

    if (!mounted) return null;

    // Hide in preview if toggled off in global settings
    if (isPreview && !showSwitcher) return null;

    return (
        <button
            onClick={toggleTheme}
            style={{
                position: "fixed",
                bottom: "24px",
                ...(pos === "bottom-left" ? { left: "24px" } : { right: "24px" }),
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--theme-switcher-bg, #ffffff)",
                color: "var(--theme-switcher-color, #0f172a)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)",
                border: "1px solid var(--border)",
                cursor: "pointer",
                transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, color 0.3s ease",
                opacity: (!isPreview && !showSwitcher) ? 0.35 : 1, // Dim but keep visible in Editor so user knows it exists
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1) rotate(5deg)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
            title={`Switch to ${themeMode === "light" ? "Dark" : "Light"} Mode`}
        >
            {themeMode === "light" ? (
                <MoonIcon style={{ width: 22, height: 22 }} />
            ) : (
                <SunIcon style={{ width: 24, height: 24 }} />
            )}
        </button>
    );
}
