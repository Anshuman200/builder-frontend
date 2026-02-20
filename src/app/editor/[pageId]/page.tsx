"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { pagesApi } from "@/lib/api/client";
import { useEditorStore } from "@/stores/editorStore";
import { EditorShell } from "@/components/editor/EditorShell";
import { DEFAULT_THEME } from "@/stores/editorStore";
import type { EditorPage } from "@/stores/editorStore";
import { Loader2, AlertCircle } from "lucide-react";

// Seed a blank page for new pages or when API is unavailable
function createBlankPage(id: string): EditorPage {
    return {
        id,
        title: "Untitled Page",
        slug: "untitled-page",
        content: [],
        theme: DEFAULT_THEME,
        meta: {},
        status: "DRAFT",
    };
}

export default function EditorPage() {
    const params = useParams();
    const pageId = params.pageId as string;
    const { setPage, page } = useEditorStore();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["page", pageId],
        queryFn: () => pagesApi.get(pageId).then((r) => r.data),
        retry: 1,
        enabled: !!pageId,
    });

    useEffect(() => {
        if (data) {
            setPage(data);
        } else if (isError) {
            // Fall back to a blank page so the editor is still usable
            setPage(createBlankPage(pageId));
        }
    }, [data, isError, pageId, setPage]);

    if (isLoading && !page) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#09090b]">
                <div className="flex flex-col items-center gap-3 text-white/40">
                    <Loader2 size={28} className="animate-spin" />
                    <span className="text-sm">Loading editor…</span>
                </div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#09090b]">
                <div className="flex flex-col items-center gap-3 text-white/50">
                    <AlertCircle size={28} />
                    <span className="text-sm">Could not load page.</span>
                </div>
            </div>
        );
    }

    return <EditorShell pageId={pageId} />;
}
