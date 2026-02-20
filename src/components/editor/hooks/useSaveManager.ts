"use client";

import { useCallback, useEffect } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { pagesApi } from "@/lib/api/client";

export function useSaveManager(pageId: string) {
    const { page, isDirty, setIsSaving, markClean } = useEditorStore();

    const save = useCallback(async () => {
        if (!page || !isDirty) return;
        setIsSaving(true);
        try {
            await pagesApi.update(pageId, {
                title: page.title,
                content: page.content,
                theme: page.theme,
                meta: page.meta,
            });
            markClean();
        } catch {
            // Silent fail — could add toast notification here
        } finally {
            setIsSaving(false);
        }
    }, [page, isDirty, pageId, setIsSaving, markClean]);

    // Autosave: debounce 2s after any change
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(save, 2000);
        return () => clearTimeout(timer);
    }, [isDirty, page, save]);

    return { save };
}
